const Employees = require("../models/employee");
const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmailToAdmin = async () => {
  // Function to send email
  try {
    const admins = await Employees.find({
      type: { $in: ["admin", "superadmin"] },
    }).select("email");

    const adminEmails = admins.map((admin) => admin.email);
    const adminMsg = {
      to: adminEmails,
      from: "info@brandmonkey.in",
      subject: "Urgent Message: Task Deletion Reminder",
      text: `Urgent Message\n\nKindly download the employee sheet details and the hit details in hours as it's soon going to be cleaned.`, // Email body,
    };
    await sgMail.send(adminMsg);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.sendEmailToAdmin15Days = async () => {
  // Function to send email
  try {
    const admins = await Employees.find({
      type: { $in: ["admin", "superadmin"] },
    }).select("email");

    const adminEmails = admins.map((admin) => admin.email);
    const adminMsg = {
      to: adminEmails,
      from: "info@brandmonkey.in",
      subject: "Urgent Message: Task Deletion Reminder",
      text: `Urgent Message\n\nKindly download the employee sheet details and the hit details of the last 15 Days`, // Email body,
    };
    await sgMail.send(adminMsg);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
