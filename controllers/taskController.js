const Task = require("../models/task");

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity } = req.body;
    if (!employeeId || !activity || !Array.isArray(activity)) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    for (const act of activity) {
      if (!act.cilentname || !act.activityDescription || !act.timeSlot) {
        return res.status(400).json({
          message:
            "Each activity must have cilentname, activityDescription, and timeSlot",
        });
      }
    }

    let existingTask = await Task.findOne({ employeeId });

    if (!existingTask) {
      existingTask = new Task({
        employeeId,
        activity,
      });
    } else {
      existingTask.activity = [...existingTask.activity, ...activity];

      activity.forEach((act) => {
        const clientName = act.cilentname;
        const clientHitIndex = existingTask.hit.findIndex(
          (hit) => hit.clientName === clientName
        );

        if (clientHitIndex !== -1) {
          existingTask.hit[clientHitIndex].noOfHits =
            (parseInt(existingTask.hit[clientHitIndex].noOfHits) || 0) + 1;
        } else {
          existingTask.hit.push({ clientName, noOfHits: "1" });
        }
      });
    }

    // Save the task to the database
    const savedTask = await existingTask.save();

    res.status(201).json({ message: "Task created successfully", savedTask });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
