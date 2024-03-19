const Task = require("../models/taskUpdation");

// exports.createTask = async (req, res) => {
//   try {
//     const { employeeId, activity, clientName, timeSlot } = req.body;
//     if (!employeeId || !activity || activity) {
//       return res.status(400).json({ message: "Invalid request data" });
//     }
//     for (const act of activity) {
//       if (!act.cilentname || !act.activity || !act.timeSlot) {
//         return res.status(400).json({
//           message:
//             "Each activity must have cilentname, activity, and timeSlot",
//         });
//       }
//     }

//     let existingTask = await Task.findOne({ employeeId });

//     if (!existingTask) {
//       existingTask = new Task({
//         employeeId,
//         activity,
//         clientName,
//         timeSlot,
//       });
//     } else {
//       existingTask.activity = [...existingTask.activity, ...activity];

//       activity.forEach((act) => {
//         const clientName = act.cilentname;
//         const clientHitIndex = existingTask.hit.findIndex(
//           (hit) => hit.clientName === clientName
//         );

//         if (clientHitIndex !== -1) {
//           existingTask.hit[clientHitIndex].noOfHits =
//             (parseInt(existingTask.hit[clientHitIndex].noOfHits) || 0) + 1;
//         } else {
//           existingTask.hit.push({ clientName, noOfHits: "1" });
//         }
//       });
//     }

//     // Save the task to the database
//     const savedTask = await existingTask.save();

//     res.status(201).json({ message: "Task created successfully", savedTask });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

exports.createTask = async (req, res) => {
  try {
    const { employeeId, activity, clientName, timeSlot, _id } = req.body;
    console.log(employeeId, activity, clientName, timeSlot, _id);

    let newTask = await Task.findOne({ employeeId });

    if (!newTask) {
      newTask = new Task({
        employeeId,
        activity: [{ activity: activity, timeSlot, clientName: clientName }],
        hits: [{ clientName, noOfHits: 1 }],
      });
    } else {
      if (!newTask.activity) {
        newTask.activity = [];
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
      }

      if (!newTask.hits) {
        newTask.hits = [];
      }

      const existingHit = newTask.hits.find(
        (hit) => hit.clientName === clientName
      );
      if (existingHit) {
        existingHit.noOfHits += 1;
      } else {
        newTask.hits.unshift({ clientName, noOfHits: 1 });
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
      }

      if (!newTask.hits) {
        newTask.hits = [];
      }

      const existingHit = newTask.hits.find(
        (hit) => hit.clientName === clientName
      );
      if (existingHit) {
        existingHit.noOfHits += 1;
      } else {
        newTask.hits.unshift({ clientName, noOfHits: 1 });
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
      return res.status(404).json({ message: "No tasks found for the employee" });
    }

    let activities;
    if (date) {
      activities = tasks.activity.filter(activity => activity.date === date);
    } else {
      activities = tasks.activity.filter(activity => activity.date === getDateFormatted());
    }

    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found for the specified date" });
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
      return res.status(404).json({ message: "No tasks found for the employee" });
    }

    let activities;
    if (date) {
      activities = tasks.extraActivity.filter(activity => activity.date === date);
    } else {
      activities = tasks.extraActivity.filter(activity => activity.date === getDateFormatted());
    }

    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found for the specified date" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};