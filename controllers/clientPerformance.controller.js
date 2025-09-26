const mongoose = require('mongoose');
const ClientPerformance = require('../models/clientPerformance');
const Clients = require('../models/clients');

// Validation functions
const validateMonth = (month) => {
  if (!month) return { isValid: false, message: 'Month is required' };
  
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return { isValid: false, message: 'Month must be in YYYY-MM format (e.g., 2024-01)' };
  }
  
  const monthPart = parseInt(month.split('-')[1]);
  if (monthPart < 1 || monthPart > 12) {
    return { isValid: false, message: 'Month must be between 01-12' };
  }
  
  // Check if month is not in the future
  const currentDate = new Date();
  const currentWeek = currentDate.toISOString().slice(0, 7);
  if (month > currentWeek) {
    return { isValid: false, message: 'Month cannot be in the future' };
  }
  
  return { isValid: true };
};

const validateWeek = (week) => {
  if (!week) return { isValid: false, message: 'Week is required' };
  
  const weekNum = parseInt(week);
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 4) {
    return { isValid: false, message: 'Week must be a number between 1 and 4' };
  }
  
  return { isValid: true };
};

const validateMonthWeekCombination = (month, week) => {
  const monthValidation = validateMonth(month);
  if (!monthValidation.isValid) return monthValidation;
  
  const weekValidation = validateWeek(week);
  if (!weekValidation.isValid) return weekValidation;
  
  // Additional validation: Check if the week makes sense for the month
  const monthDate = new Date(month + '-01');
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  
  const weekStartDay = (week - 1) * 7 + 1;
  const weekEndDay = week * 7;
  
  if (weekStartDay > daysInMonth) {
    return { 
      isValid: false, 
      message: `Week ${week} does not exist in ${month}. This month has ${daysInMonth} days.` 
    };
  }
  
  return { isValid: true };
};

