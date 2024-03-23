const Task = require("../models/taskUpdation");
const fs = require("fs");
const path = require("path");
const { json2csv } = require("json-2-csv");
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const day = dateTime.toLocaleDateString(undefined, { weekday: 'long' });
  const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return `${day} ${time}`;
}


exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, _id } = req.body;
    console.log(employeeId, activity, clientName, timeSlot, _id);

    let newTask = await Task.findOne({ employeeId });

    if (!newTask) {
      newTask = new Task({
        employeeId,
        activity: [{ activity: activity, timeSlot, clientName: clientName }],
        hits: [{ clientName, noOfHits: parseInt(1) }],
      });
    } else {
      if (!newTask.activity) {
        newTask.activity = [];
      }

      // Check if hits array exists, if not initialize it
      if (!newTask.hits) {
        newTask.hits = [];
      }

      // Check if an activity with the same time slot exists
      const existingActivityIndex = newTask.activity.findIndex(
        (act) =>
          act.timeSlot === timeSlot && act._id.toString() === _id.toString()
      );
      console.log(existingActivityIndex);
      if (existingActivityIndex !== -1) {
        // Update the existing activity if the time slot matches
        const existingActivity = newTask.activity[existingActivityIndex];
        existingActivity.activity = activity;
        existingActivity.clientName = clientName;
        existingActivity.timeSlot = timeSlot;
      } else {
        // Otherwise, add a new activity
        newTask.activity.unshift({
          activity: activity,
          timeSlot,
          clientName: clientName,
        });

        // Update hits array
        const hitsIndex = newTask.hits.findIndex(
          (hit) => hit.clientName === clientName
        );
        if (hitsIndex !== -1) {
          // If clientName exists, increment noOfHits
          newTask.hits[hitsIndex].noOfHits += parseInt(1);
        } else {
          // If clientName doesn't exist, create a new entry
          newTask.hits.push({ clientName, noOfHits: parseInt(1) });
        }
      }
    }

    await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createAdditionalTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, _id } = req.body;
    console.log(employeeId, activity, clientName, timeSlot, _id);

    let newTask = await Task.findOne({ employeeId });

    if (!newTask) {
      res.status(404).json({
        message:
          "you have not used the set amount of slots use them before creating additional",
      });
    } else {
      if (!newTask.extraActivity) {
        newTask.extraActivity = [];
      }

      // Check if an activity with the same time slot exists
      const existingActivityIndex = newTask.extraActivity.findIndex(
        (act) =>
          act.timeSlot === timeSlot && act._id.toString() === _id.toString()
      );
      console.log(existingActivityIndex);
      if (existingActivityIndex !== -1) {
        // Update the existing activity if the time slot matches
        const existingActivity = newTask.extraActivity[existingActivityIndex];
        existingActivity.activity = activity;
        existingActivity.clientName = clientName;
        existingActivity.timeSlot = timeSlot;
      } else {
        // Otherwise, add a new activity
        newTask.extraActivity.unshift({
          activity: activity,
          timeSlot,
          clientName: clientName,
        });
        if (!newTask.hits) {
          newTask.hits = [];
        }

        const existingHit = newTask.hits.find(
          (hit) => hit.clientName === clientName
        );
        if (existingHit) {
          existingHit.noOfHits = parseInt(existingHit.noOfHits) + parseInt(1);
        } else {
          newTask.hits.unshift({ clientName, noOfHits: parseInt(1) });
        }
      }
    }

    await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


function getDateFormatted() {
  const currentDate = new Date();
  const dayOfMonth = currentDate.getDate();
  const year = currentDate.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[currentDate.getMonth()];
  return `${dayOfMonth} ${month} ${year}`;
}


