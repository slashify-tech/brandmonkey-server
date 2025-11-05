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
const Leave = require("../models/leave");

exports.uploadClientBulk = async (req, res) => {
  let ClientData = [];
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const response = await csv().fromFile(file.path);

    for (var i = 0; i < response.length; i++) {
      ClientData.push({
        name: (() => {
          const clientName = response[i]?.["Client Name"]?.trim();
          if (!clientName) return "";
          const parts = clientName.split(" ").filter(Boolean);
          return parts.length > 0 ? parts[0] + (parts[1] ? "" + parts[1] : "") : clientName;
        })(),
        Reels: response[i]?.Reels?.trim() || "NA",
        Flyers: response[i]?.Flyer || "NA",
        "Facebook Ads": response[i]?.FacebookAds?.trim() || "NA",
        "Google Ads": response[i]?.GoogleAds?.trim() || "NA",
        SEO: response[i]?.SEO?.trim() || "NA",
        GMB: response[i]?.GMB || "NA",
        UGC: response[i]?.UGC || "NA",
        "Logo Design": response[i]?.LogoDesign || "NA",
        "Youtube Management": response[i]?.YoutubeManagement || "NA",
        "Social Media Management": response[i]?.SocialMediaManagement || "NA",
        clientType: response[i]?.ClientType || "Regular",
        Videography: response[i]?.Videography || "NA",
        Website: response[i]?.Website || "NA",
        Management: response[i]?.Management || "NA",
        "Content Creator": response[i]?.ContentCreator || "NA",
        "Creative Design": response[i]?.CreativeDesign || "NA",
        GST: response[i]?.GST || "NA",
        Address: response[i]?.Address || "NA",
        State: response[i]?.State || "NA",
        Country: response[i]?.Country || "NA",
        logo: response[i]?.clientlogo + ".png",
        "HR_CMS": response[i]?.["HR/CMS"] || "NA",
        "Product Shoot": response[i]?.ProductShoot || "NA",
        Copywriting: response[i]?.Copywriting || "NA",
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

  for (let i = 0; i < data?.length; i++) {
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
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const response = await csv().fromFile(file.path);

    for (let i = 0; i < response.length; i++) {
      // const clientDetails = await Promise.all(
      //   response[i]?.["Client-Service"]?.split(",").map(async (client) => {
      //     const clientName = client.trim();
      //     const existingClient = await Clients.findOne({
      //       name: { $regex: new RegExp(clientName.split("-")[0].trim(), "i") },
      //     });

      //     // If client not found or clientName is empty, skip adding client detail
      //     if (!existingClient || !clientName) return null;

      //     return {
      //       clientName: clientName,
      //       logo: clientName.split("-")[0].trim() + ".png",
      //       progressValue: "0-10",
      //       clientType: existingClient.clientType,
      //     };
      //   })
      // );

      // // Filter out null client details
      // const filteredClientDetails = clientDetails.filter(
      //   (client) => client !== null
      // );

       console.log(response[i]);

        // Helper function to parse date string (handles both M/D/YYYY and DD/MM/YYYY)
        const parseDate = (dateString) => {
          if (!dateString) return new Date();
          const trimmed = dateString.trim();
          if (!trimmed || trimmed === "NA") return new Date();
          
          try {
            // Try to parse the date - handle formats like "1/1/2021" or "25/08/1999"
            const parts = trimmed.split("/");
            if (parts.length === 3) {
              // If month > 12, it's likely DD/MM/YYYY, otherwise M/D/YYYY
              const first = parseInt(parts[0], 10);
              const second = parseInt(parts[1], 10);
              const year = parseInt(parts[2], 10);
              
              let date;
              if (first > 12) {
                // DD/MM/YYYY format
                date = new Date(year, second - 1, first); // month is 0-indexed
              } else {
                // M/D/YYYY format
                date = new Date(year, first - 1, second); // month is 0-indexed
              }
              
              // Validate the date
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
            
            // Fallback: try to parse directly
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) {
              return parsed;
            }
          } catch (error) {
            console.error(`Error parsing date: ${trimmed}`, error);
          }
          
          // Return current date as fallback
          return new Date();
        };

        const joiningDate = parseDate(response[i]?.Joining || response[i]?.['DateOfJoining']);
        const birthDate = parseDate(response[i]?.Birth || response[i]?.['DateOfBirth']);
        console.log(joiningDate, birthDate);

        const employee = {
          employeeId: response[i]?.employeeId?.trim() || "NA",
          name: response[i]?.name?.trim(),
          team: response[i]?.team?.trim().toLowerCase(),
          type: response[i]?.type?.trim().toLowerCase(),
          designation: response[i]?.designation?.trim().toLowerCase(),
          phoneNumber: parseInt(response[i]?.phoneNumber?.trim()?.split(" ")[1]?.trim()) || parseInt(response[i]?.phoneNumber?.trim()),
          email: response[i]?.email?.trim().toLowerCase(),
          password: simpleEncrypt(response[i]?.Password?.trim() || response[i]?.password?.trim() || "password", 5),
          services: response[i]?.services?.trim().toLowerCase(),
          clients: [],
          Gender: response[i]?.Gender?.trim() || "NA",
          DateOfJoining: response[i]?.Joining?.trim()?.replaceAll("/", "-") || "NA",
          DateOfBirth: response[i]?.Birth?.trim()?.replaceAll("/", "-") || "NA",
          image: "",
          monthlySalary: parseInt(response[i]?.Salary?.trim()) || 0,
          createdAt: joiningDate && !isNaN(joiningDate.getTime()) ? joiningDate.toISOString() : new Date().toISOString(),
          updatedAt: joiningDate && !isNaN(joiningDate.getTime()) ? joiningDate.toISOString() : new Date().toISOString(),
          isDeleted: false,
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
exports.getSlotWiseMissingTimeSlots = async (req, res) => {
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


// HR-specific function to get missing time slots for the past 7 days
exports.getMissingTimeSlots = async (req, res) => {
  try {
    if(req.user.type !== "superadmin" && req.user.type !== "hr"){
      return res.status(403).json({ error: "Unauthorized access. Only HR and Superadmin can access this route." });
    }
    const { minimize = false } = req.query;
    // Calculate the date range for the past 7 days
    const today = new Date();
    
    // Generate the past 7 days array (latest date first) - we need this first for the query
    // Exclude Sundays (getDay() === 0) from the calculation
    const pastSevenDays = [];
    let daysToGoBack = 0;
    while (pastSevenDays.length < 7) {
      const date = new Date();
      date.setDate(date.getDate() - daysToGoBack);
      // Skip Sundays (getDay() === 0)
      if (date.getDay() !== 0) {
        pastSevenDays.push(formatDateFromISO(date.toISOString()));
      }
      daysToGoBack++;
    }

    // Get all activities from the past 7 days using $in operator with exact date strings
    const activities = await Task.find({
      date: { $in: pastSevenDays },
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

    // Get all employees once to avoid multiple database calls
    const allEmployees = await Employees.find({ 
      type: { $nin: ["admin", "superadmin", "hr"] },
      isDeleted: {$ne: true }
    }).select('name employeeId designation team');

    // Get all leaves for the past 7 days
    const leaves = await Leave.find({
      leaveDate: { $in: pastSevenDays },
      isDeleted: false
    }).select('employeeId leaveDate');
    console.log(leaves, "leaves");

    // Create a map for quick lookup: employeeId_date -> true
    const leaveMap = new Map();
    leaves.forEach(leave => {
      const key = `${leave.employeeId.toString()}_${leave.leaveDate}`;
      leaveMap.set(key, true);
    });
    console.log(leaveMap, "leaveMap");

    // Helper function to check if employee is on leave for a date
    const isEmployeeOnLeave = (employeeId, date) => {
      const key = `${employeeId}_${date}`;
      return leaveMap.has(key);
    };

    // If minimize is true, return just the count of missing slots
    if (minimize === 'true' || minimize === true) {
      let totalMissingSlots = 0;
      
      for (const date of pastSevenDays) {
        const employeesOnDate = activitiesByDateAndEmployee[date] || {};
        
        allEmployees.forEach(employee => {
          const employeeId = employee._id.toString();
          
          // Skip employees who are on leave for this date
          if (isEmployeeOnLeave(employeeId, date)) {
            console.log("Employee is on leave for this date");
            return;
          }
          const employeeActivities = employeesOnDate[employeeId];
          
          if (employeeActivities) {
            // Employee has some activities, count missing slots
            const usedSlots = employeeActivities.timeSlots;
            const missingSlots = timeSlots.filter(slot => !usedSlots.includes(slot));
            totalMissingSlots += missingSlots.length;
          } else {
            // Employee has no activities on this date, all slots are missing
            totalMissingSlots += timeSlots.length;
          }
        });
      }

      return res.status(200).json({
        success: true,
        totalMissingSlots: totalMissingSlots,
        totalPossibleSlots: pastSevenDays.length * timeSlots.length * allEmployees.length,
        reportGeneratedAt: new Date().toISOString()
      });
    }

    // Analyze missing time slots for each day and employee
    const missingSlotsReport = [];

    for (const date of pastSevenDays) {
      const dayReport = {
        date: date,
        employees: []
      };

      // Get all employees who have activities on this date
      const employeesOnDate = activitiesByDateAndEmployee[date] || {};
      
      // Check each employee for missing slots
      allEmployees.forEach(employee => {
        const employeeId = employee._id.toString();
        
        // Skip employees who are on leave for this date
        if (isEmployeeOnLeave(employeeId, date)) {
          return;
        }
        
        const employeeActivities = employeesOnDate[employeeId];
        
        if (employeeActivities) {
          // Employee has some activities, find missing slots
          const usedSlots = employeeActivities.timeSlots;
          const missingSlots = timeSlots.filter(slot => !usedSlots.includes(slot));
          
          dayReport.employees.push({
            employee: employee,
            missingSlots: missingSlots,
            totalMissing: missingSlots.length,
            hasActivities: true,
            usedSlots: usedSlots
          });
        } else {
          // Employee has no activities on this date
          dayReport.employees.push({
            employee: employee,
            missingSlots: [...timeSlots],
            totalMissing: timeSlots.length,
            hasActivities: false
          });
        }
      });

      // Sort employees by totalMissing in descending order (highest first)
      dayReport.employees.sort((a, b) => b.totalMissing - a.totalMissing);

      missingSlotsReport.push(dayReport);
    }

    // Calculate summary statistics
    const summary = {
      totalDays: pastSevenDays.length,
      totalTimeSlotsPerDay: timeSlots.length,
      totalPossibleSlots: pastSevenDays.length * timeSlots.length * allEmployees.length,
      reportGeneratedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      summary: summary,
      missingSlotsReport: missingSlotsReport,
      // timeSlots: timeSlots
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

// API to set/add leaves for employees
exports.setLeave = async (req, res) => {
  try {
    if(req.user.type !== "superadmin" && req.user.type !== "hr" && req.user.type !== "admin"){
      return res.status(403).json({ error: "Unauthorized access. Only HR, Admin and Superadmin can access this route." });
    }

    const { employeeId, leaveDate, leaveDates } = req.body;

    // Support both single leaveDate and array of leaveDates
    let datesToProcess = [];
    
    if (leaveDates && Array.isArray(leaveDates)) {
      // Bulk leave dates
      datesToProcess = leaveDates;
    } else if (leaveDate) {
      // Single leave date
      datesToProcess = [leaveDate];
    } else {
      return res.status(400).json({ 
        error: "Invalid request. Please provide either 'leaveDate' or 'leaveDates' array." 
      });
    }

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required." });
    }

    // Validate employee exists
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    // Process each date
    const createdLeaves = [];
    const duplicateLeaves = [];
    const errors = [];

    for (const date of datesToProcess) {
      try {
        // Format the date from ISO string to "20 Oct 2025" format
        const formattedDate = formatDateFromISO(date);

        // Check if leave already exists for this employee and date
        const existingLeave = await Leave.findOne({
          employeeId: employeeId,
          leaveDate: formattedDate,
          isDeleted: false
        });

        if (existingLeave) {
          duplicateLeaves.push({
            date: formattedDate,
            message: "Leave already exists for this date"
          });
          continue;
        }

        // Create new leave entry
        const leave = await Leave.create({
          employeeId: employeeId,
          leaveDate: formattedDate,
          isDeleted: false
        });

        createdLeaves.push({
          id: leave._id,
          employeeId: leave.employeeId,
          leaveDate: leave.leaveDate
        });
      } catch (error) {
        errors.push({
          date: date,
          error: error.message
        });
      }
    }

    // Return response
    const response = {
      success: true,
      message: "Leave(s) processed successfully",
      created: createdLeaves,
    };

    if (duplicateLeaves.length > 0) {
      response.duplicates = duplicateLeaves;
    }

    if (errors.length > 0) {
      response.errors = errors;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in setLeave:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      message: "Failed to set leave(s)"
    });
  }
};
