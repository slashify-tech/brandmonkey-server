const { Task, Hits } = require("../models/activities"); // Adjust the path to where your models are defined
const { getDateFormatted } = require("../utils/formattedDate");

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, date, countId, type } =
      req.body;

    // Find existing task for the employeeId with the same timeSlot and type
    let task = await Task.findOne({ employeeId, timeSlot, date, type });

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
    } else {
      // Update the existing task
      task.activity = activity;
      task.clientName = clientName;
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    // Update hits or create new hit entry
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
    } else {
      // Update the existing task
      task.activity = activity;
      task.clientName = clientName;
      task.date = date;
      task.countId = countId;

      // Save the updated task
      await task.save();
    }

    // Update hits or create new hit entry
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

    res
      .status(201)
      .json({ message: "Additional Task created successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

