const Finance = require("../models/finance");
const Clients = require("../models/clients");

// Create or update finance details
exports.createOrUpdateFinance = async (req, res) => {
  try {
    const { 
      clientId, 
      clientName, 
      month,
      clientRevenue,
      officeRent,
      marketingTools,
      emi,
      reimbursements,
      it_overheads,
      salaries,
      miscellaneous,
    } = req.body;

    // Validate required fields
    if (!clientId && !clientName) {
      return res.status(400).json({ error: "Client ID or Client Name is required" });
    }

    let actualClientId = clientId;
    let actualClientName = clientName;

    // If clientId is not provided, find client by name
    if (!actualClientId && actualClientName) {
      const client = await Clients.findOne({ name: actualClientName });
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      actualClientId = client._id;
      actualClientName = client.name;
    }

    // If clientName is not provided, find client by ID
    if (!actualClientName && actualClientId) {
      const client = await Clients.findById(actualClientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      actualClientName = client.name;
    }

    // Determine month (use provided month or current month)
    const currentMonth = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);

    // Check if finance record already exists
    let financeRecord = await Finance.findOne({ 
      clientId: actualClientId, 
      month: currentMonth 
    });

    if (financeRecord) {
      // Update existing record
      if (clientRevenue !== undefined) financeRecord.clientRevenue = clientRevenue;
      if (officeRent !== undefined) financeRecord.finance.officeRent = officeRent;
      if (marketingTools !== undefined) financeRecord.finance.marketingTools = marketingTools;
      if (emi !== undefined) financeRecord.finance.emi = emi;
      if (reimbursements !== undefined) financeRecord.finance.reimbursements = reimbursements;
      if (it_overheads !== undefined) financeRecord.finance.it_overheads = it_overheads;
      if (salaries !== undefined) financeRecord.finance.salaries = salaries;
      if (miscellaneous !== undefined) financeRecord.finance.miscellaneous = miscellaneous;
      await financeRecord.save();
    } else {
      // Create new record
      financeRecord = new Finance({
        clientId: actualClientId,
        month: currentMonth,
        clientRevenue: clientRevenue || 0,
        finance : {
          officeRent: officeRent || 0,
          marketingTools: marketingTools || 0,
          emi: emi || 0,
          reimbursements: reimbursements || 0,
          it_overheads: it_overheads || 0,
          salaries: salaries || 0,
          miscellaneous: miscellaneous || 0,
        }
      });
      await financeRecord.save();
    }

    res.status(201).json({ 
      message: "Finance details saved successfully", 
      finance: financeRecord 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get finance details for a specific client
exports.getFinanceByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { month } = req.query;

    const query = { clientId };
    if (month) {
      query.month = new Date(month).toISOString().slice(0, 7);
    }

    const financeRecords = await Finance.findOne(query).sort({ month: -1 });

    if (!financeRecords || financeRecords.length === 0) {
      return res.status(404).json({ message: "No finance records found for this client" });
    }
    const totalCosts = Object.values(financeRecords.finance).reduce((sum, cost) => sum + cost, 0);
    const totalRevenue = financeRecords.clientRevenue;
    const totalProfit = totalRevenue - totalCosts;
    const averageProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

    const finalData = {
      finance : financeRecords.finance,
      totalCosts,
      totalRevenue,
      totalProfit,
      averageProfitMargin
    }
    // console.log("Final Data:", finalData);
    res.status(200).json({ finance: finalData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get cost breakdown for a specific client
exports.getCostBreakdown = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { month } = req.query;

    const query = { clientId };
    if (month) {
      query.month = new Date(month).toISOString().slice(0, 7);
    }

    const financeRecord = await Finance.findOne(query).sort({ month: -1 });

    if (!financeRecord) {
      return res.status(404).json({ message: "No finance record found for this client" });
    }

    // Format the response to match the specified structure
    const costBreakdown = {
      clientRevenue: `$${financeRecord.clientRevenue.toLocaleString()}`,
      costs: {
        officeRent: `$${financeRecord.costs.officeRent.toLocaleString()}`,
        tools: `$${financeRecord.costs.tools.toLocaleString()}`,
        overheads: `$${financeRecord.costs.overheads.toLocaleString()}`,
        total: `$${financeRecord.costs.total.toLocaleString()}`,
      },
      profitability: {
        revenue: `$${financeRecord.profitability.revenue.toLocaleString()}`,
        cost: `$${financeRecord.profitability.cost.toLocaleString()}`,
        profit: `$${financeRecord.profitability.profit.toLocaleString()}`,
        margin: financeRecord.profitability.margin,
        isUp: financeRecord.profitability.isUp,
      },
    };

    res.status(200).json({ 
      success: true,
      message: "Cost breakdown retrieved successfully",
      data: costBreakdown,
      month: financeRecord.month,
      lastUpdated: financeRecord.updatedAt
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// // Get all finance details with filtering
// exports.getAllFinance = async (req, res) => {
//   try {
//     const { 
//       clientId, 
//       month, 
//       startMonth, 
//       endMonth,
//       minProfitMargin,
//       maxProfitMargin 
//     } = req.query;

//     const query = {};

//     if (clientId) {
//       query.clientId = clientId;
//     }

//     if (month) {
//       query.month = new Date(month).toISOString().slice(0, 7);
//     } else if (startMonth || endMonth) {
//       query.month = {};
//       if (startMonth) query.month.$gte = new Date(startMonth).toISOString().slice(0, 7);
//       if (endMonth) query.month.$lte = new Date(endMonth).toISOString().slice(0, 7);
//     }

//     if (minProfitMargin || maxProfitMargin) {
//       query.profitMargin = {};
//       if (minProfitMargin) query.profitMargin.$gte = parseFloat(minProfitMargin);
//       if (maxProfitMargin) query.profitMargin.$lte = parseFloat(maxProfitMargin);
//     }

//     const financeRecords = await Finance.find(query)
//       .populate("clientId", "name")
//       .sort({ month: -1 });

//     // Calculate summary statistics
//     const summary = {
//       totalRecords: financeRecords.length,
//       totalRevenue: financeRecords.reduce((sum, record) => sum + record.totalRevenue, 0),
//       totalCosts: financeRecords.reduce((sum, record) => sum + record.totalCosts, 0),
//       totalProfit: financeRecords.reduce((sum, record) => sum + record.profitAmount, 0),
//       averageProfitMargin: financeRecords.length > 0 
//         ? (financeRecords.reduce((sum, record) => sum + record.profitMargin, 0) / financeRecords.length).toFixed(2)
//         : 0
//     };

//     res.status(200).json({ 
//       finance: financeRecords,
//       summary 
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get profit margin analytics
// exports.getProfitAnalytics = async (req, res) => {
//   try {
//     const { clientId, startMonth, endMonth } = req.query;

//     const query = {};
//     if (clientId) query.clientId = clientId;
//     if (startMonth || endMonth) {
//       query.month = {};
//       if (startMonth) query.month.$gte = new Date(startMonth).toISOString().slice(0, 7);
//       if (endMonth) query.month.$lte = new Date(endMonth).toISOString().slice(0, 7);
//     }

//     const financeRecords = await Finance.find(query)
//       .populate("clientId", "name")
//       .sort({ month: -1 });

//     // Group by client for analytics
//     const clientAnalytics = {};
    
//     financeRecords.forEach(record => {
//       const clientName = record.clientId?.name || record.clientName;
      
//       if (!clientAnalytics[clientName]) {
//         clientAnalytics[clientName] = {
//           clientId: record.clientId,
//           clientName: clientName,
//           months: [],
//           totalRevenue: 0,
//           totalCosts: 0,
//           totalProfit: 0,
//           averageProfitMargin: 0
//         };
//       }

//       clientAnalytics[clientName].months.push({
//         month: record.month,
//         revenue: record.totalRevenue,
//         costs: record.totalCosts,
//         profit: record.profitAmount,
//         profitMargin: record.profitMargin
//       });

//       clientAnalytics[clientName].totalRevenue += record.totalRevenue;
//       clientAnalytics[clientName].totalCosts += record.totalCosts;
//       clientAnalytics[clientName].totalProfit += record.profitAmount;
//     });

//     // Calculate average profit margin for each client
//     Object.values(clientAnalytics).forEach(client => {
//       if (client.months.length > 0) {
//         const totalMargin = client.months.reduce((sum, month) => sum + parseFloat(month.profitMargin), 0);
//         client.averageProfitMargin = (totalMargin / client.months.length).toFixed(2);
//       }
//     });

//     res.status(200).json({ 
//       analytics: Object.values(clientAnalytics),
//       summary: {
//         totalClients: Object.keys(clientAnalytics).length,
//         totalRevenue: Object.values(clientAnalytics).reduce((sum, client) => sum + client.totalRevenue, 0),
//         totalCosts: Object.values(clientAnalytics).reduce((sum, client) => sum + client.totalCosts, 0),
//         totalProfit: Object.values(clientAnalytics).reduce((sum, client) => sum + client.totalProfit, 0)
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Delete finance record
// exports.deleteFinance = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const financeRecord = await Finance.findByIdAndDelete(id);

//     if (!financeRecord) {
//       return res.status(404).json({ message: "Finance record not found" });
//     }

//     res.status(200).json({ message: "Finance record deleted successfully" });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
