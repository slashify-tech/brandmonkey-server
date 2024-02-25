const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

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

exports.addClient = async (req, res, next) => {
  try {
    console.log(req.body);
    const client = await Clients.create({ ...req.body });
    await client.save();
    res.status(201).json("adding succesful");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addEmployee = async (req, res, next) => {
  try {
    let hashedPass;
    if (req.body.password) {
      hashedPass = await bcrypt.hash(req.body.password, 12);
    }
    const employee = await Employees.create({
      ...req.body,
      password: hashedPass,
      phoneNumber: req.body.phoneNumber,
      type: "employee",
    });
    await employee.save();
    res.status(201).json("adding succesful");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeClient = async (req, res, next) => {
  try {
    const client = await Clients.findById(req.params.id);
    if (client) {
      await Clients.findByIdAndDelete(req.params.id);
      res.status(201).send("deleted");
    }
    res.status(404).json("");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.removeEmployee = async (req, res, next) => {
  try {
    const employee = await Employees.findById(req.params.id);

    // if (employee.image) {
    //   await deleteFromS3(employee.image);
    // }
    // console.log(employee);
    await Employees.findByIdAndDelete(req.params.id);
    res.status(201).send("deleted");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.editClient = async (req, res, next) => {
  try {
    const client = await Clients.findById(req.params.id);

    if (!client) {
      return res.status(404).json("client not found");
    }
    let upadatedClient;
    upadatedClient = { ...req.body };

    await Clients.findByIdAndUpdate(
      req.params.id,
      { $set: upadatedClient },
      { new: true }
    );

    res.status(201).json("Update successful");
  } catch (e) {
    res.status(500).json(e.message);
  }
};



exports.getDashBoardEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await Employees.find({ _id : id });
    const tickets = await TicketAssigned.find({ toEmployee: id });

    const totalClients = clients[0].clients.length;
    const totalTickets = tickets.length;
    const totalWorkProgress = parseInt(clients[0].progressPercentage);
    res.status(201).json({totalClients, totalTickets, totalWorkProgress});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.editEmployee = async (req, res, next) => {
  try {
    const employee = await Employees.findById(req.params.id);

    if (!employee) {
      return res.status(404).json("employee not found");
    }
    
    let upadatedEmployee = { ...req.body, password : simpleEncrypt(req.body.password, 5) };

    await Employees.findByIdAndUpdate(
      req.params.id,
      { $set: upadatedEmployee },
      { new: true }
    );

    res.status(201).json("Update successful");
  } catch (e) {
    res.status(500).json(e.message);
  }
};

exports.dissolveTicket = async (req, res, next) => {
  try {
    const ticket = await TicketAssigned.findById(req.query.id);
    if (ticket) {
      await TicketAssigned.findByIdAndDelete(req.query.id);
      res.status(201).send("deleted");
    }
    res.status(404).json("");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.getClient = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    let query = {};
    let result;
    let totalClientsCount;
    let endIndex;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        ...query,
        $or: [{ clientType: searchRegex }, { name: searchRegex }],
      };
    }
    
    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalClientsCount = await Clients.countDocuments(query);
      
      const clientsData = await Clients.find(query).limit(pageSize).skip(startIndex);
      
      const clientsWithTicketsCount = await Promise.all(clientsData.map(async (client) => {
        const ticketsCount = await TicketAssigned.countDocuments({ forClients: client._id });
        return {
          ...client.toObject(),
          ticketsCount,
        };
      }));
      
      result = {
        nextPage: pageNumber + 1,
        data: clientsWithTicketsCount,
      };
    } else {
      const clientsData = await Clients.find(query);
      
      const clientsWithTicketsCount = await Promise.all(clientsData.map(async (client) => {
        const ticketsCount = await TicketAssigned.countDocuments({ forClients: client._id });
        return {
          ...client.toObject(),
          ticketsCount,
        };
      }));
      
      result = {
        data: clientsWithTicketsCount,
      };
    }

    res.status(200).json({
      result,
      currentPage: parseInt(page),
      hasLastPage: endIndex < totalClientsCount,
      hasPreviousPage: parseInt(page) > 1,
      nextPage: parseInt(page) + 1,
      previousPage: parseInt(page) - 1,
      lastPage: Math.ceil(totalClientsCount / parseInt(limit)),
      totalClientsCount,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.getOneClient = async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await Clients.findById(id);
    if (clients) {
      res.status(200).json(clients);
    } else {
      res.status(404).jsons("no clients found");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};


exports.getEmployee = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    let query = {};
    let result;
    let totalEmployeesCount;
    let endIndex;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        ...query,
        $or: [
          { employeeId: searchRegex },
          { name: searchRegex },
          { designation: searchRegex },
        ],
      };
    }
    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalEmployeesCount = await Employees.countDocuments(query);
      if (endIndex < totalEmployeesCount) {
        result = {
          nextPage: pageNumber + 1,
          data: await Employees.find(query).limit(pageSize).skip(startIndex),
        };
      } else {
        result = {
          data: await Employees.find(query).limit(pageSize).skip(startIndex),
        };
      }
    } else {
      result = {
        data: await Employees.find(query),
      };
    }
    res.status(200).json({
      result,
      currentPage: parseInt(page),
      hasLastPage: endIndex < totalEmployeesCount,
      hasPreviousPage: parseInt(page) > 1,
      nextPage: parseInt(page) + 1,
      previousPage: parseInt(page) - 1,
      lastPage: Math.ceil(totalEmployeesCount / parseInt(limit)),
      totalEmployeesCount,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.getOneEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employees.findById(id);

    if (employee) {
      employee.password = simpleDecrypt(employee.password, 5);

      res.status(200).json({ employee });
    } else {
      res.status(404).json({ error: "No such employee found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTicket = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    let query = {};
    let result;
    let totalTicketCount;
    let endIndex;

    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalTicketCount = await TicketAssigned.countDocuments(query);
      if (endIndex < totalTicketCount) {
        result = {
          nextPage: pageNumber + 1,
          data: await TicketAssigned.find(query)
            .limit(pageSize)
            .skip(startIndex),
        };
      } else {
        result = {
          data: await TicketAssigned.find(query)
            .limit(pageSize)
            .skip(startIndex),
        };
      }
    } else {
      result = {
        data: await TicketAssigned.find(query),
      };
    }
    res.status(200).json({
      result,
      currentPage: parseInt(page),
      hasLastPage: endIndex < totalTicketCount,
      hasPreviousPage: parseInt(page) > 1,
      nextPage: parseInt(page) + 1,
      previousPage: parseInt(page) - 1,
      lastPage: Math.ceil(totalTicketCount / parseInt(limit)),
      totalTicketCount,
    });

  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.getOneTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tickets = await TicketAssigned.find({ toEmployee: id });
    if (tickets) {
      res.status(200).json(tickets);
    } else {
      res.status(404).jsons("no tickets found");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.getClientEmployeeRel = async (req, res) => {// why have i written this
  try {
    const { id } = req.params;
    const clientAssigned = await Employees.findOne({ _id: id });
    // console.log(clientAssigned);

    if (clientAssigned) {
      const clientNames = clientAssigned.clients.map((item) =>
        item.clientName.split("-")[0].trim().toLowerCase()
      );

      const clientData = await getClient(clientNames);

      const clientsWithData = clientAssigned.clients.map((client) => {
        const clientInfo = clientData.find(
          (data) =>
            data.name.toLowerCase() ===
            client.clientName.split("-")[0].trim().toLowerCase()
        );
        client.clientType = clientInfo ? clientInfo.clientType : "Unknown";

        return {
          clientType: client.clientType,
          clientName: client.clientName,
          progressValue: client.progressValue,
          _id: client._id,
          createdAt: client.createdAt,
        };
      });

      const updatedClientsArray = [...clientsWithData];

      res.status(200).json(updatedClientsArray);
    } else {
      res.status(404).json("No assignment found");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
};



const getClient = async (clientNames) => {
  try {
    const clientData = await Clients.find({
      name: { $in: clientNames.map((name) => new RegExp(`^${name}$`, "i")) },
    });

    return clientData.map((client) => ({
      name: client.name,
      clientType: client.clientType,
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};



const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
        // to: adminEmails,// Assuming 'email' is a field in Clients model
        to: "minhazashraf590@gmail.com",
        from: "info@brandmonkey.in",
        subject: "Ticket Resolved",
        text: `Dear admin,\n\nThe ticket has been resolved successfully for ${clientName}.\n\nRegards,\n ${employeeName}`,
      };

      await sgMail.send(clientMsg);

      // console.log({ message: "TicketAssigned resolved successfully", ticket });
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


exports.getEmployeeTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const tickets = await TicketAssigned.find({ toEmployee: id, ticketraised: true });

    console.log(tickets);
    res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};