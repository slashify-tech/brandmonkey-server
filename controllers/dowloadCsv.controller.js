const { Task, Hits } = require("../models/activities");
const { formatDateTime } = require("../utils/formattedDate");
const { generateAndDownloadCSV } = require("../utils/generate-download-csv");

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

    let allHits = hits.map((hit) => ({
      "Employee Name": hit.employeeId?.name,
      "Client Name": hit.clientName,
      "Total Hours": (hit.noOfHits * 30) / 60 + " hrs",
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
