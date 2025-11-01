const mongoose = require('mongoose');
const ClientPerformance = require('../models/clientPerformance');
const Clients = require('../models/clients');
const Employees = require('../models/employee');
const { updatePerformanceTracking, getPerformanceTracking } = require('../utils/performanceTracking');

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
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 5) {
    return { isValid: false, message: 'Week must be a number between 1 and 5' };
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
    // console.log('=== CLIENT OVERVIEW DASHBOARD START ===');
    
    const { 
      clientId, 
      search, 
      status, 
      page = 1, 
      limit = 10,
      date // ISO date string (e.g., "2024-08-15")
    } = req.query;

    // console.log('📥 Input Parameters:', {
    //   clientId,
    //   search,
    //   status,
    //   page,
    //   limit,
    //   date
    // });

    // Extract current month and calculate previous month from date parameter
    let currentMonth, previousMonth;
    if (date) {
      const dateObj = new Date(date);
      currentMonth = dateObj.toISOString().slice(0, 7); // YYYY-MM format (e.g., "2024-08")
      
      // Calculate previous month (handle January -> December of previous year)
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth(); // 0-indexed (Jan=0, Aug=7, Dec=11)
      
      // console.log('📅 Date Calculation:', {
      //   inputDate: date,
      //   parsedDate: dateObj.toISOString(),
      //   year,
      //   month,
      //   monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]
      // });
      
      if (month === 0) {
        // January: go to December of previous year
        previousMonth = `${year - 1}-12`;
      } else {
        // Convert to calendar month number (getMonth is 0-indexed, calendar is 1-indexed)
        // Example: Aug getMonth=7, calendar month=08 -> need Jul calendar month=07
        // So: calendar month = getMonth() + 1, previous calendar month = getMonth()
        const previousMonthNum = month; // This equals the calendar month number
        previousMonth = `${year}-${String(previousMonthNum).padStart(2, '0')}`;
      }
    } else {
      // Use current date if not provided
      const now = new Date();
      currentMonth = now.toISOString().slice(0, 7);
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-indexed
      
      // console.log('📅 Using Current Date:', {
      //   currentMonth,
      //   year,
      //   month,
      //   monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]
      // });
      
      if (month === 0) {
        previousMonth = `${year - 1}-12`;
      } else {
        const previousMonthNum = month; // This equals the calendar month number
        previousMonth = `${year}-${String(previousMonthNum).padStart(2, '0')}`;
      }
    }

    // console.log('🗓️  Month Comparison:', {
    //   currentMonth,
    //   previousMonth,
    //   comparisonNote: `Comparing ${currentMonth} (current) vs ${previousMonth} (previous)`
    // });

    // Build client match stage - start from Clients collection to show all clients
    let clientMatchStage = {};
    
    // Filter by specific client
    if (clientId) {
      clientMatchStage._id = new mongoose.Types.ObjectId(clientId);
      // console.log('👤 Filtering by Client ID:', clientId);
    }

    // If user is employee, filter by their assigned clients
    let assignedClientIds = null;
    if (req.user && req.user.type === 'employee') {
      // console.log('👷 User is Employee, filtering by assigned clients');
      const employee = await Employees.findById(req.user._id);
      if (employee && employee.clients && employee.clients.length > 0) {
        // Extract clientIds from employee's client distribution
        assignedClientIds = employee.clients
          .filter(client => client.clientId) // Only include clients with valid clientId
          .map(client => new mongoose.Types.ObjectId(client.clientId));
        
        // console.log('📋 Assigned Client IDs:', assignedClientIds.length, 'clients');
        
        if (assignedClientIds.length > 0) {
          if (clientId) {
            // If both clientId and assigned clients exist, ensure clientId is in assigned list
            if (!assignedClientIds.some(id => id.toString() === clientId)) {
              clientMatchStage._id = null; // This will return no results
            }
          } else {
            clientMatchStage._id = { $in: assignedClientIds };
          }
        } else {
          // If no valid clientIds found, return empty result
          return res.status(200).json({
            message: 'No assigned clients found for this employee',
            data: {
              summary: {
                totalClients: 0,
                activeClients: 0
              },
              clients: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit)
              }
            }
          });
        }
      } else {
        // If employee has no assigned clients, return empty result
        return res.status(200).json({
          message: 'No assigned clients found for this employee',
          data: {
            summary: {
              totalClients: 0,
              activeClients: 0
            },
            clients: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      }
    }

    // Stage 1: Start from Clients collection to ensure all clients are included
    const pipeline = [];
    
    // Filter clients by search if provided
    if (search) {
      clientMatchStage.name = { $regex: search, $options: 'i' };
    }
    
    if (Object.keys(clientMatchStage).length > 0) {
      pipeline.push({ $match: clientMatchStage });
    }

    // Stage 2: Lookup performance data for current and previous months (left join - allows clients with no data)
    pipeline.push({
      $lookup: {
        from: 'clientperformances',
        let: { clientId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$clientId', '$$clientId'] },
                  { $in: ['$month', [currentMonth, previousMonth]] }
                ]
              }
            }
          },
          ...(status && status !== 'all' ? [{ $match: { status: status } }] : [])
        ],
        as: 'performanceData'
      }
    });

    // Stage 3: Process performance data - transform array of performance records into aggregated data
    pipeline.push({
      $addFields: {
        weeksData: {
          $map: {
            input: '$performanceData',
            as: 'perf',
            in: {
              month: '$$perf.month',
              week: '$$perf.week',
              weekIdentifier: { $concat: ['$$perf.month', '-W', { $toString: '$$perf.week' }] },
              metaSpend: { $ifNull: ['$$perf.metaAdsMetrics.spentAmount', 0] },
              googleSpend: { $ifNull: ['$$perf.googleAdsMetrics.spentAmount', 0] },
              conversions: { $ifNull: ['$$perf.googleAdsMetrics.conversions', 0] },
              clicks: { $ifNull: ['$$perf.googleAdsMetrics.clicks', 0] },
              leads: { $ifNull: ['$$perf.metaAdsMetrics.leads', 0] },
              calls: { $ifNull: ['$$perf.googleAdsMetrics.calls', 0] },
              messages: { $ifNull: ['$$perf.metaAdsMetrics.messages', 0] },
              status: '$$perf.status',
              statusDuration: '$$perf.statusDuration',
              lastUpdated: '$$perf.lastUpdated'
            }
          }
        },
        // Calculate aggregated metrics (default to 0 if no performance data)
        metaSpend: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.metaAdsMetrics.spentAmount', 0] }
            }
          }
        },
        googleSpend: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.googleAdsMetrics.spentAmount', 0] }
            }
          }
        },
        totalConversions: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.googleAdsMetrics.conversions', 0] }
            }
          }
        },
        totalClicks: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.googleAdsMetrics.clicks', 0] }
            }
          }
        },
        totalLeads: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.metaAdsMetrics.leads', 0] }
            }
          }
        },
        totalCalls: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.googleAdsMetrics.calls', 0] }
            }
          }
        },
        totalMessages: {
          $sum: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: { $ifNull: ['$$perf.metaAdsMetrics.messages', 0] }
            }
          }
        },
        lastUpdated: {
          $max: {
            $map: {
              input: '$performanceData',
              as: 'perf',
              in: '$$perf.lastUpdated'
            }
          }
        },
        uniqueWeekCount: {
          $size: {
            $setUnion: {
              $map: {
                input: '$performanceData',
                as: 'perf',
                in: { $concat: ['$$perf.month', '-W', { $toString: '$$perf.week' }] }
              }
            }
          }
        },
        uniqueMonthCount: {
          $size: {
            $setUnion: {
              $map: {
                input: '$performanceData',
                as: 'perf',
                in: '$$perf.month'
              }
            }
          }
        },
        recordCount: { $size: '$performanceData' }
      }
    });

    // Stage 4: Add default values for clients with no performance data
    pipeline.push({
      $addFields: {
        weeksData: { $ifNull: ['$weeksData', []] },
        metaSpend: { $ifNull: ['$metaSpend', 0] },
        googleSpend: { $ifNull: ['$googleSpend', 0] },
        totalConversions: { $ifNull: ['$totalConversions', 0] },
        totalClicks: { $ifNull: ['$totalClicks', 0] },
        totalLeads: { $ifNull: ['$totalLeads', 0] },
        totalCalls: { $ifNull: ['$totalCalls', 0] },
        totalMessages: { $ifNull: ['$totalMessages', 0] },
        lastUpdated: { $ifNull: ['$lastUpdated', new Date()] },
        uniqueWeekCount: { $ifNull: ['$uniqueWeekCount', 0] },
        uniqueMonthCount: { $ifNull: ['$uniqueMonthCount', 0] },
        recordCount: { $ifNull: ['$recordCount', 0] }
      }
    });

    // Stage 5: Rename client document to match expected structure
    pipeline.push({
      $addFields: {
        client: '$$ROOT'
      }
    });

    // Stage 6: Lookup latest client feedback from clientfeedbacks collection
    pipeline.push({
      $lookup: {
        from: 'clientfeedbacks',
        let: { clientId: '$_id', currentMonth: currentMonth },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$clientId', '$$clientId'] },
                  { $eq: ['$month', '$$currentMonth'] }
                ]
              } 
            } 
          },
          { $sort: { feedbackDate: -1 } },
          { $limit: 1 },
          { $project: { feedbackType: 1, rating: 1, feedbackDate: 1 } }
        ],
        as: 'latestFeedback'
      }
    });

    // Stage 7: Pagination - sort, skip, and limit results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push(
      { $sort: { lastUpdated: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute the main aggregation pipeline starting from Clients collection
    // console.log('🔄 Executing Main Aggregation Pipeline...');
    // console.log('📊 Pipeline Stages:', pipeline.length);
    const aggregatedData = await Clients.aggregate(pipeline);
    // console.log('✅ Aggregation Complete. Records Found:', aggregatedData.length);

    // Build count pipeline for pagination (same filters, just counting from Clients)
    const countPipeline = [];
    
    if (Object.keys(clientMatchStage).length > 0) {
      countPipeline.push({ $match: clientMatchStage });
    }
    
    countPipeline.push({
      $count: 'total'
    });

    const totalCount = await Clients.aggregate(countPipeline);

    // console.log('📊 Total Count Result:', totalCount);
    // console.log('🔍 Aggregated Data Sample (first item weeksData):', aggregatedData[0]?.weeksData || 'No data');

    // Check if user is admin
    const isAdmin = req.user && (req.user.type === 'admin' || req.user.type === 'superadmin');
    // console.log('👤 User Type:', req.user?.type, '- Is Admin:', isAdmin);

    // Format data to match dashboard card structure
    const formattedData = aggregatedData.map(item => {
      // Use client data from the root since we're starting from Clients collection
      const client = {
        _id: item._id,
        name: item.name,
        clientLogo: item.clientLogo,
        clientType: item.clientType
      };
      
      // Calculate trend and status based on month-to-month comparison
      let trendDirection = 'stable';
      let trendPercentage = 0;
      let status = 'Active';
      let statusDuration = '';
      
      // Initialize current month only metrics
      let currentMonthConversions = 0;
      let currentMonthClicks = 0;
      let currentMonthLeads = 0;
      let currentMonthCalls = 0;
      let currentMonthMessages = 0;
      let currentMonthSpend = 0;
      let currentMonthData = [];
      let currentMonthMetaSpend = 0;
      let currentMonthGoogleSpend = 0;

      // Compare current month data vs previous month data
      // Initialize defaults in case of no data
      if (!item.weeksData || item.weeksData.length === 0) {
        status = 'Active';
        statusDuration = '0wk';
        // All metrics already default to 0
      } else {
        // Group weeks data by month
        currentMonthData = item.weeksData.filter(w => w.month === currentMonth);
        const previousMonthData = item.weeksData.filter(w => w.month === previousMonth);

        // console.log(`📈 Client ${client.name} Trend Analysis:`, {
        //   totalWeeksData: item.weeksData.length,
        //   currentMonthDataCount: currentMonthData.length,
        //   previousMonthDataCount: previousMonthData.length,
        //   currentMonth,
        //   previousMonth
        // });

        // Calculate current month only metrics (for results and cost per result)
        currentMonthConversions = currentMonthData.reduce((sum, week) => sum + week.conversions, 0);
        currentMonthClicks = currentMonthData.reduce((sum, week) => sum + week.clicks, 0);
        currentMonthLeads = currentMonthData.reduce((sum, week) => sum + week.leads, 0);
        currentMonthCalls = currentMonthData.reduce((sum, week) => sum + week.calls, 0);
        currentMonthMessages = currentMonthData.reduce((sum, week) => sum + week.messages, 0);
        currentMonthMetaSpend = currentMonthData.reduce((sum, week) => sum + week.metaSpend, 0);
        currentMonthGoogleSpend = currentMonthData.reduce((sum, week) => sum + week.googleSpend, 0);
        currentMonthSpend = currentMonthMetaSpend + currentMonthGoogleSpend;

        // Calculate totals for each month (for trend comparison)
        const currentMonthTotal = currentMonthData.reduce((sum, week) => {
          return sum + week.metaSpend + week.googleSpend;
        }, 0);

        const previousMonthTotal = previousMonthData.reduce((sum, week) => {
          return sum + week.metaSpend + week.googleSpend;
        }, 0);

        // console.log(`💰 Spend Comparison for ${client.name}:`, {
        //   currentMonth: currentMonth,
        //   currentMonthTotal: currentMonthTotal,
        //   previousMonth: previousMonth,
        //   previousMonthTotal: previousMonthTotal
        // });

        // If we have data for both months, calculate trend
        if (currentMonthData.length > 0 && previousMonthData.length > 0) {
          if (previousMonthTotal > 0) {
            trendPercentage = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
            trendDirection = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';
          }

          // console.log(`📊 Trend Calculation for ${client.name}:`, {
          //   trendPercentage: trendPercentage.toFixed(2) + '%',
          //   trendDirection,
          //   change: `${Math.abs(trendPercentage).toFixed(2)}% ${trendDirection}`
          // });

          // Determine status based on trend
          if (trendPercentage > 0) {
            status = 'Growth';
          } else if (trendPercentage < 0) {
            status = 'Decline';
          } else {
            status = 'Neutal';
          }

          statusDuration = `${item.uniqueWeekCount}wk`;
        } else if (currentMonthData.length > 0 && previousMonthData.length === 0) {
          // Only current month data - mark as new
          // console.log(`🆕 New Client: ${client.name} (only has ${currentMonth} data)`);
          status = 'New';
          statusDuration = `${currentMonthData.length}wk`;
        } else {
          // No current month data
          // console.log(`⚠️ No current month data for ${client.name}`);
          status = 'Active';
          statusDuration = item.uniqueWeekCount > 0 ? `${item.uniqueWeekCount}wk` : '0wk';
        }
      }

      // Calculate cost per result using only current month data
      const totalResults = currentMonthLeads + currentMonthCalls + currentMonthMessages;
      const costPerResult = totalResults > 0 ? (currentMonthSpend / totalResults).toFixed(2) : 0;

      // Determine status color
      let statusColor = 'green';
      if (status === 'Decline') {
        statusColor = 'red';
      } else if (status === 'Growth') {
        statusColor = 'yellow';
      } else if (status === 'New') {
        statusColor = 'green';
      }

      // Get latest feedback data
      const latestFeedback = item.latestFeedback && item.latestFeedback.length > 0 
        ? item.latestFeedback[0] 
        : null;

      const baseData = {
        id: item._id,
        clientId: item._id,
        clientName: client.name,
        clientLogo: client.clientLogo,
        clientType: client.clientType,
        status: status,
        statusDuration: statusDuration,
        statusColor,
        results: {
          conversions: currentMonthConversions,
          clicks: currentMonthClicks,
          leads: currentMonthLeads,
          calls: currentMonthCalls,
          messages: currentMonthMessages
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
        uniqueMonthCount: item.uniqueMonthCount,
        latestFeedback: latestFeedback ? {
          feedbackType: latestFeedback.feedbackType,
          rating: latestFeedback.rating,
          feedbackDate: latestFeedback.feedbackDate
        } : null
      };

      // Only include financial data for admin users (totalSpend is now current month only)
      if (isAdmin) {
        baseData.totalSpend = currentMonthSpend;
        baseData.spendBreakdown = {
          meta: currentMonthMetaSpend,
          google: currentMonthGoogleSpend
        };
      }

      return baseData;
    });

    // Build summary pipeline to calculate overall statistics (starting from Clients)
    const summaryPipeline = [];
    
    if (Object.keys(clientMatchStage).length > 0) {
      summaryPipeline.push({ $match: clientMatchStage });
    }

    // Lookup performance data for summary
    summaryPipeline.push({
      $lookup: {
        from: 'clientperformances',
        let: { clientId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$clientId', '$$clientId'] },
                  { $in: ['$month', [currentMonth, previousMonth]] }
                ]
              }
            }
          },
          {
            $project: {
              metaSpend: { $ifNull: ['$metaAdsMetrics.spentAmount', 0] },
              googleSpend: { $ifNull: ['$googleAdsMetrics.spentAmount', 0] },
              status: 1
            }
          }
        ],
        as: 'performanceData'
      }
    });

    summaryPipeline.push({
      $group: {
        _id: null,
        totalClients: { $addToSet: '$_id' },
        totalSpend: {
          $sum: {
            $sum: {
              $map: {
                input: '$performanceData',
                as: 'perf',
                in: { $add: ['$$perf.metaSpend', '$$perf.googleSpend'] }
              }
            }
          }
        },
        activeClients: {
          $addToSet: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$performanceData',
                        as: 'perf',
                        cond: { $eq: ['$$perf.status', 'Active'] }
                      }
                    }
                  },
                  0
                ]
              },
              '$_id',
              null
            ]
          }
        }
      }
    });

    const summaryData = await Clients.aggregate(summaryPipeline);
    const summary = summaryData[0] || { totalClients: [], totalSpend: 0, activeClients: [] };

    const responseData = {
      message: 'Client overview dashboard retrieved successfully',
      data: {
        summary: {
          totalClients: summary.totalClients.length,
          activeClients: summary.activeClients.filter(id => id !== null).length
        },
        clients: formattedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((totalCount[0]?.total || 0) / parseInt(limit)),
          totalItems: totalCount[0]?.total || 0,
          itemsPerPage: parseInt(limit)
        }
      }
    };

    // Only include totalSpend in summary for admin users
    if (isAdmin) {
      responseData.data.summary.totalSpend = summary.totalSpend;
    }

    // console.log('📤 Response Summary:', {
    //   totalClients: responseData.data.summary.totalClients,
    //   activeClients: responseData.data.summary.activeClients,
    //   clientsReturned: responseData.data.clients.length,
    //   pagination: responseData.data.pagination,
    //   isAdmin: isAdmin
    // });

    // console.log('=== CLIENT OVERVIEW DASHBOARD END ===\n');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Error retrieving client overview dashboard:', error);
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

    // Update performance tracking for social metrics
    if (req.user && req.user._id) {
      await updatePerformanceTracking(
        clientPerformance._id,
        req.user._id,
        'socialMetrics'
      );
    }

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

    // Update performance tracking for meta metrics
    if (req.user && req.user._id) {
      await updatePerformanceTracking(
        clientPerformance._id,
        req.user._id,
        'metaMetrics'
      );
    }

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

    // Update performance tracking for google metrics
    if (req.user && req.user._id) {
      await updatePerformanceTracking(
        clientPerformance._id,
        req.user._id,
        'googleMetrics'
      );
    }

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

