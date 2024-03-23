const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "images");
//     },
//     filename: (req, file, cb) => {
//         cb(null, uuidv4());
//     },
// });

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const Storage = multer.memoryStorage();
// const imageMulter = multer({ storage: fileStorage, fileFilter: fileFilter }).single("image");
const imageMulter = multer({ storage: Storage, fileFilter: fileFilter }).single("ImageFile");

module.exports = { imageMulter };

// all messages (
//   const adminMsg = {
//     // to: adminEmails,
//     to: "minhazashraf590@gmail.com",
//     from: "info@brandmonkey.in",
//     subject: "New Ticket Assigned",
//     text: `New Ticket Assigned:
//         For Clients: ${clientName}
//         To Employee: ${employeeName}
//         Services: ${services}
//         Description: ${description}`,
//   };
//   await sgMail.send(adminMsg);

//   const employeeMsg = {
//     // to: assignedEmployeeEmail,
//     to: "pmrutunjay928@gmail.com",
//     from: "info@brandmonkey.in",
//     subject: "You have been assigned a new ticket",
//     text: `You have been assigned a new ticket:
//       For Clients: ${clientName}
//       Services: ${services}
//       Description: ${description}`,
//   };

//   await sgMail.send(employeeMsg);
// )