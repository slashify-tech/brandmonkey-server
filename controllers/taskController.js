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
          clientname: clientName,
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

exports.getActivityByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId } = req.query;
    console.log(employeeId);

    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    console.log(startDate, endDate);

    let activities = await Task.find({
      employeeId,
      "activity.createdAt": { $gte: startDate, $lt: endDate },
    }).select("activity");

    activities = activities[0].activity.filter((item) => {
      if (item.createdAt < endDate) {
        return item;
      }
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
