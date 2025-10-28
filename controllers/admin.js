const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const EmployeeReview = require("../models/reviewList");
const csv = require("csvtojson");
const json2csv = require("json2csv").parse;
const MomData = require("../models/mom");
const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");
const TicketCount = require("../models/ticketCount");
const { Task } = require("../models/activities");
const { formatDateFromISO } = require("../utils/formattedDate");
const { timeSlots } = require("../utils/set_times");

exports.uploadClientBulk = async (req, res) => {
  let ClientData = [];
  try {
    const response = await csv().fromFile(req.file.path);

    for (var i = 0; i < response.length; i++) {
      ClientData.push({
        name: response[i]?.Clients.trim(),
        Reels: response[i]?.Reels,
        Flyers: response[i]?.Flyer,
        "Facebook Ads": response[i]?.FacebookAds,
        "Google Ads": response[i]?.GoogleAds,
        SEO: response[i]?.SEO,
        GMB: response[i]?.GMB,
        "Youtube Management": response[i]?.YoutubeManagement,
        Ecommerce: response[i]?.Ecommerce,
        "Social Media Management": response[i]?.SocialMediaManagement,
        clientType: response[i]?.ClientType || "Regular",
        Videography: response[i]?.Videography,
        Photography: response[i]?.Photography,
        Website: response[i]?.Website,
        Management: response[i]?.Management,
        "Content Creator": response[i]?.ContentCreator,
        GST: response[i]?.GST || "NA",
        Address: response[i]?.Address || "NA",
        State: response[i]?.State || "NA",
        Country: response[i]?.Country || "NA",
        logo: response[i]?.clientlogo + ".png",
      });
    }
    await Clients.insertMany(ClientData);
    res.status(201).json({ message: "uploaded", ClientData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

function simpleEncrypt(data, key) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const encrypted = [];

  for (let i = 0; i < data.length; i++) {
    const char = data[i].toLowerCase();
    const isUpperCase = data[i] === data[i].toUpperCase();

    if (alphabet.includes(char)) {
      const newIndex = (alphabet.indexOf(char) + key) % 26;
      const encryptedChar = isUpperCase
        ? alphabet[newIndex].toUpperCase()
        : alphabet[newIndex];

      encrypted.push(encryptedChar);
    } else {
      encrypted.push(data[i]);
    }
  }
  return encrypted.join("");
}

function simpleDecrypt(encryptedData, key) {
  return simpleEncrypt(encryptedData, 26 - key);
}

exports.uploadEmployeeBulk = async (req, res) => {
  let employeesToInsert = [];
  try {
    const response = await csv().fromFile(req.file.path);

    for (let i = 0; i < response.length; i++) {
      const clientDetails = await Promise.all(
        response[i]?.["Client-Service"].split(",").map(async (client) => {
          const clientName = client.trim();
          const existingClient = await Clients.findOne({
            name: { $regex: new RegExp(clientName.split("-")[0].trim(), "i") },
          });

          // If client not found or clientName is empty, skip adding client detail
          if (!existingClient || !clientName) return null;

          return {
            clientName: clientName,
            logo: clientName.split("-")[0].trim() + ".png",
            progressValue: "0-10",
            clientType: existingClient.clientType,
          };
        })
      );

      // Filter out null client details
      const filteredClientDetails = clientDetails.filter(
        (client) => client !== null
      );

        const employee = {
          employeeId: response[i]?.EmployeeID || "NA",
          name: response[i]?.EmployeeName,
          team: response[i]?.Team,
          type: response[i]?.Type,
          designation: response[i]?.Designation,
          phoneNumber: parseInt(response[i]?.PhoneNumber),
          email: response[i]?.EmailID,
          password: simpleEncrypt(response[i]?.Password, 5),
          services: response[i]?.Services,
          clients: filteredClientDetails || [],
          Gender: response[i]?.Gender || "NA",
          DateOfJoining: response[i]?.Joining || "NA",
          DateOfBirth: response[i]?.Birth || "NA",
          image: response[i]?.Images + ".jpg",
        };
        employeesToInsert.push(employee);
      
    }

    await Employees.insertMany(employeesToInsert);
    res.status(201).json({ message: "uploaded", employees: employeesToInsert });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { forClients, toEmployee, services, description } = req.body;

    // Find the assigned employee and update totalTicketsIssued
    const assignedEmployee = await Employees.findByIdAndUpdate(
      toEmployee,
      { $inc: { totalTicketsIssued: 1 } },
      { new: true, select: "email" }
    );

    if (!assignedEmployee) {
      return res.status(404).json({ error: "Assigned employee not found" });
    }
    // Find or create the ticket count document and increment TotalTickets
    await TicketCount.findOneAndUpdate(
      {},
      { $inc: { TotalTickets: 1 } },
      { upsert: true, new: true }
    );

    const assignedEmployeeEmail = assignedEmployee.email;

    const newTicket = new TicketAssigned({
      ticketraised: true,
      forClients,
      toEmployee,
      services,
      description,
      issueDate: new Date().toISOString(),
    });

    await newTicket.save();

    // Populate the forClients and toEmployee fields to get the actual names
    const populatedTicket = await TicketAssigned.populate(newTicket, [
      { path: "forClients", select: "name" },
      { path: "toEmployee", select: "name" },
    ]);

    const { name: clientName } = populatedTicket.forClients;
    const { name: employeeName } = populatedTicket.toEmployee;

    const admins = await Employees.find({
      type: { $in: ["admin", "superadmin"] },
    }).select("email");

    const adminEmails = admins.map((admin) => admin.email);

    const adminMsg = {
      to: adminEmails,
      from: "info@brandmonkey.in",
      subject: "New Ticket Assigned",
      text: `New Ticket Assigned:
          For Clients: ${clientName}
          To Employee: ${employeeName}
          Services: ${services}
          Description: ${description}`,
    };
    await sgMail.send(adminMsg);

    const employeeMsg = {
      to: assignedEmployeeEmail,
      from: "info@brandmonkey.in",
      subject: "You have been assigned a new ticket",
      text: `You have been assigned a new ticket:
        For Clients: ${clientName}
        Services: ${services}
        Description: ${description}`,
    };

    await sgMail.send(employeeMsg);

 
    res.status(201).json({ message: "Ticket submitted successfully" });
  } catch (error) {
    console.error(error);
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.resolveTickets = async (req, res) => {
  try {
    const id = await TicketAssigned.findById({ id });
    if (!id) {
      res.status(404).json("no such ticket is issued");
    }
    await TicketAssigned.findByIdAndDelete(id);
    res.status(200).json("ticket resolved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteMOM = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the MOM record by ID
    const momRecord = await MomData.findById(id);

    if (!momRecord) {
      return res.status(404).json({ message: "MOM record not found" });
    }
    // Delete the MOM record
    await MomData.findByIdAndDelete(id);

    return res.status(200).json({ message: "MOM record deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addEmployeeReview = async (req, res) => {
  try {
    const { employeeData, client, review, goodOrBad } = req.body;

    const existingEmployeeReview = await EmployeeReview.findOne({
      employeeData,
    });

    if (existingEmployeeReview) {
      existingEmployeeReview.reviews.push({
        client: client,
        review: review,
        goodOrBad: goodOrBad,
      });
      console.log(existingEmployeeReview);
      await existingEmployeeReview.save();

      res.status(200).json({
        message: "Review added to existing employee data",
        data: existingEmployeeReview,
      });
    } else {
      const newEmployeeReview = new EmployeeReview({
        employeeData,
        reviews: [{ client: client, review: review, goodOrBad: goodOrBad }],
      });
      await newEmployeeReview.save();

      res.status(201).json({
        message: "New employee data created with review",
        data: newEmployeeReview,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEmployeeReviews = async (req, res) => {
  try {
    const {id} = req.params;
    const reviews = await EmployeeReview.findOne({employeeData : id});

    res.status(200).json({
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMomEntry = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { topicDiscuss, complain, feedback, attendees, color } = req.body;

    const momEntry = new MomData({
      clientId,
      topicDiscuss,
      complain,
      attendees,
      feedback,
    });

    if (color) {
      await Clients.findByIdAndUpdate(clientId, { colorZone: color });
    }

    const savedMomEntry = await momEntry.save();

    res.status(201).json(savedMomEntry);
  } catch (error) {
    console.error("Error creating MOM entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMomEntriesByClientId = async (req, res) => {
  try {
    const clientId = req.params.id;

    const momEntries = await MomData.find({ clientId });

    res.status(200).json(momEntries);
  } catch (error) {
    console.error("Error getting MOM entries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDashBoardAdmin = async (req, res) => {
  try {
    const totalClients = await Clients.countDocuments({});
    const totalEmployees = await Employees.countDocuments({
      type: { $ne: "superadmin" },
    });

    const tickets = await TicketCount.findOne({});
    // Check if tickets object is null before destructuring
    const TotalTickets = tickets ? tickets.TotalTickets : 0;
    const TotalTicketSolved = tickets ? tickets.TotalTicketSolved : 0;
    const reviewCounts = await EmployeeReview.aggregate([
      {
        $unwind: "$reviews", // Deconstruct reviews array
      },
      {
        $group: {
          _id: "$reviews.goodOrBad", // Group by goodOrBad field
          count: { $sum: 1 }, // Count the documents in each group
        },
      },
    ]);

    const totalGoodReviewsCount =
      reviewCounts.find((entry) => entry._id === "good")?.count || 0;
    const totalBadReviewsCount =
      reviewCounts.find((entry) => entry._id === "bad")?.count || 0;

    const totalReviews = reviewCounts.length || 0;

    res.status(201).json({
      totalClients,
      totalEmployees,
      TotalTickets,
      TotalTicketSolved,
      totalReviews,
      totalGoodReviewsCount,
      totalBadReviewsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getResolvedEmployeeTickets = async (req, res) => {
  try {
    const { id } = req.query;
    let tickets;
    if (id) {
      tickets = await TicketAssigned.find({
        ticketraised: false,
        toEmployee: id,
      })
        .populate("toEmployee", "name")
        .populate("forClients", "name");
    } else {
      tickets = await TicketAssigned.find({ ticketraised: false })
        .populate("toEmployee", "name")
        .populate("forClients", "name");
    }
    res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.acknowlegdeTicketResolve = async (req, res) => {
  try {
    const { id, value, revertIssue } = req.query;

    if (!id || !value) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const ticket = await TicketAssigned.findById(id).populate(
      "toEmployee",
      "name email"
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const employeeName = ticket.toEmployee.name;
    const employeeEmail = ticket.toEmployee.email;

    if (value === "accept") {
      // Update totalTicketsResolved in Employees schema
      const assignedEmployee = await Employees.findById(ticket.toEmployee);
      if (assignedEmployee) {
        assignedEmployee.totalTicketsResolved += 1;
        await assignedEmployee.save();
      }

      // Update TotalTicketSolved in ticketCount schema
      let ticketCount = await TicketCount.findOne();
      if (!ticketCount) {
        ticketCount = new TicketCount();
      }
      ticketCount.TotalTicketSolved += 1;
      await ticketCount.save();

      await TicketAssigned.findByIdAndDelete(id);

      // Send email to employee for accepted ticket
      const acceptMsg = {
        to: employeeEmail,
        from: "info@brandmonkey.in",
        subject: "Ticket Accepted",
        text: `Dear ${employeeName},\n\nYour resolved ticket has been accepted and deleted successfully.\n\nRegards,\nThe Support Team`,
      };

      await sgMail.send(acceptMsg);

      res
        .status(200)
        .json({ message: "Ticket accepted and deleted successfully." });
    } else if (value === "reject") {
      ticket.revertBack = true;
      ticket.ticketraised = true;
      ticket.revertIssue = revertIssue || "just do it again";
      await ticket.save();

      // Send email to employee for rejected ticket
      const rejectMsg = {
        to: employeeEmail,
        from: "info@brandmonkey.in",
        subject: "Ticket Rejected",
        text: `Dear ${employeeName},\n\nYour resolved ticket has been rejected there are futher issues that have to be solved.\n\nRegards,\nThe Support Team`,
      };

      await sgMail.send(rejectMsg);

      res
        .status(200)
        .json({ message: "Ticket rejected and updated successfully." });
    } else {
      res.status(400).json({ error: "Invalid value." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEmployeeReviewsArray = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.query;

    // Query to find the employee review by employee ID and review ID
    const employeeReview = await EmployeeReview.findOne({
      'employeeData': id, // Find by employee ID
      'reviews._id': reviewId // Find by review ID
    });

    // If review is found, send it in the response
    if (employeeReview) {
      const review = employeeReview.reviews.find(review => review._id == reviewId);
      if (review) {
        res.status(200).json({ review });
      } else {
        res.status(404).json({ error: "Review not found" });
      }
    } else {
      res.status(404).json({ error: "Employee review not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTicketsForClient = async (req, res) => {
  try {
    const { clientId, employeeId } = req.query;

    if (!clientId && !employeeId) {
      return res.status(400).json({ error: "Missing required parameter: id." });
    }

    let tickets ;
    if(clientId){
      tickets = await TicketAssigned.find({ forClients: clientId }).populate(
        "toEmployee",
        "name"
      );
    }else{
      tickets = await TicketAssigned.find({ toEmployee: employeeId }).populate(
        "forClients",
        "name"
      );
    }

    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteReviewData = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.query;

    if (!id || !reviewId) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: id or reviewId." });
    }

    const employeeReview = await EmployeeReview.findById(id);

    // Check if the employee review exists
    if (!employeeReview) {
      return res.status(404).json({ error: "Employee review not found." });
    }

    // Find the review with the specified reviewId
    const review = employeeReview.reviews.find(
      (r) => r._id.toString() === reviewId
    );

    // Check if the review with the specified reviewId exists
    if (!review) {
      return res
        .status(404)
        .json({ error: "Review with specified reviewId not found." });
    }

    // Remove the review from the array
    employeeReview.reviews.pull({ _id: review._id });

    // Save the updated document
    await employeeReview.save();

    // Check if the reviews array is empty after deletion
    if (employeeReview.reviews.length === 0) {
      // If empty, delete the entire employeeReview document
      await EmployeeReview.findByIdAndDelete(id);
      return res.status(200).json({
        message: "Employee review and associated review deleted successfully.",
      });
    }

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// HR-specific function to get missing time slots for the past 7 days
exports.getMissingTimeSlots = async (req, res) => {
  try {
    if(req.user.type !== "superadmin" && req.user.type !== "hr"){
      return res.status(403).json({ error: "Unauthorized access. Only HR and Superadmin can access this route." });
    }
    // Calculate the date range for the past 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Get all activities from the past 7 days
    const activities = await Task.find({
      date: {
        $gte: formatDateFromISO(sevenDaysAgo.toISOString()),
        $lte: formatDateFromISO(today.toISOString())
      },
      isDeleted: false,
      type: "activity" // Only regular activities, not extra activities
    }).populate('employeeId', 'name employeeId designation team');

    // Group activities by date and employee
    const activitiesByDateAndEmployee = {};
    
    activities.forEach(activity => {
      const date = activity.date;
      const employeeId = activity.employeeId._id.toString();
      
      if (!activitiesByDateAndEmployee[date]) {
        activitiesByDateAndEmployee[date] = {};
      }
      
      if (!activitiesByDateAndEmployee[date][employeeId]) {
        activitiesByDateAndEmployee[date][employeeId] = {
          employee: activity.employeeId,
          timeSlots: []
        };
      }
      
      activitiesByDateAndEmployee[date][employeeId].timeSlots.push(activity.timeSlot);
    });

    // Generate the past 7 days array
    const pastSevenDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      pastSevenDays.push(formatDateFromISO(date.toISOString()));
    }

    // Get all employees once to avoid multiple database calls
    const allEmployees = await Employees.find({ 
      type: { $ne: "superadmin" },
      isDeleted: false 
    }).select('name employeeId designation team');

    // Build slot-centric report: for each timeslot, list employees who missed and on which days
    const slotWise = timeSlots.map(slot => ({
      slot,
      totalEmployeesMissed: 0,
      employees: [] // { name, employeeId, designation, team, daysMissed: [] }
    }));

    // Index timeslot -> structure for faster push
    const slotIndexByName = new Map();
    slotWise.forEach((s, idx) => slotIndexByName.set(s.slot, idx));

    for (const date of pastSevenDays) {
      const employeesOnDate = activitiesByDateAndEmployee[date] || {};

      allEmployees.forEach(employee => {
        const empId = employee._id.toString();
        const usedSlots = employeesOnDate[empId]?.timeSlots || [];

        // For each slot, if not used, mark missed for this employee on this date
        timeSlots.forEach(slot => {
          if (!usedSlots.includes(slot)) {
            const idx = slotIndexByName.get(slot);
            const entry = slotWise[idx];

            // find or create employee entry under this slot
            let empEntry = entry.employees.find(e => e._id === empId);
            if (!empEntry) {
              empEntry = {
                _id: empId,
                name: employee.name,
                employeeCode: employee.employeeId,
                designation: employee.designation,
                team: employee.team,
                daysMissed: []
              };
              entry.employees.push(empEntry);
            }
            empEntry.daysMissed.push(date);
          }
        });
      });
    }

    // finalize totalEmployeesMissed per slot (unique employees)
    slotWise.forEach(s => {
      s.totalEmployeesMissed = s.employees.length;
    });

    res.status(200).json({
      success: true,
      range: {
        from: pastSevenDays[0],
        to: pastSevenDays[pastSevenDays.length - 1]
      },
      slots: slotWise
    });

  } catch (error) {
    console.error("Error in getMissingTimeSlots:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch missing time slots data"
    });
  }
};