exports.getActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query; // Assuming date is passed as a parameter in the request

    const tasks = await Task.findOne({ employeeId });

    if (!tasks) {
      return res
        .status(404)
        .json({ message: "No tasks found for the employee" });
    }

    let activities;
    if (date) {
      activities = tasks.activity.filter((activity) => activity.date === date);
    } else {
      activities = tasks.activity.filter(
        (activity) => activity.date === getDateFormatted()
      );
    }

    if (activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No activities found for the specified date" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getExtraActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query; // Assuming date is passed as a parameter in the request

    const tasks = await Task.findOne({ employeeId });

    if (!tasks) {
      return res
        .status(404)
        .json({ message: "No tasks found for the employee" });
    }

    let activities;
    if (date) {
      activities = tasks.extraActivity.filter(
        (activity) => activity.date === date
      );
    } else {
      activities = tasks.extraActivity.filter(
        (activity) => activity.date === getDateFormatted()
      );
    }

    if (activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No activities found for the specified date" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getHitsByEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ employeeId: id });

    if (!task) {
      return res
        .status(404)
        .json({ message: "No task found for the provided employee ID" });
    }

    const hits = task.hits.map((hit) => ({
      clientName: hit.clientName,
      noOfHits: hit.noOfHits,
    }));

    res.status(200).json({ hits });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteActivitiesByMonthYear = async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Parse the month and year from the provided string
    const { month, year } = moment(monthYear, "MMM YYYY").toObject();

    // Calculate the start and end dates of the provided month
    const startDate = moment().month(month).year(year).startOf("month");
    const endDate = moment().month(month).year(year).endOf("month");

    // Find tasks matching the provided month and year
    const tasks = await Task.find({
      $or: [
        { "activity.date": { $gte: startDate, $lte: endDate } },
        { "extraActivity.date": { $gte: startDate, $lte: endDate } },
      ],
    });

    // Delete activities and extra activities matching the provided month and year
    await Promise.all(
      tasks.map(async (task) => {
        task.activity = task.activity.filter(
          (activity) =>
            !moment(activity.date, "DD MMM YYYY").isBetween(
              startDate,
              endDate,
              null,
              "[]"
            )
        );
        task.extraActivity = task.extraActivity.filter(
          (extraActivity) =>
            !moment(extraActivity.date, "DD MMM YYYY").isBetween(
              startDate,
              endDate,
              null,
              "[]"
            )
        );
        task.hits = []; // Empty the hits array
        await task.save();
      })
    );

    res
      .status(200)
      .json({ message: `Activities for ${monthYear} deleted successfully` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const generateAndDownloadCSV = async (data, filename, fields, res) => {
  try {
    const csvData = json2csv(data, { fields });
    const folderPath = path.join(__dirname, '..', 'csv_exports');

    if (!fs.existsSync(folderPath)) {
      await mkdirAsync(folderPath);
    }

    const filePath = path.join(folderPath, filename);

    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }

    await writeFileAsync(filePath, csvData);

    res.download(filePath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.downloadSingleEmployeeSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const data = await Task.findOne({ employeeId: id }).populate('employeeId', 'name');

    if (!data) {
      return res.status(404).send('No data found for the employee');
    }

    let combinedActivities = [...data.activity, ...data.extraActivity];

    if (date) {
      combinedActivities = combinedActivities.filter((item) => {
        const itemMonthYear = item.date.split(' ').slice(1).join(' ');
        return itemMonthYear === date;
      });
    }

    const activities = combinedActivities.map((entry) => ({
      employeeName: data.employeeId.name,
      clientName: entry.clientName,
      activity: entry.activity,
      timeSlot: entry.timeSlot,
      time: formatDateTime(entry.createdAt),
      date: entry.date,
    }));

    await generateAndDownloadCSV(activities, 'employee_activities.csv', ['clientName', 'activity', 'timeSlot', 'date'], res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.downloadAllEmployeeData = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('employeeId', 'name');

    if (!tasks || tasks.length === 0) {
      return res.status(404).send('No data found for any employees');
    }

    const allEmployeeData = [];

    tasks.forEach((task) => {
      const combinedActivities = [...task.activity, ...task.extraActivity];
      combinedActivities.forEach((activity) => {
        allEmployeeData.push({
          EmployeeName: task.employeeId.name,
          ClientName: activity.clientName,
          Activity: activity.activity,
          TimeSlot: activity.timeSlot,
          Time: formatDateTime(activity.createdAt),
          Date: activity.date,
        });
      });
    });

    await generateAndDownloadCSV(allEmployeeData, 'all_activities.csv', ['EmployeeName', 'ClientName', 'Activity', 'TimeSlot', "Time", 'Date'], res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.downloadAllEmployeeHit = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('employeeId', 'name');

    if (!tasks || tasks.length === 0) {
      return res.status(404).send('No tasks found');
    }

    let allHits = [];

    tasks.forEach((task) => {
      if (task.hits && task.hits.length > 0) {
        task.hits.forEach((hit) => {
          allHits.push({
            "Employee Name": task.employeeId.name,
            "Client Name": hit.clientName,
            "Total Hours": (hit.noOfHits * 30) / 60 + " hrs",
          });
        });
      }
    });

    if (allHits.length === 0) {
      return res.status(404).send('No hits found for any employee');
    }

    await generateAndDownloadCSV(allHits, 'all_employee_hits.csv', ['Employee Name', 'Client Name', 'Total Hours'], res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};