// Get 5-week comparison data for social media, Meta ads, and Google ads
const getWeeksComparison = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client ID is required' 
      });
    }

    // Calculate date range for last 5 weeks from today
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 35); // 5 weeks = 35 days

    // console.log('=== 5-WEEK COMPARISON DEBUG ===');
    // console.log('Client ID:', clientId);
    // console.log('Date Range:', { startDate, endDate });

    // Build aggregation pipeline for 5-week data
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
        $limit: 5 // Get only the last 5 weeks
      }
    ];

    const weeklyData = await ClientPerformance.aggregate(pipeline);

    console.log('Weekly Data Retrieved:', weeklyData.length, 'weeks');

    // Reverse the data to show oldest to newest (W1 = oldest, W5 = newest)
    const reversedWeeklyData = weeklyData.reverse();

    // Format data for comparison in the specified format
    const socialMediaData = reversedWeeklyData.map((week, index) => {
      const weekNumber = index + 1; // Week 1, 2, 3, 4, 5 (oldest to newest)
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

    const metaAdsData = reversedWeeklyData.map((week, index) => {
      const weekNumber = index + 1; // Week 1, 2, 3, 4, 5 (oldest to newest)
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

    const googleAdsData = reversedWeeklyData.map((week, index) => {
      const weekNumber = index + 1; // Week 1, 2, 3, 4, 5 (oldest to newest)
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
      message: '5-week comparison data retrieved successfully',
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
    console.error('Error fetching 5-week comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching 5-week comparison data',
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

// Get latest Meta and Google Ads data for a client
const getLatestAdsData = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ 
        success: false,
        error: 'Client ID is required' 
      });
    }

    // Check if client exists
    const client = await Clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found' 
      });
    }

    // Find the latest record for this client
    const latestRecord = await ClientPerformance.findOne({ 
      clientId: new mongoose.Types.ObjectId(clientId) 
    })
      .populate('clientId', 'name clientLogo clientType GST State Country Address')
      .sort({ month: -1, week: -1, lastUpdated: -1 })
      .limit(1);

    if (!latestRecord) {
      return res.status(404).json({ 
        success: false,
        message: 'No performance data found for this client',
        data: null
      });
    }

    // Format response with latest data
    const responseData = {
      clientId: latestRecord.clientId._id,
      clientName: latestRecord.clientId.name,
      clientLogo: latestRecord.clientId.clientLogo,
      clientType: latestRecord.clientId.clientType,
      clientDetails: {
        GST: latestRecord.clientId.GST,
        state: latestRecord.clientId.State,
        country: latestRecord.clientId.Country,
        address: latestRecord.clientId.Address
      },
      period: {
        month: latestRecord.month,
        week: latestRecord.week,
        weekIdentifier: `${latestRecord.month}-W${latestRecord.week}`,
        lastUpdated: latestRecord.lastUpdated
      },
      socialMediaMetrics: {
        reach: latestRecord.socialMediaMetrics.reach || 0,
        followers: latestRecord.socialMediaMetrics.followers || 0,
        avgEngagement: latestRecord.socialMediaMetrics.avgEngagement || 0,
        graphicsPost: latestRecord.socialMediaMetrics.graphicsPost || 0,
        ugc: latestRecord.socialMediaMetrics.ugc || 0,
        reels: latestRecord.socialMediaMetrics.reels || 0,
        maxReels: latestRecord.socialMediaMetrics.maxReels || 0,
        maxGraphicsPost: latestRecord.socialMediaMetrics.maxGraphicsPost || 0,
        maxUgc: latestRecord.socialMediaMetrics.maxUgc || 0
      },
      metaAdsMetrics: {
        spentAmount: latestRecord.metaAdsMetrics.spentAmount || 0,
        roas: latestRecord.metaAdsMetrics.roas || 0,
        leads: latestRecord.metaAdsMetrics.leads || 0,
        messages: latestRecord.metaAdsMetrics.messages || 0,
        costPerLead: latestRecord.metaAdsMetrics.costPerLead || 0,
        costPerMessage: latestRecord.metaAdsMetrics.costPerMessage || 0
      },
      googleAdsMetrics: {
        spentAmount: latestRecord.googleAdsMetrics.spentAmount || 0,
        clicks: latestRecord.googleAdsMetrics.clicks || 0,
        conversions: latestRecord.googleAdsMetrics.conversions || 0,
        calls: latestRecord.googleAdsMetrics.calls || 0,
        costPerClick: latestRecord.googleAdsMetrics.costPerClick || 0,
        costPerConversion: latestRecord.googleAdsMetrics.costPerConversion || 0,
        costPerCall: latestRecord.googleAdsMetrics.costPerCall || 0
      },
      totalSpend: (latestRecord.metaAdsMetrics.spentAmount || 0) + (latestRecord.googleAdsMetrics.spentAmount || 0),
      status: latestRecord.status
    };

    res.status(200).json({
      success: true,
      message: 'Latest ads data retrieved successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching latest ads data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};

// Get performance tracking for a client performance record
const getPerformanceTrackingData = async (req, res) => {
  try {
    const { clientPerformanceId } = req.params;

    if (!clientPerformanceId) {
      return res.status(400).json({ error: 'Client Performance ID is required' });
    }

    const trackingData = await getPerformanceTracking(clientPerformanceId);

    if (!trackingData) {
      return res.status(404).json({ 
        message: 'No tracking data found for this client performance record',
        data: null 
      });
    }

    res.status(200).json({
      message: 'Performance tracking data retrieved successfully',
      data: trackingData
    });
  } catch (error) {
    console.error('Error retrieving performance tracking:', error);
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
  getWeeksComparison,
  getLatestAdsData,
  getPerformanceTrackingData
};