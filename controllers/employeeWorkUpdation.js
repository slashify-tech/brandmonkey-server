const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const dotenv = require("dotenv");

dotenv.config();

const resolveTicketRequest = async (id) => {
  try {
    const ticket = await TicketAssigned.findById(id).populate('forClients toEmployee');

    if (!ticket) {
      return;
    }

    if (ticket.progressValue === "done") {
      ticket.ticketraised = false;

      await ticket.save();

      // Send emails
      const clientName = ticket.forClients.name; // Assuming 'name' is a field in Clients model
      const employeeName = ticket.toEmployee.name; // Assuming 'name' is a field in Employees model

      const admins = await Employees.find({
        type: { $in: ["admin", "superadmin"] },
      }).select("email");
  
      const adminEmails = admins.map((admin) => admin.email);
      // Email to client
      const clientMsg = {
        to: adminEmails,// Assuming 'email' is a field in Clients model
        from: "info@brandmonkey.in",
        subject: "Ticket Resolved",
        text: `Dear admin,\n\nThe ticket has been resolved successfully for ${clientName}.\n\nRegards,\n ${employeeName}`,
      };

      await sgMail.send(clientMsg);

    } else {
      console.log({
        error: "Issue is not solved hence TicketAssigned cannot be resolved.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error")
  }
};


exports.updateProgress = async (req, res) => {
  const { id } = req.params;
  const { progress } = req.query;

  try {
    const ticket = await TicketAssigned.findById(id).populate('forClients toEmployee');

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    switch (progress) {
      case "accept":
        ticket.progressValue = "start";
        break;
      case "start":
        ticket.progressValue = "processing";
        break;
      case "processing":
        ticket.progressValue = "done";
        break;
      case "done":
        resolveTicketRequest(id);
        break;
      default:
        return res
          .status(400)
          .json({ error: "Invalid progressValue or the issue is solved" });
    }

    await ticket.save();

    return res
      .status(200)
      .json({ message: "Progress updated successfully", ticket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.updateWork = async (req, res) => {
  const { id } = req.params;
  const { workId } = req.query;
  const { progressValue } = req.body;

  try {
    const updatedEmployee = await Employees.findOneAndUpdate(
      {
        _id : id,
        "clients._id": workId,
      },
      {
        $set: {
          "clients.$.progressValue": progressValue,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee or client not found" });
    }

    const totalProgress = updatedEmployee.clients.reduce((sum, client) => {
      const [start, end] = client.progressValue.split("-").map(Number);
      return sum + end;
    }, 0);

    updatedEmployee.progressPercentage = (
      totalProgress / updatedEmployee.clients.length
    ).toFixed(2);

    await updatedEmployee.save();

    res.status(200).json({ message: "Client progress updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
