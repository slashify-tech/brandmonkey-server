const { Task, Hits } = require("../models/activities"); // Adjust the path to where your models are defined
const { getDateFormatted } = require("../utils/formattedDate");
const Clients = require("../models/clients");

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, date, countId, type } =
      req.body;

    // Find client by name to get clientId
    const client = await Clients.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const clientId = client._id;

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, timeSlot, date, type });

    let isNewTask = false;

    if (!task) {
      // If no existing task found, create a new one
      task = new Task({
        employeeId,
        activity,
        clientName,
        clientId,
        timeSlot,
        date,
        type,
        countId,
      });

      // Save the task
      await task.save();
      isNewTask = true;
    } else {
      // Update the existing task
      task.activity = activity;
      task.clientName = clientName;
      task.clientId = clientId;
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    if (isNewTask) {
      // Extract month from date (assuming date format is YYYY-MM-DD or similar)
      const dateObj = new Date(date);
      const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      // Update hits or create new hit entry only if it's a new task
      let hit = await Hits.findOne({ employeeId, clientName, month });

      if (hit) {
        // Increment the number of hits
        hit.noOfHits += 1;
      } else {
        // Create a new hit entry
        hit = new Hits({
          employeeId,
          clientName,
          clientId,
          noOfHits: 1,
          month,
        });
      }

      // Save the hit
      await hit.save();
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createAdditionalTask = async (req, res) => {
  try {
    let { employeeId, activity, clientName, timeSlot, date, countId } =
      req.body;
    date = date?.trim();

    // Find client by name to get clientId
    const client = await Clients.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const clientId = client._id;

    // The type for additional tasks should be "extraActivity"
    const type = "extraActivity";

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, date, timeSlot, type });

    let isNewTask = false;

    if (!task) {
      // If no existing task found, create a new one
      task = new Task({
        employeeId,
        activity,
        clientName,
        clientId,
        timeSlot,
        date,
        type,
        countId,
      });

      // Save the task
      await task.save();
      isNewTask = true;
    } else {
      // Update the existing task
      task.activity = activity;
      task.clientName = clientName;
      task.clientId = clientId;
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    if (isNewTask) {
      // Extract month from date (assuming date format is YYYY-MM-DD or similar)
      const dateObj = new Date(date);
      const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      // Update hits or create new hit entry only if it's a new task
      let hit = await Hits.findOne({ employeeId, clientName, month });

      if (hit) {
        // Increment the number of hits
        hit.noOfHits += 1;
      } else {
        // Create a new hit entry
        hit = new Hits({
          employeeId,
          clientName,
          clientId,
          noOfHits: 1,
          month,
        });
      }

      // Save the hit
      await hit.save();
    }

    res
      .status(201)
      .json({ message: "Additional Task created successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date, type = "activity" } = req.query; // Type defaults to "activity"

    // Find tasks based on employeeId and type
    const tasks = await Task.find({ employeeId, type });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for the employee" });
    }

    // Filter tasks based on date
    let activities;
    if (date) {
      activities = tasks.filter((task) => task.date === date);
    } else {
      activities = tasks.filter((task) => task.date === getDateFormatted());
    }

    if (activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No activities found for the specified date" });
    }

    // Sort activities by countId in ascending order (assuming countId is a date string)
    activities.sort((a, b) => new Date(a.countId) - new Date(b.countId));

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getExtraActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    // Find tasks based on employeeId and type "extraActivity"
    const tasks = await Task.find({ employeeId, type: "extraActivity" });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No extra activities found for the employee" });
    }

    // Filter tasks based on date
    let activities;
    if (date) {
      activities = tasks.filter((task) => task.date === date);
    } else {
      activities = tasks.filter((task) => task.date === getDateFormatted());
    }

    if (activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No extra activities found for the specified date" });
    }

    // Sort activities by countId in ascending order (assuming countId is a date string)
    activities.sort((a, b) => new Date(a.countId) - new Date(b.countId));

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getExtraActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    // Find tasks based on employeeId and type "extraActivity"
    const tasks = await Task.find({ employeeId, type: "extraActivity" });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No extra activities found for the employee" });
    }

    // Filter tasks based on date
    let activities;
    if (date) {
      activities = tasks.filter((task) => task.date === date);
    } else {
      activities = tasks.filter((task) => task.date === getDateFormatted());
    }

    if (activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No extra activities found for the specified date" });
    }

    // Sort activities by countId in ascending order (assuming countId is a date string)
    activities.sort((a, b) => new Date(a.countId) - new Date(b.countId));

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getHitsByEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    // Find hits based on employeeId
    const hits = await Hits.find({ employeeId: id });

    if (!hits || hits.length === 0) {
      return res
        .status(404)
        .json({ message: "No hits found for the provided employee ID" });
    }

    // Aggregate hits by clientName to get total hits per client
    const hitsMap = new Map();
    
    hits.forEach((hit) => {
      const clientName = hit.clientName;
      if (hitsMap.has(clientName)) {
        hitsMap.set(clientName, hitsMap.get(clientName) + hit.noOfHits);
      } else {
        hitsMap.set(clientName, hit.noOfHits);
      }
    });
    
    // Convert map to array of objects
    const hitsData = Array.from(hitsMap.entries()).map(([clientName, totalHits]) => ({
      clientName,
      totalHits,
    }));

    res.status(200).json({ hits: hitsData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteAllHits = async () => {
  try {
    const result = await Hits.deleteMany();

    console.log("Hits deleted successfully");
    console.log({
      message: "All hits deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};


exports.getHitsByClients = async (req, res) => {
  try {
    const { clientId, month, employeeName, startDate, endDate } = req.body;
    console.log(clientId, month, employeeName, startDate, endDate);

    // Build query object
    const query = {};
    if (clientId) {
      query.clientId = clientId;
    }
    if (month) {
      query.month = month;
    }

    // Find hits based on query parameters
    let hits = await Hits.find(query).populate("employeeId", "name designation").populate("clientId", "name");

    // Filter by employee name if provided
    if (employeeName) {
      hits = hits.filter(hit => 
        hit.employeeId?.name?.toLowerCase().includes(employeeName.toLowerCase())
      );
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      hits = hits.filter(hit => {
        // Extract month from hit.month (format: YYYY-MM)
        if (!hit.month) return false;
        
        const hitMonth = hit.month;
        const hitYear = parseInt(hitMonth.split('-')[0]);
        const hitMonthNum = parseInt(hitMonth.split('-')[1]);
        
        // Create date objects for comparison
        const hitDate = new Date(hitYear, hitMonthNum - 1, 1);
        
        if (startDate) {
          const start = new Date(startDate);
          if (hitDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          // Set end date to last day of the month
          end.setMonth(end.getMonth() + 1, 0);
          if (hitDate > end) return false;
        }
        
        return true;
      });
    }

    if (!hits || hits.length === 0) {
      return res
        .status(404)
        .json({ message: "No hits found for the provided criteria" });
    }

    // Aggregate hits by client to get total hits per client
    const hitsMap = new Map();
    
    hits.forEach((hit) => {
      const clientKey = hit.clientId ? hit.clientId._id.toString() : hit.clientName;
      if (hitsMap.has(clientKey)) {
        const existing = hitsMap.get(clientKey);
        hitsMap.set(clientKey, {
          clientId: existing.clientId,
          clientName: existing.clientName,
          totalHits: existing.totalHits + hit.noOfHits,
          employees: [...existing.employees, {
            employeeId: hit.employeeId?._id,
            employeeName: hit.employeeId?.name,
            designation: hit.employeeId?.designation,
            hoursWorked: hit.noOfHits * 30 / 60,
            hits: hit.noOfHits
          }]
        });
      } else {
        hitsMap.set(clientKey, {
          clientId: hit.clientId?._id,
          clientName: hit.clientId?.name || hit.clientName,
          totalHits: hit.noOfHits,
          employees: [{
            employeeId: hit.employeeId?._id,
            employeeName: hit.employeeId?.name,
            designation: hit.employeeId?.designation,
            hoursWorked: hit.noOfHits * 30 / 60,
            hits: hit.noOfHits
          }]
        });
      }
    });

    // Convert map to array of objects and calculate contribution percentages
    const hitsData = Array.from(hitsMap.values()).map((client) => {
      // Calculate contribution percentage for each employee
      const employeesWithContribution = client.employees.map(emp => ({
        ...emp,
        contributionPercentage: ((emp.hits / client.totalHits) * 100).toFixed(2)
      }));

      return {
        clientId: client.clientId,
        clientName: client.clientName,
        totalHits: client.totalHits,
        totalHours: (client.totalHits * 30) / 60, // Convert hits to hours (30 min per hit)
        employees: employeesWithContribution
      };
    });

    // Sort by total hits descending
    hitsData.sort((a, b) => b.totalHits - a.totalHits);

    res.status(200).json({ 
      hits: hitsData,
      summary: {
        totalClients: hitsData.length,
        totalHits: hitsData.reduce((sum, client) => sum + client.totalHits, 0),
        totalHours: hitsData.reduce((sum, client) => sum + client.totalHours, 0)
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteTasksForMonth = async () => {
  try {
    await Task.deleteMany();
    console.log("deleted succesfully");
    console.log({ message: 'All tasks deleted successfully' });
  } catch (error) {
    console.log({ message: error.message });
  }
};