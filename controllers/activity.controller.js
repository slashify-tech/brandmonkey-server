const { Task, Hits } = require("../models/activities"); // Adjust the path to where your models are defined
const { getDateFormatted, formatDateFromISO } = require("../utils/formattedDate");
const Clients = require("../models/clients");
const Employees = require("../models/employee");

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, date, countId, type } =
      req.body;

    // Format the date from ISO string to "20 Oct 2025" format
    const formattedDate = formatDateFromISO(date);

    // Find client by name to get clientId
    const client = await Clients.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const clientId = client._id;

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, timeSlot, date: formattedDate, type, isDeleted: false });

    let isNewTask = false;

    if (!task) {
      // If no existing task found, create a new one
      task = new Task({
        employeeId,
        activity,
        clientName,
        clientId,
        timeSlot,
        date: formattedDate,
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
      task.date = formattedDate;
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

    // Format the date from ISO string to "20 Oct 2025" format
    const formattedDate = formatDateFromISO(date);

    // Find client by name to get clientId
    const client = await Clients.findOne({ name: clientName });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const clientId = client._id;

    // The type for additional tasks should be "extraActivity"
    const type = "extraActivity";

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, date: formattedDate, timeSlot, type, isDeleted: false });

    let isNewTask = false;

    if (!task) {
      // If no existing task found, create a new one
      task = new Task({
        employeeId,
        activity,
        clientName,
        clientId,
        timeSlot,
        date: formattedDate,
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
      task.date = formattedDate;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    if (isNewTask) {
      // Extract month from date (using original ISO date for month calculation)
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

    // Validate date if provided - should not be more than 30 days in the past
    if (date) {
      const requestedDate = new Date(date);
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      
      // Check if the requested date is more than 30 days in the past
      if (requestedDate < thirtyDaysAgo) {
        return res.status(400).json({ 
          message: "Date cannot be more than 30 days in the past" 
        });
      }
    }

    // Find tasks based on employeeId and type
    const tasks = await Task.find({ employeeId, type, isDeleted: false });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for the employee" });
    }

    // Filter tasks based on date
    let activities;
    if (date) {
      // Convert ISO date string to formatted date for comparison
      const formattedDate = formatDateFromISO(date);
      activities = tasks.filter((task) => task.date === formattedDate);
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

    // Validate date if provided - should not be more than 30 days in the past
    if (date) {
      const requestedDate = new Date(date);
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      
      // Check if the requested date is more than 30 days in the past
      if (requestedDate < thirtyDaysAgo) {
        return res.status(400).json({ 
          message: "Date cannot be more than 30 days in the past" 
        });
      }
    }
    
    // Find tasks based on employeeId and type "extraActivity"
    const tasks = await Task.find({ employeeId, type: "extraActivity", isDeleted: false });

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No extra activities found for the employee" });
    }

    // Filter tasks based on date
    let activities;
    if (date) {
      // Convert ISO date string to formatted date for comparison
      const formattedDate = formatDateFromISO(date);
      activities = tasks.filter((task) => task.date === formattedDate);
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
    await Hits.updateMany({ isDeleted: false }, { $set: { isDeleted: true } });
    console.log("Hits deleted successfully");
    console.log({ message: 'All hits deleted successfully' });
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
    
    const employeeTotalHits = new Map();
    // Convert map to array of objects and calculate contribution percentages

    // Get total hits for current month across all clients
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthHits = await Hits.find({ month: currentMonth });
    const totalHitsThisMonth = currentMonthHits.reduce((sum, hit) => sum + hit.noOfHits, 0);

    // Calculate total hits for each employee in current month
    currentMonthHits.forEach(hit => {
      if (hit.employeeId) {
        const empId = hit.employeeId.toString();
        employeeTotalHits.set(empId, (employeeTotalHits.get(empId) || 0) + hit.noOfHits);
      }
    });

    // Fetch employee salary data for per hour calculation
    const employeeIds = Array.from(employeeTotalHits.keys());
    const employees = await Employees.find({ _id: { $in: employeeIds } }, 'name monthlySalary designation');
    
    // Create a map of employee salary data
    const employeeSalaryMap = new Map();
    employees.forEach(emp => {
      employeeSalaryMap.set(emp._id.toString(), {
        name: emp.name,
        monthlySalary: emp.monthlySalary,
        designation: emp.designation
      });
    });

    const hitsData = Array.from(hitsMap.values()).map((client) => {
      let totalPrice = 0;
      // Calculate contribution percentage and total hits for each employee
      const employeesWithContribution = client.employees.map(emp => {
        const employeeData = employeeSalaryMap.get(emp.employeeId?.toString());
        const totalHitsThisMonth = employeeTotalHits.get(emp.employeeId?.toString()) || 0;
        const totalHoursThisMonth = (totalHitsThisMonth * 30) / 60;
        const perHourPrice = employeeData && employeeData.monthlySalary > 0 && totalHoursThisMonth > 0 
          ? (employeeData.monthlySalary / totalHoursThisMonth).toFixed(2)
          : 0;
        totalPrice = totalPrice + (perHourPrice * emp.hits * 30 / 60);
        perEmpTotalPrice = (perHourPrice * emp.hits * 30 / 60);

        return {
          ...emp,
          contributionPercentage: ((emp.hits / client.totalHits) * 100).toFixed(2),
          totalHitsThisMonth: totalHitsThisMonth,
          totalHoursThisMonth: totalHoursThisMonth,
          monthlySalary: employeeData?.monthlySalary || 0,
          perHourPrice: parseFloat(perHourPrice),
          totalPrice: parseFloat(perEmpTotalPrice),
        };
      });

      return {
        clientId: client.clientId,
        clientName: client.clientName,
        totalHits: client.totalHits,
        totalHours: (client.totalHits * 30) / 60, // Convert hits to hours (30 min per hit)
        employees: employeesWithContribution,
        totalPrice: parseFloat(totalPrice)
      };
    });

    // Sort by total hits descending
    hitsData.sort((a, b) => b.totalHits - a.totalHits);

    res.status(200).json({ 
      hits: hitsData,
      summary: {
        totalClients: hitsData.length,
        totalHits: hitsData.reduce((sum, client) => sum + client.totalHits, 0),
        totalHours: hitsData.reduce((sum, client) => sum + client.totalHours, 0),
        totalHitsThisMonth: totalHitsThisMonth,
        currentMonth: currentMonth
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getHitsByEmployee = async (req, res) => {
  try {
    const { employeeId, month, clientName, startDate, endDate } = req.body;
    console.log(employeeId, month, clientName, startDate, endDate);

    // Build query object
    const query = {};
    if (employeeId) {
      query.employeeId = employeeId;
    }
    if (month) {
      query.month = month;
    }

    // Find hits based on query parameters
    let hits = await Hits.find(query).populate("employeeId", "name designation").populate("clientId", "name");

    // Filter by client name if provided
    if (clientName) {
      hits = hits.filter(hit => 
        hit.clientId?.name?.toLowerCase().includes(clientName.toLowerCase()) ||
        hit.clientName?.toLowerCase().includes(clientName.toLowerCase())
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

    // Aggregate hits by employee to get total hits per employee
    const hitsMap = new Map();
    
    hits.forEach((hit) => {
      const employeeKey = hit.employeeId ? hit.employeeId._id.toString() : hit.employeeName;
      if (hitsMap.has(employeeKey)) {
        const existing = hitsMap.get(employeeKey);
        hitsMap.set(employeeKey, {
          employeeId: existing.employeeId,
          employeeName: existing.employeeName,
          designation: existing.designation,
          totalHits: existing.totalHits + hit.noOfHits,
          clients: [...existing.clients, {
            clientId: hit.clientId?._id,
            clientName: hit.clientId?.name || hit.clientName,
            hoursWorked: hit.noOfHits * 30 / 60,
            hits: hit.noOfHits
          }]
        });
      } else {
        hitsMap.set(employeeKey, {
          employeeId: hit.employeeId?._id,
          employeeName: hit.employeeId?.name || hit.employeeName,
          designation: hit.employeeId?.designation,
          totalHits: hit.noOfHits,
          clients: [{
            clientId: hit.clientId?._id,
            clientName: hit.clientId?.name || hit.clientName,
            hoursWorked: hit.noOfHits * 30 / 60,
            hits: hit.noOfHits
          }]
        });
      }
    });
    
    const clientTotalHits = new Map();
    // Convert map to array of objects and calculate contribution percentages

    // Get total hits for current month across all employees
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthHits = await Hits.find({ month: currentMonth });
    const totalHitsThisMonth = currentMonthHits.reduce((sum, hit) => sum + hit.noOfHits, 0);

    // Calculate total hits for each client in current month
    currentMonthHits.forEach(hit => {
      if (hit.clientId) {
        const clientId = hit.clientId.toString();
        clientTotalHits.set(clientId, (clientTotalHits.get(clientId) || 0) + hit.noOfHits);
      }
    });

    // Fetch client data for additional information
    const clientIds = Array.from(clientTotalHits.keys());
    const clients = await Clients.find({ _id: { $in: clientIds } }, 'name');
    
    // Create a map of client data
    const clientDataMap = new Map();
    clients.forEach(client => {
      clientDataMap.set(client._id.toString(), {
        name: client.name
      });
    });

    const hitsData = Array.from(hitsMap.values()).map((employee) => {
      // Calculate contribution percentage and total hits for each client
      const clientsWithContribution = employee.clients.map(client => {
        const totalHitsThisMonth = clientTotalHits.get(client.clientId?.toString()) || 0;
        const totalHoursThisMonth = (totalHitsThisMonth * 30) / 60;

        return {
          ...client,
          contributionPercentage: ((client.hits / employee.totalHits) * 100).toFixed(2),
          totalHitsThisMonth: totalHitsThisMonth,
          totalHoursThisMonth: totalHoursThisMonth
        };
      });

      return {
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        designation: employee.designation,
        totalHits: employee.totalHits,
        totalHours: (employee.totalHits * 30) / 60, // Convert hits to hours (30 min per hit)
        clients: clientsWithContribution
      };
    });

    // Sort by total hits descending
    hitsData.sort((a, b) => b.totalHits - a.totalHits);

    res.status(200).json({ 
      hits: hitsData,
      summary: {
        totalEmployees: hitsData.length,
        totalHits: hitsData.reduce((sum, employee) => sum + employee.totalHits, 0),
        totalHours: hitsData.reduce((sum, employee) => sum + employee.totalHours, 0),
        totalHitsThisMonth: totalHitsThisMonth,
        currentMonth: currentMonth
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteTasksForMonth = async () => {
  try {
    await Task.updateMany({ isDeleted: false }, { $set: { isDeleted: true } });
    console.log("deleted succesfully");
    console.log({ message: 'All tasks deleted successfully' });
  } catch (error) {
    console.log({ message: error.message });
  }
};