// Get client overview dashboard
const getClientOverviewDashboard = async (req, res) => {
  try {
    const { 
      clientId, 
      search, 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build match stage for aggregation
    let matchStage = {};
    
    // Filter by specific client
    if (clientId) {
      matchStage.clientId = new mongoose.Types.ObjectId(clientId);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      matchStage.status = status;
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          'client.name': { $regex: search, $options: 'i' }
        }
      });
    }

    // Group by clientId and merge all documents
    pipeline.push({
      $group: {
        _id: '$clientId',
        client: { $first: '$client' },
        // Get all weeks data for comparison
        weeksData: {
          $push: {
            month: '$month',
            week: '$week',
            weekIdentifier: { $concat: ['$month', '-W', { $toString: '$week' }] },
            metaSpend: { $ifNull: ['$metaAdsMetrics.spentAmount', 0] },
            googleSpend: { $ifNull: ['$googleAdsMetrics.spentAmount', 0] },
            conversions: { $ifNull: ['$googleAdsMetrics.conversions', 0] },
            clicks: { $ifNull: ['$googleAdsMetrics.clicks', 0] },
            leads: { $ifNull: ['$metaAdsMetrics.leads', 0] },
            calls: { $ifNull: ['$googleAdsMetrics.calls', 0] },
            messages: { $ifNull: ['$metaAdsMetrics.messages', 0] },
            status: '$status',
            statusDuration: '$statusDuration',
            lastUpdated: '$lastUpdated'
          }
        },
        // Sum spend breakdown
        metaSpend: { $sum: { $ifNull: ['$metaAdsMetrics.spentAmount', 0] } },
        googleSpend: { $sum: { $ifNull: ['$googleAdsMetrics.spentAmount', 0] } },
        // Sum all results
        totalConversions: { $sum: { $ifNull: ['$googleAdsMetrics.conversions', 0] } },
        totalClicks: { $sum: { $ifNull: ['$googleAdsMetrics.clicks', 0] } },
        totalLeads: { $sum: { $ifNull: ['$metaAdsMetrics.leads', 0] } },
        totalCalls: { $sum: { $ifNull: ['$googleAdsMetrics.calls', 0] } },
        totalMessages: { $sum: { $ifNull: ['$metaAdsMetrics.messages', 0] } },
        // Latest update time
        lastUpdated: { $max: '$lastUpdated' },
        // Count of unique weeks
        uniqueWeekCount: { $addToSet: { $concat: ['$month', '-W', { $toString: '$week' }] } },
        // Count of unique months
        uniqueMonthCount: { $addToSet: '$month' },
        // Count of records merged
        recordCount: { $sum: 1 }
      }
    });

    // Add projection to get unique week and month counts
    pipeline.push({
      $addFields: {
        uniqueWeekCount: { $size: '$uniqueWeekCount' },
        uniqueMonthCount: { $size: '$uniqueMonthCount' }
      }
    });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push(
      { $sort: { lastUpdated: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute aggregation
    const aggregatedData = await ClientPerformance.aggregate(pipeline);
    console.log('Aggregated Data:', aggregatedData);

    // Get total count for pagination (separate aggregation for count)
    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ];

    if (search) {
      countPipeline.push({
        $match: {
          'client.name': { $regex: search, $options: 'i' }
        }
      });
    }

    countPipeline.push({
      $group: { _id: '$clientId' }
    });

    const totalCount = await ClientPerformance.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);

    // Format data to match dashboard card structure
    const formattedData = aggregatedData.map(item => {
      const client = item.client;
      const totalSpend = Number(item.metaSpend) + Number(item.googleSpend);
      
      // Calculate cost per result
      const totalResults = item.totalLeads + item.totalCalls + item.totalMessages;
      const costPerResult = totalResults > 0 ? (totalSpend / totalResults).toFixed(2) : 0;

      // Calculate trend and status based on month-to-month comparison
      let trendDirection = 'stable';
      let trendPercentage = 0;
      let status = 'Active';
      let statusDuration = '';

      if (item.weeksData && item.weeksData.length >= 2) {
        // Sort weeks data by month (newest first), then by week (4,3,2,1)
        const sortedWeeks = item.weeksData.sort((a, b) => {
          // Sort by month first (newest first)
          const monthCompare = b.month.localeCompare(a.month);
          if (monthCompare !== 0) return monthCompare;
          // Then sort by week in descending order (4,3,2,1)
          return b.week - a.week;
        });
        console.log('Sorted Weeks:', sortedWeeks);
        const currentWeek = sortedWeeks[0];
        const previousWeek = sortedWeeks[1];

        // Calculate total spend for comparison
        const currentTotalSpend = currentWeek.metaSpend + currentWeek.googleSpend;
        const previousTotalSpend = previousWeek.metaSpend + previousWeek.googleSpend;

        // Data validation - check for potential data entry errors
        const spendRatio = currentTotalSpend / previousTotalSpend;
        if (spendRatio > 100 || spendRatio < 0.01) {
          console.warn('Potential data error detected:', {
            currentTotalSpend,
            previousTotalSpend,
            ratio: spendRatio,
            currentWeek: currentWeek.month,
            previousWeek: previousWeek.month
          });
        }

        // Debug logging
        console.log('Current Week Data:', {
          weekIdentifier: currentWeek.weekIdentifier,
          month: currentWeek.month,
          week: currentWeek.week,
          metaSpend: currentWeek.metaSpend,
          googleSpend: currentWeek.googleSpend,
          totalSpend: currentTotalSpend
        });
        console.log('Previous Week Data:', {
          weekIdentifier: previousWeek.weekIdentifier,
          month: previousWeek.month,
          week: previousWeek.week,
          metaSpend: previousWeek.metaSpend,
          googleSpend: previousWeek.googleSpend,
          totalSpend: previousTotalSpend
        });

        // Calculate percentage change
        if (previousTotalSpend > 0) {
          trendPercentage = ((currentTotalSpend - previousTotalSpend) / previousTotalSpend) * 100;
          console.log(trendPercentage, currentTotalSpend, previousTotalSpend)
          
          trendDirection = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';
          
          console.log('Trend Calculation:', {
            currentTotalSpend,
            previousTotalSpend,
            trendPercentage,
            trendDirection
          });
        }
        let durationText = `${item.uniqueWeekCount}wk`;
        statusDuration = durationText;

        // Determine status based on trend
        if (trendPercentage > 0) {
          status = 'Growth';
        } else if (trendPercentage < 0) {
          status = 'Decline';
        } else {
          status = 'Neutal';
        }

        // Use the latest status and duration if available
        if (currentWeek.status) {
          status = currentWeek.status;
        }
        if (currentWeek.statusDuration) {
          statusDuration = currentWeek.statusDuration;
        }
      } else if (item.weeksData && item.weeksData.length === 1) {
        // Only one month of data - mark as new
        status = 'New';
        statusDuration = '1wk';
      } else if (item.weeksData && item.weeksData.length > 0) {
        // Calculate duration based on available documents for cases with data but no trend comparison
        const documentCount = item.weeksData.length;
        let durationText = `${item.uniqueWeekCount}wk`;
        
        status = 'Active';
        statusDuration = durationText;
      }

      // Determine status color
      let statusColor = 'green';
      if (status === 'Decline') {
        statusColor = 'red';
      } else if (status === 'Growth') {
        statusColor = 'yellow';
      } else if (status === 'New') {
        statusColor = 'green';
      }

      return {
        id: item._id,
        clientId: item._id,
        clientName: client.name,
        clientLogo: client.clientLogo,
        clientType: client.clientType,
        status: status,
        statusDuration: statusDuration,
        statusColor,
        totalSpend,
        spendBreakdown: {
          meta: item.metaSpend,
          google: item.googleSpend
        },
        results: {
          conversions: item.totalConversions,
          clicks: item.totalClicks,
          leads: item.totalLeads,
          calls: item.totalCalls,
          messages: item.totalMessages
        },
        costPerResult: parseFloat(costPerResult),
        trend: {
          direction: trendDirection,
          percentage: Math.abs(trendPercentage)
        },
        hasWarning: status === 'Decline',
        lastUpdated: item.lastUpdated,
        recordCount: item.recordCount, // Number of records merged
        uniqueWeekCount: item.uniqueWeekCount,
        uniqueMonthCount: item.uniqueMonthCount
      };
    });

    // Calculate summary statistics
    const summaryPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ];

    if (search) {
      summaryPipeline.push({
        $match: {
          'client.name': { $regex: search, $options: 'i' }
        }
      });
    }

    summaryPipeline.push({
      $group: {
        _id: null,
        totalClients: { $addToSet: '$clientId' },
        totalSpend: { $sum: { $ifNull: ['$totalSpend', 0] } },
        activeClients: {
          $addToSet: {
            $cond: [{ $eq: ['$status', 'Active'] }, '$clientId', null]
          }
        }
      }
    });

    const summaryData = await ClientPerformance.aggregate(summaryPipeline);
    const summary = summaryData[0] || { totalClients: [], totalSpend: 0, activeClients: [] };

    res.status(200).json({
      message: 'Client overview dashboard retrieved successfully',
      data: {
        summary: {
          totalClients: summary.totalClients.length,
          activeClients: summary.activeClients.filter(id => id !== null).length,
          totalSpend: summary.totalSpend
        },
        clients: formattedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((totalCount[0]?.total || 0) / parseInt(limit)),
          totalItems: totalCount[0]?.total || 0,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving client overview dashboard:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update Social Media metrics
const updateSocialMediaMetrics = async (req, res) => {
  try {
    const { clientId, month, socialMediaMetrics, week } = req.body;

    // console.log('=== SOCIAL MEDIA METRICS UPDATE DEBUG ===');
    // console.log('Client ID:', clientId);
    // console.log('Month provided:', month);
    // console.log('Week provided:', week);
    // console.log('Social Media Metrics:', socialMediaMetrics);
    // console.log('Current Date:', new Date().toISOString());

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    if (!socialMediaMetrics) {
      return res.status(400).json({ error: 'Social Media metrics are required' });
    }

    if (!week) {
      return res.status(400).json({ error: 'Week is required' });
    }

    // Use current month if not provided
    const currentWeek = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    console.log('Using month:', currentWeek);

    // Validate month and week
    const validation = validateMonthWeekCombination(currentWeek, week);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: validation.message 
      });
    }

    // Check if client exists
    const client = await Clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Use upsert to find existing record for this client and month, or create new one
    const clientPerformance = await ClientPerformance.findOneAndUpdate(
      { clientId, month: currentWeek, week: week },
      { 
        $set: {
          lastUpdated: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    // Update only the provided social media metrics fields
    const updateFields = {};
    Object.keys(socialMediaMetrics).forEach(key => {
      if (socialMediaMetrics[key] !== undefined) {
        updateFields[`socialMediaMetrics.${key}`] = socialMediaMetrics[key];
      }
    });

    // Apply selective updates
    if (Object.keys(updateFields).length > 0) {
      await ClientPerformance.findByIdAndUpdate(
        clientPerformance._id,
        { $set: updateFields },
        { runValidators: true }
      );
    }

    // Fetch updated document
    const updatedPerformance = await ClientPerformance.findById(clientPerformance._id);

    res.status(200).json({
      message: 'Social Media metrics updated successfully',
      data: updatedPerformance.socialMediaMetrics
    });
  } catch (error) {
    console.error('Error updating social media metrics:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry: Only one record per client per month is allowed' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update Meta Ads metrics
const updateMetaAdsMetrics = async (req, res) => {
  try {
    const { clientId, month, metaAdsMetrics, week } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    if (!week) {
      return res.status(400).json({ error: 'Week is required' });
    }

    if (!metaAdsMetrics) {
      return res.status(400).json({ error: 'Meta Ads metrics are required' });
    }

    // Use current month if not provided
    const currentWeek = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);

    // Validate month and week
    const validation = validateMonthWeekCombination(currentWeek, week);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: validation.message 
      });
    }

    // Check if client exists
    const client = await Clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Use upsert to find existing record for this client, month, and week, or create new one
    const clientPerformance = await ClientPerformance.findOneAndUpdate(
      { clientId, month: currentWeek, week: week },
      { 
        $set: {
          lastUpdated: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    // Update only the provided meta ads metrics fields
    const updateFields = {};
    Object.keys(metaAdsMetrics).forEach(key => {
      if (metaAdsMetrics[key] !== undefined) {
        updateFields[`metaAdsMetrics.${key}`] = metaAdsMetrics[key];
      }
    });

    // Apply selective updates
    if (Object.keys(updateFields).length > 0) {
      await ClientPerformance.findByIdAndUpdate(
        clientPerformance._id,
        { $set: updateFields },
        { runValidators: true }
      );
    }

    // Fetch updated document
    const updatedPerformance = await ClientPerformance.findById(clientPerformance._id);

    res.status(200).json({
      message: 'Meta Ads metrics updated successfully',
      data: updatedPerformance.metaAdsMetrics
    });
  } catch (error) {
    console.error('Error updating meta ads metrics:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry: Only one record per client per month is allowed' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update Google Ads metrics
const updateGoogleAdsMetrics = async (req, res) => {
  try {
    const { clientId, month, googleAdsMetrics, week } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    if (!week) {
      return res.status(400).json({ error: 'Week is required' });
    }

    if (!googleAdsMetrics) {
      return res.status(400).json({ error: 'Google Ads metrics are required' });
    }

    // Use current month if not provided
    const currentWeek = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);

    // Validate month and week
    const validation = validateMonthWeekCombination(currentWeek, week);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: validation.message 
      });
    }

    // Check if client exists
    const client = await Clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Use upsert to find existing record for this client, month, and week, or create new one
    const clientPerformance = await ClientPerformance.findOneAndUpdate(
      { clientId, month: currentWeek, week: week },
      { 
        $set: {
          lastUpdated: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    // Update only the provided google ads metrics fields
    const updateFields = {};
    Object.keys(googleAdsMetrics).forEach(key => {
      if (googleAdsMetrics[key] !== undefined) {
        updateFields[`googleAdsMetrics.${key}`] = googleAdsMetrics[key];
      }
    });

    // Apply selective updates
    if (Object.keys(updateFields).length > 0) {
      await ClientPerformance.findByIdAndUpdate(
        clientPerformance._id,
        { $set: updateFields },
        { runValidators: true }
      );
    }

    // Fetch updated document
    const updatedPerformance = await ClientPerformance.findById(clientPerformance._id);

    res.status(200).json({
      message: 'Google Ads metrics updated successfully',
      data: updatedPerformance.googleAdsMetrics
    });
  } catch (error) {
    console.error('Error updating google ads metrics:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry: Only one record per client per month is allowed' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all client performance data
// const getAllClientPerformance = async (req, res) => {
//   try {
//     const { 
//       search, 
//       status, 
//       clientType,
//       page = 1, 
//       limit = 20 
//     } = req.query;

//     // Build match stage for aggregation
//     let matchStage = {};
    
//     // Filter by status
//     if (status && status !== 'all') {
//       matchStage.status = status;
//     }

//     // Build aggregation pipeline
//     const pipeline = [
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: 'clients',
//           localField: 'clientId',
//           foreignField: '_id',
//           as: 'client'
//         }
//       },
//       { $unwind: '$client' }
//     ];

//     // Add search and client type filters
//     let clientMatch = {};
//     if (search) {
//       clientMatch['client.name'] = { $regex: search, $options: 'i' };
//     }
//     if (clientType && clientType !== 'all') {
//       clientMatch['client.clientType'] = clientType;
//     }
    
//     if (Object.keys(clientMatch).length > 0) {
//       pipeline.push({ $match: clientMatch });
//     }

//     // Group by clientId and merge all documents
//     pipeline.push({
//       $group: {
//         _id: '$clientId',
//         client: { $first: '$client' },
//         // Get all months data for comparison
//         monthsData: {
//           $push: {
//             month: '$month',
//             metaSpend: { $ifNull: ['$metaAdsMetrics.spentAmount', 0] },
//             googleSpend: { $ifNull: ['$googleAdsMetrics.spentAmount', 0] },
//             conversions: { $ifNull: ['$googleAdsMetrics.conversions', 0] },
//             clicks: { $ifNull: ['$googleAdsMetrics.clicks', 0] },
//             leads: { $ifNull: ['$metaAdsMetrics.leads', 0] },
//             calls: { $ifNull: ['$googleAdsMetrics.calls', 0] },
//             messages: { $ifNull: ['$metaAdsMetrics.messages', 0] },
//             status: '$status',
//             statusDuration: '$statusDuration'
//           }
//         },
//         // Sum spend breakdown
//         metaSpend: { $sum: { $ifNull: ['$metaAdsMetrics.spentAmount', 0] } },
//         googleSpend: { $sum: { $ifNull: ['$googleAdsMetrics.spentAmount', 0] } },
//         // Sum all results
//         totalConversions: { $sum: { $ifNull: ['$googleAdsMetrics.conversions', 0] } },
//         totalClicks: { $sum: { $ifNull: ['$googleAdsMetrics.clicks', 0] } },
//         totalLeads: { $sum: { $ifNull: ['$metaAdsMetrics.leads', 0] } },
//         totalCalls: { $sum: { $ifNull: ['$googleAdsMetrics.calls', 0] } },
//         totalMessages: { $sum: { $ifNull: ['$metaAdsMetrics.messages', 0] } },
//         // Latest update time
//         lastUpdated: { $max: '$lastUpdated' },
//         // Count of records merged
//         recordCount: { $sum: 1 },
//         // Merge all months
//         months: { $addToSet: '$month' },
//         // Merge all services
//         services: { $push: '$services' }
//       }
//     });

//     // Add pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     pipeline.push(
//       { $sort: { lastUpdated: -1 } },
//       { $skip: skip },
//       { $limit: parseInt(limit) }
//     );

//     // Execute aggregation
//     const aggregatedData = await ClientPerformance.aggregate(pipeline);

//     // Get total count for pagination (separate aggregation for count)
//     const countPipeline = [
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: 'clients',
//           localField: 'clientId',
//           foreignField: '_id',
//           as: 'client'
//         }
//       },
//       { $unwind: '$client' }
//     ];

//     if (Object.keys(clientMatch).length > 0) {
//       countPipeline.push({ $match: clientMatch });
//     }

//     countPipeline.push({
//       $group: { _id: '$clientId' }
//     });

//     const totalCount = await ClientPerformance.aggregate([
//       ...countPipeline,
//       { $count: 'total' }
//     ]);

//     console.log(aggregatedData);

//     // Format data for response
//     const formattedData = aggregatedData.map(item => {
//       const client = item.client;
//       const totalSpend = Number(item.metaSpend) + Number(item.googleSpend);
      
//       // Calculate cost per result
//       const totalResults = item.totalLeads + item.totalCalls + item.totalMessages;
//       const costPerResult = totalResults > 0 ? (totalSpend / totalResults).toFixed(2) : 0;

//       // Calculate trend and status based on month-to-month comparison
//       let trendDirection = 'stable';
//       let trendPercentage = 0;
//       let status = 'Active';
//       let statusDuration = '';

//       if (item.weeksData && item.weeksData.length >= 2) {
//         // Sort months data by month (newest first)
//         const sortedMonths = item.weeksData.sort((a, b) => b.month.localeCompare(a.month));
//         const currentWeek = sortedMonths[0];
//         const previousWeek = sortedMonths[1];

//         // Calculate total spend for comparison
//         const currentTotalSpend = currentWeek.metaSpend + currentWeek.googleSpend;
//         const previousTotalSpend = previousWeek.metaSpend + previousWeek.googleSpend;

//         // Calculate percentage change
//         if (previousTotalSpend > 0) {
//           trendPercentage = ((currentTotalSpend - previousTotalSpend) / previousTotalSpend) * 100;
//           trendDirection = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable';
//         }

//         // Determine status based on trend
//         if (trendPercentage > 15) {
//           status = 'Growth';
//           statusDuration = '1wk';
//         } else if (trendPercentage < -15) {
//           status = 'Decline';
//           statusDuration = '1wk';
//         } else {
//           status = 'Active';
//           statusDuration = '1wk';
//         }

//         // Use the latest status and duration if available
//         if (currentWeek.status) {
//           status = currentWeek.status;
//         }
//         if (currentWeek.statusDuration) {
//           statusDuration = currentWeek.statusDuration;
//         }
//       } else if (item.weeksData && item.weeksData.length === 1) {
//         // Only one month of data - mark as new
//         status = 'New';
//         statusDuration = '1wk';
//       } else if (item.weeksData && item.weeksData.length > 0) {
//         // Calculate duration based on available documents for cases with data but no trend comparison
//         const documentCount = item.weeksData.length;
//         let durationText = `${item.uniqueWeekCount}wk`;
        
//         status = 'Active';
//         statusDuration = durationText;
//       }

//       // Determine status color
//       let statusColor = 'green';
//       if (status === 'Decline') {
//         statusColor = 'red';
//       } else if (status === 'Growth') {
//         statusColor = 'yellow';
//       } else if (status === 'New') {
//         statusColor = 'green';
//       }

//       return {
//         _id: item._id,
//         clientId: item._id,
//         client: client,
//         status: status,
//         statusDuration: statusDuration,
//         statusColor: statusColor,
//         totalSpend,
//         spendBreakdown: {
//           meta: item.metaSpend,
//           google: item.googleSpend
//         },
//         results: {
//           conversions: item.totalConversions,
//           clicks: item.totalClicks,
//           leads: item.totalLeads,
//           calls: item.totalCalls,
//           messages: item.totalMessages
//         },
//         costPerResult: parseFloat(costPerResult),
//         trend: {
//           direction: trendDirection,
//           percentage: Math.abs(trendPercentage)
//         },
//         hasWarning: status === 'Decline',
//         lastUpdated: item.lastUpdated,
//         recordCount: item.recordCount, // Number of records merged
//         months: item.months,
//         services: item.services.flat() // Flatten services array
//       };
//     });

//     res.status(200).json({
//       message: 'Client performance data retrieved successfully',
//       data: {
//         clients: formattedData,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil((totalCount[0]?.total || 0) / parseInt(limit)),
//           totalItems: totalCount[0]?.total || 0,
//           itemsPerPage: parseInt(limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error retrieving client performance:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Get client performance by ID
// const getClientPerformanceById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const clientPerformance = await ClientPerformance.findById(id)
//       .populate('clientId', 'name clientLogo GST State Country Address clientType');

//     if (!clientPerformance) {
//       return res.status(404).json({ error: 'Client performance not found' });
//     }

//     res.status(200).json({
//       message: 'Client performance retrieved successfully',
//       data: clientPerformance
//     });
//   } catch (error) {
//     console.error('Error retrieving client performance:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Get client performance by client ID
// const getClientPerformanceByClientId = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const clientPerformance = await ClientPerformance.findOne({ clientId })
//       .populate('clientId', 'name clientLogo GST State Country Address clientType');

//     if (!clientPerformance) {
//       return res.status(404).json({ error: 'Client performance not found' });
//     }

//     res.status(200).json({
//       message: 'Client performance retrieved successfully',
//       data: clientPerformance
//     });
//   } catch (error) {
//     console.error('Error retrieving client performance:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Update client metrics (general)
// const updateClientMetrics = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const updateData = req.body;

//     console.log('=== CLIENT PERFORMANCE UPDATE DEBUG ===');
//     console.log('Client ID:', clientId);
//     console.log('Update Data:', updateData);
//     console.log('Current Date:', new Date().toISOString());

//     if (!clientId) {
//       return res.status(400).json({ error: 'Client ID is required' });
//     }

//     // Check if client exists
//     const client = await Clients.findById(clientId);
//     if (!client) {
//       return res.status(404).json({ error: 'Client not found' });
//     }

//     // Find existing performance record or create new one
//     let clientPerformance = await ClientPerformance.findOne({ clientId });
    
//     if (clientPerformance) {
//       console.log('Updating existing record...');
//       console.log('Current week in existing record:', clientPerformance.week);
//       console.log('Current month in existing record:', clientPerformance.month);
      
//       // Update existing record
//       Object.assign(clientPerformance, updateData);
//       clientPerformance.lastUpdated = new Date();
//       await clientPerformance.save();
      
//       console.log('Updated record week:', clientPerformance.week);
//       console.log('Updated record month:', clientPerformance.month);
//     } else {
//       console.log('Creating new record...');
//       // Create new record
//       clientPerformance = new ClientPerformance({
//         clientId,
//         ...updateData,
//         lastUpdated: new Date()
//       });
//       await clientPerformance.save();
//     }

//     res.status(200).json({
//       message: 'Client metrics updated successfully',
//       data: clientPerformance
//     });
//   } catch (error) {
//     console.error('Error updating client metrics:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Delete client performance
// const deleteClientPerformance = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const clientPerformance = await ClientPerformance.findByIdAndDelete(id);

//     if (!clientPerformance) {
//       return res.status(404).json({ error: 'Client performance not found' });
//     }

//     res.status(200).json({
//       message: 'Client performance deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting client performance:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// Get 4-week comparison data for social media, Meta ads, and Google ads
const getFourWeekComparison = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client ID is required' 
      });
    }

    // Calculate date range for last 4 weeks from today
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28); // 4 weeks = 28 days

    console.log('=== 4-WEEK COMPARISON DEBUG ===');
    console.log('Client ID:', clientId);
    console.log('Date Range:', { startDate, endDate });

    // Build aggregation pipeline for 4-week data
    const pipeline = [
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId),
          lastUpdated: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $sort: { month: -1, week: -1 } // Sort by month and week descending
      },
      {
        $group: {
          _id: {
            month: '$month',
            week: '$week'
          },
          month: { $first: '$month' },
          week: { $first: '$week' },
          weekIdentifier: { 
            $first: { 
              $concat: ['$month', '-W', { $toString: '$week' }] 
            } 
          },
          socialMediaMetrics: { $first: '$socialMediaMetrics' },
          metaAdsMetrics: { $first: '$metaAdsMetrics' },
          googleAdsMetrics: { $first: '$googleAdsMetrics' },
          lastUpdated: { $first: '$lastUpdated' }
        }
      },
      {
        $sort: { 'month': -1, 'week': -1 }
      },
      {
        $limit: 4 // Get only the last 4 weeks
      }
    ];

    const weeklyData = await ClientPerformance.aggregate(pipeline);

    console.log('Weekly Data Retrieved:', weeklyData.length, 'weeks');

    // Format data for comparison in the specified format
    const socialMediaData = weeklyData.map((week, index) => {
      const weekNumber = 4 - index; // Week 4, 3, 2, 1
      const weekLabel = `W${weekNumber}`;
      
      return {
        week: weekLabel,
        posts: (week.socialMediaMetrics.graphicsPost || 0) + (week.socialMediaMetrics.ugc || 0) + (week.socialMediaMetrics.reels || 0),
        engagement: week.socialMediaMetrics.avgEngagement || 0,
        reach: week.socialMediaMetrics.reach || 0,
        weekNumber: weekNumber,
        month: week.month,
        weekIdentifier: week.weekIdentifier,
        lastUpdated: week.lastUpdated
      };
    });

    const metaAdsData = weeklyData.map((week, index) => {
      const weekNumber = 4 - index; // Week 4, 3, 2, 1
      const weekLabel = `W${weekNumber}`;
      
      return {
        week: weekLabel,
        spend: week.metaAdsMetrics.spentAmount || 0,
        leads: week.metaAdsMetrics.leads || 0,
        roas: week.metaAdsMetrics.roas || 0,
        weekNumber: weekNumber,
        month: week.month,
        weekIdentifier: week.weekIdentifier,
        lastUpdated: week.lastUpdated
      };
    });

    const googleAdsData = weeklyData.map((week, index) => {
      const weekNumber = 4 - index; // Week 4, 3, 2, 1
      const weekLabel = `W${weekNumber}`;
      
      return {
        week: weekLabel,
        spend: week.googleAdsMetrics.spentAmount || 0,
        clicks: week.googleAdsMetrics.clicks || 0,
        conversions: week.googleAdsMetrics.conversions || 0,
        weekNumber: weekNumber,
        month: week.month,
        weekIdentifier: week.weekIdentifier,
        lastUpdated: week.lastUpdated
      };
    });

    res.status(200).json({
      success: true,
      message: '4-week comparison data retrieved successfully',
      data: {
        socialMediaData,
        metaAdsData,
        googleAdsData,
        summary: {
          totalWeeks: weeklyData.length,
          dateRange: {
            start: startDate,
            end: endDate
          },
          clientId: clientId
        }
      }
    });

  } catch (error) {
    console.error('Error fetching 4-week comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching 4-week comparison data',
      error: error.message
    });
  }
};

// Get Social Media metrics
const getSocialMediaMetrics = async (req, res) => {
  try {
    const { clientId, month, week } = req.query;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Use current month if not provided
    const currentMonth = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    const currentWeek = week || 1;

    // Validate month and week if provided
    if (month && week) {
      const validation = validateMonthWeekCombination(currentMonth, currentWeek);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          message: validation.message 
        });
      }
    }

    // Build query
    let query = { clientId: new mongoose.Types.ObjectId(clientId) };
    
    if (month) {
      query.month = currentMonth;
    }
    
    if (week) {
      query.week = parseInt(currentWeek);
    }

    // Find records matching the criteria
    const records = await ClientPerformance.find(query)
      .populate('clientId', 'name clientLogo clientType')
      .sort({ month: -1, week: -1, lastUpdated: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ 
        message: 'No social media metrics found for the specified criteria',
        data: []
      });
    }

    // Format response data
    const formattedData = records.map(record => ({
      id: record._id,
      clientId: record.clientId._id,
      clientName: record.clientId.name,
      clientLogo: record.clientId.clientLogo,
      clientType: record.clientId.clientType,
      month: record.month,
      week: record.week,
      weekIdentifier: `${record.month}-W${record.week}`,
      socialMediaMetrics: record.socialMediaMetrics || {},
      lastUpdated: record.lastUpdated,
      status: record.status,
      statusDuration: record.statusDuration
    }));

    res.status(200).json({
      message: 'Social media metrics retrieved successfully',
      data: formattedData,
      summary: {
        totalRecords: formattedData.length,
        clientId: clientId,
        month: currentMonth,
        week: currentWeek
      }
    });

  } catch (error) {
    console.error('Error retrieving social media metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get Meta Ads metrics
const getMetaAdsMetrics = async (req, res) => {
  try {
    const { clientId, month, week } = req.query;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Use current month if not provided
    const currentMonth = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    const currentWeek = week || 1;

    // Validate month and week if provided
    if (month && week) {
      const validation = validateMonthWeekCombination(currentMonth, currentWeek);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          message: validation.message 
        });
      }
    }

    // Build query
    let query = { clientId: new mongoose.Types.ObjectId(clientId) };
    
    if (month) {
      query.month = currentMonth;
    }
    
    if (week) {
      query.week = parseInt(currentWeek);
    }

    // Find records matching the criteria
    const records = await ClientPerformance.find(query)
      .populate('clientId', 'name clientLogo clientType')
      .sort({ month: -1, week: -1, lastUpdated: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ 
        message: 'No meta ads metrics found for the specified criteria',
        data: []
      });
    }

    // Format response data
    const formattedData = records.map(record => ({
      id: record._id,
      clientId: record.clientId._id,
      clientName: record.clientId.name,
      clientLogo: record.clientId.clientLogo,
      clientType: record.clientId.clientType,
      month: record.month,
      week: record.week,
      weekIdentifier: `${record.month}-W${record.week}`,
      metaAdsMetrics: record.metaAdsMetrics || {},
      lastUpdated: record.lastUpdated,
      status: record.status,
      statusDuration: record.statusDuration
    }));

    res.status(200).json({
      message: 'Meta ads metrics retrieved successfully',
      data: formattedData,
      summary: {
        totalRecords: formattedData.length,
        clientId: clientId,
        month: currentMonth,
        week: currentWeek
      }
    });

  } catch (error) {
    console.error('Error retrieving meta ads metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get Google Ads metrics
const getGoogleAdsMetrics = async (req, res) => {
  try {
    const { clientId, month, week } = req.query;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Use current month if not provided
    const currentMonth = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    const currentWeek = week || 1;

    // Validate month and week if provided
    if (month && week) {
      const validation = validateMonthWeekCombination(currentMonth, currentWeek);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          message: validation.message 
        });
      }
    }

    // Build query
    let query = { clientId: new mongoose.Types.ObjectId(clientId) };
    
    if (month) {
      query.month = currentMonth;
    }
    
    if (week) {
      query.week = parseInt(currentWeek);
    }

    // Find records matching the criteria
    const records = await ClientPerformance.find(query)
      .populate('clientId', 'name clientLogo clientType')
      .sort({ month: -1, week: -1, lastUpdated: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ 
        message: 'No google ads metrics found for the specified criteria',
        data: []
      });
    }

    // Format response data
    const formattedData = records.map(record => ({
      id: record._id,
      clientId: record.clientId._id,
      clientName: record.clientId.name,
      clientLogo: record.clientId.clientLogo,
      clientType: record.clientId.clientType,
      month: record.month,
      week: record.week,
      weekIdentifier: `${record.month}-W${record.week}`,
      googleAdsMetrics: record.googleAdsMetrics || {},
      lastUpdated: record.lastUpdated,
      status: record.status,
      statusDuration: record.statusDuration
    }));

    res.status(200).json({
      message: 'Google ads metrics retrieved successfully',
      data: formattedData,
      summary: {
        totalRecords: formattedData.length,
        clientId: clientId,
        month: currentMonth,
        week: currentWeek
      }
    });

  } catch (error) {
    console.error('Error retrieving google ads metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  updateSocialMediaMetrics,
  updateMetaAdsMetrics,
  updateGoogleAdsMetrics,
  getSocialMediaMetrics,
  getMetaAdsMetrics,
  getGoogleAdsMetrics,
  getClientOverviewDashboard,
  getFourWeekComparison
};