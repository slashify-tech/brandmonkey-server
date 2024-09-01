const { Task, Hits } = require("../models/activities"); // Adjust the path to where your models are defined
const { getDateFormatted } = require("../utils/formattedDate");

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, date, countId, type } =
      req.body;

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, timeSlot, date, type });

    let isNewTask = false;

    if (!task) {
      // If no existing task found, create a new one
      task = new Task({
        employeeId,
        activity,
        clientName,
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
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    if (isNewTask) {
      // Update hits or create new hit entry only if it's a new task
      let hit = await Hits.findOne({ employeeId, clientName });

      if (hit) {
        // Increment the number of hits
        hit.noOfHits += 1;
      } else {
        // Create a new hit entry
        hit = new Hits({
          employeeId,
          clientName,
          noOfHits: 1,
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
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    if (isNewTask) {
      // Update hits or create new hit entry only if it's a new task
      let hit = await Hits.findOne({ employeeId, clientName });

      if (hit) {
        // Increment the number of hits
        hit.noOfHits += 1;
      } else {
        // Create a new hit entry
        hit = new Hits({
          employeeId,
          clientName,
          noOfHits: 1,
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

    // Map hits to extract relevant information
    const hitsData = hits.map((hit) => ({
      clientName: hit.clientName,
      noOfHits: hit.noOfHits,
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


exports.deleteTasksForMonth = async () => {
  try {
    await Task.deleteMany();
    console.log("deleted succesfully");
    console.log({ message: 'All tasks deleted successfully' });
  } catch (error) {
    console.log({ message: error.message });
  }
};