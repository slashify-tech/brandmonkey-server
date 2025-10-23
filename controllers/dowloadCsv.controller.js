const { Task, Hits } = require("../models/activities");
const { formatDateTime } = require("../utils/formattedDate");
const { generateAndDownloadCSV } = require("../utils/generate-download-csv");
const Clients = require("../models/clients");
const Employees = require("../models/employee");
const ClientPerformance = require("../models/clientPerformance");
const json2csv = require("json2csv").parse;
const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");

exports.downloadSingleEmployeeSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Default type to "activity"

    // Fetch tasks for the employee by type
    const tasks = await Task.find({ employeeId: id }).populate(
      "employeeId",
      "name"
    );

    if (!tasks || tasks.length === 0) {
      return res.status(404).send("No data found for the employee");
    }

    let filteredTasks = tasks;

    if (date) {
      filteredTasks = tasks.filter((task) => {
        let itemMonthYear = task.date.split(" ").slice(1).join(" ");
        return itemMonthYear === date.split(" ").slice(1).join(" ");
      });
    }

    const activities = filteredTasks.map((task) => ({
      employeeName: task.employeeId.name,
      clientName: task.clientName,
      activity: task.activity,
      timeSlot: task.timeSlot,
      time: formatDateTime(task.createdAt),
      date: task.date,
    }));

    await generateAndDownloadCSV(
      activities,
      "employee_activities.csv",
      ["employeeName", "clientName", "activity", "timeSlot", "time", "date"],
      res
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadAllEmployeeData = async (req, res) => {
  try {
    const { date } = req.query;
    const tasks = await Task.find({}).populate("employeeId", "name");

    if (!tasks || tasks.length === 0) {
      return res.status(404).send("No data found for any employees");
    }

    const allEmployeeData = [];

    tasks.forEach((task) => {
      if (date) {
        let itemMonthYear = task.date.split(" ").slice(1).join(" ");
        if (itemMonthYear !== date.split(" ").slice(1).join(" ")) {
          return;
        }
      }
      allEmployeeData.push({
        EmployeeName: task.employeeId?.name,
        ClientName: task.clientName,
        Activity: task.activity?.replace("=", ""),
        TimeSlot: task.timeSlot,
        Time: formatDateTime(task.createdAt),
        Date: task.date,
      });
    });

    await generateAndDownloadCSV(
      allEmployeeData,
      "all_activities.csv",
      ["EmployeeName", "ClientName", "Activity", "TimeSlot", "Time", "Date"],
      res
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadAllEmployeeHit = async (req, res) => {
  try {
    const hits = await Hits.find({}).populate("employeeId", "name");

    if (!hits || hits.length === 0) {
      return res.status(404).send("No hits found for any employee");
    }

    // Aggregate hits by employee and client to get total hits per combination
    const hitsMap = new Map();
    
    hits.forEach((hit) => {
      const key = `${hit.employeeId?.name}_${hit.clientName}`;
      if (hitsMap.has(key)) {
        const existing = hitsMap.get(key);
        hitsMap.set(key, {
          employeeName: existing.employeeName,
          clientName: existing.clientName,
          totalHits: existing.totalHits + hit.noOfHits,
        });
      } else {
        hitsMap.set(key, {
          employeeName: hit.employeeId?.name,
          clientName: hit.clientName,
          totalHits: hit.noOfHits,
        });
      }
    });
    
    // Convert map to array and calculate total hours
    let allHits = Array.from(hitsMap.values()).map((hit) => ({
      "Employee Name": hit.employeeName,
      "Client Name": hit.clientName,
      "Total Hours": (hit.totalHits * 30) / 60 + " hrs",
    }));

    await generateAndDownloadCSV(
      allHits,
      "all_employee_hits.csv",
      ["Employee Name", "Client Name", "Total Hours"],
      res
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadCsvEmployees = async (req, res) => {
  try {
    let data;
    let csvData;

    data = await Employees.find({});
    // Custom transformation function for the "clients" field
    const transformClientsField = (value) => {
      // Assuming "clients" is an array of objects
      return Array.isArray(value)
        ? value.map((client) => `${client.clientName.trim()}`).join(", ")
        : value;
    };
    csvData = json2csv(data, {
      fields: [
        "name",
        "employeeId",
        "team",
        "services",
        "email",
        "password",
        "designation",
        "type",
        "phoneNumber",
        "progressPercentage",
        {
          label: "clients",
          value: (row) => transformClientsField(row.clients),
        },
      ],
    });

    fs.writeFileSync("exportedEmployeeData.csv", csvData);

    res.download(
      "exportedEmployeeData.csv",
      "exportedEmployeeData.csv",
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        }
      }
    );
  } catch (err) {
    console.log(err);
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadCsvClients = async (req, res) => {
  try {
    const data = await Clients.find({});

    if (data.length === 0) {
      return res.status(404).send("No data found");
    }

    const allFields = new Set();
    data.forEach((employee) => {
      Object.keys(employee._doc).forEach((field) => {
        allFields.add(field);
      });
    });

    const fieldsArray = Array.from(allFields);

    const csvData = json2csv(data, { fields: fieldsArray });

    const fileName = "exportedClientData.csv";
    fs.writeFileSync(fileName, csvData);

    res.download(fileName, "exportedClientData.csv", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }

      fs.unlinkSync(fileName);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadClientPerformanceData = async (req, res) => {
  try {
    const { month, week } = req.query;
    
    // Build query filters
    const query = {};
    if (month) query.month = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    if (week) query.week = parseInt(week);

    const performanceData = await ClientPerformance.find(query)
      .populate("clientId", "name email phoneNumber")
      .sort({ month: -1, week: -1, lastUpdated: -1 });

    if (!performanceData || performanceData.length === 0) {
      return res.status(404).send("No client performance data found");
    }

    const allPerformanceData = [];

    performanceData.forEach((performance) => {
      allPerformanceData.push({
        ClientName: performance.clientId?.name || "N/A",
        ClientEmail: performance.clientId?.email || "N/A",
        ClientPhone: performance.clientId?.phoneNumber || "N/A",
        Status: performance.status,
        Month: performance.month,
        Week: performance.week,
        LastUpdated: formatDateTime(performance.lastUpdated),
        
        // Social Media Metrics
        SocialMediaReach: performance.socialMediaMetrics?.reach || 0,
        SocialMediaFollowers: performance.socialMediaMetrics?.followers || 0,
        AvgEngagement: performance.socialMediaMetrics?.avgEngagement || 0,
        GraphicsPost: performance.socialMediaMetrics?.graphicsPost || 0,
        UGC: performance.socialMediaMetrics?.ugc || 0,
        Reels: performance.socialMediaMetrics?.reels || 0,
        MaxReels: performance.socialMediaMetrics?.maxReels || 0,
        MaxGraphicsPost: performance.socialMediaMetrics?.maxGraphicsPost || 0,
        MaxUGC: performance.socialMediaMetrics?.maxUgc || 0,
        
        // Meta Ads Metrics
        MetaSpentAmount: performance.metaAdsMetrics?.spentAmount || 0,
        MetaROAS: performance.metaAdsMetrics?.roas || 0,
        MetaLeads: performance.metaAdsMetrics?.leads || 0,
        MetaMessages: performance.metaAdsMetrics?.messages || 0,
        MetaCostPerLead: performance.metaAdsMetrics?.costPerLead || 0,
        MetaCostPerMessage: performance.metaAdsMetrics?.costPerMessage || 0,
        
        // Google Ads Metrics
        GoogleSpentAmount: performance.googleAdsMetrics?.spentAmount || 0,
        GoogleClicks: performance.googleAdsMetrics?.clicks || 0,
        GoogleConversions: performance.googleAdsMetrics?.conversions || 0,
        GoogleCalls: performance.googleAdsMetrics?.calls || 0,
        GoogleCostPerClick: performance.googleAdsMetrics?.costPerClick || 0,
        GoogleCostPerConversion: performance.googleAdsMetrics?.costPerConversion || 0,
        GoogleCostPerCall: performance.googleAdsMetrics?.costPerCall || 0,
      });
    });

    await generateAndDownloadCSV(
      allPerformanceData,
      "client_performance_data.csv",
      [
        "ClientName", "ClientEmail", "ClientPhone", "Status", "Month", "Week", "LastUpdated",
        "SocialMediaReach", "SocialMediaFollowers", "AvgEngagement", "GraphicsPost", "UGC", "Reels", 
        "MaxReels", "MaxGraphicsPost", "MaxUGC",
        "MetaSpentAmount", "MetaROAS", "MetaLeads", "MetaMessages", "MetaCostPerLead", "MetaCostPerMessage",
        "GoogleSpentAmount", "GoogleClicks", "GoogleConversions", "GoogleCalls", "GoogleCostPerClick", 
        "GoogleCostPerConversion", "GoogleCostPerCall"
      ],
      res
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadSingleClientPerformanceData = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { month, week } = req.query;
    
    // Build query filters
    const query = { clientId };
    if (month) query.month = new Date(month).toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
    if (week) query.week = parseInt(week);

    const performanceData = await ClientPerformance.find(query)
      .populate("clientId", "name email phoneNumber")
      .sort({ month: -1, week: -1, lastUpdated: -1 });

    if (!performanceData || performanceData.length === 0) {
      return res.status(404).send("No performance data found for this client");
    }

    const clientPerformanceData = [];

    performanceData.forEach((performance) => {
      clientPerformanceData.push({
        ClientName: performance.clientId?.name || "N/A",
        ClientEmail: performance.clientId?.email || "N/A",
        ClientPhone: performance.clientId?.phoneNumber || "N/A",
        Status: performance.status,
        Month: performance.month,
        Week: performance.week,
        LastUpdated: formatDateTime(performance.lastUpdated),
        
        // Social Media Metrics
        SocialMediaReach: performance.socialMediaMetrics?.reach || 0,
        SocialMediaFollowers: performance.socialMediaMetrics?.followers || 0,
        AvgEngagement: performance.socialMediaMetrics?.avgEngagement || 0,
        GraphicsPost: performance.socialMediaMetrics?.graphicsPost || 0,
        UGC: performance.socialMediaMetrics?.ugc || 0,
        Reels: performance.socialMediaMetrics?.reels || 0,
        MaxReels: performance.socialMediaMetrics?.maxReels || 0,
        MaxGraphicsPost: performance.socialMediaMetrics?.maxGraphicsPost || 0,
        MaxUGC: performance.socialMediaMetrics?.maxUgc || 0,
        
        // Meta Ads Metrics
        MetaSpentAmount: performance.metaAdsMetrics?.spentAmount || 0,
        MetaROAS: performance.metaAdsMetrics?.roas || 0,
        MetaLeads: performance.metaAdsMetrics?.leads || 0,
        MetaMessages: performance.metaAdsMetrics?.messages || 0,
        MetaCostPerLead: performance.metaAdsMetrics?.costPerLead || 0,
        MetaCostPerMessage: performance.metaAdsMetrics?.costPerMessage || 0,
        
        // Google Ads Metrics
        GoogleSpentAmount: performance.googleAdsMetrics?.spentAmount || 0,
        GoogleClicks: performance.googleAdsMetrics?.clicks || 0,
        GoogleConversions: performance.googleAdsMetrics?.conversions || 0,
        GoogleCalls: performance.googleAdsMetrics?.calls || 0,
        GoogleCostPerClick: performance.googleAdsMetrics?.costPerClick || 0,
        GoogleCostPerConversion: performance.googleAdsMetrics?.costPerConversion || 0,
        GoogleCostPerCall: performance.googleAdsMetrics?.costPerCall || 0,
      });
    });

    const clientName = performanceData[0]?.clientId?.name || "Client";
    const fileName = `${clientName.replace(/\s+/g, '_')}_performance_data.csv`;

    await generateAndDownloadCSV(
      clientPerformanceData,
      fileName,
      [
        "ClientName", "ClientEmail", "ClientPhone", "Status", "Month", "Week", "LastUpdated",
        "SocialMediaReach", "SocialMediaFollowers", "AvgEngagement", "GraphicsPost", "UGC", "Reels", 
        "MaxReels", "MaxGraphicsPost", "MaxUGC",
        "MetaSpentAmount", "MetaROAS", "MetaLeads", "MetaMessages", "MetaCostPerLead", "MetaCostPerMessage",
        "GoogleSpentAmount", "GoogleClicks", "GoogleConversions", "GoogleCalls", "GoogleCostPerClick", 
        "GoogleCostPerConversion", "GoogleCostPerCall"
      ],
      res
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
