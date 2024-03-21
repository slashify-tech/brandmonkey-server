const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const dotenv = require("dotenv");
const { getSignedUrlFromS3 } = require("../utils/s3Utils");

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

exports.getDashBoardEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employees.find({ _id: id });

    const totalClients = employee[0].clients.length;
    const totalTickets = employee[0].totalTicketsIssued;
    const totalTicketsResolved = employee[0].totalTicketsResolved;
    const totalWorkProgress = parseInt(employee[0].progressPercentage);
    res
      .status(201)
      .json({
        totalClients,
        totalTickets,
        totalWorkProgress,
        totalTicketsResolved,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
    let { page, limit, search, clientType } = req.query;
    let query = {};
    let result;
    let totalClientsCount;
    let endIndex;

    // Initialize page with 1 if not present
    page = page ? parseInt(page) : 1;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        ...query,
        $or: [{ clientType: searchRegex }, { name: searchRegex }],
      };
    }

    if (clientType) {
      query.clientType = clientType; // Add filter for clientType
      limit = 12;
    }

    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalClientsCount = await Clients.countDocuments(query);

      const clientsData = await Clients.find(query)
        .limit(pageSize)
        .skip(startIndex);

      const clientsWithTicketsCount = await Promise.all(
        clientsData.map(async (client) => {
          const ticketsCount = await TicketAssigned.countDocuments({
            forClients: client._id,
          });
          return {
            ...client.toObject(),
            ticketsCount,
          };
        })
      );

      result = {
        nextPage: pageNumber + 1,
        data: clientsWithTicketsCount,
      };
    } else {
      const clientsData = await Clients.find(query);

      const clientsWithTicketsCount = await Promise.all(
        clientsData.map(async (client) => {
          const ticketsCount = await TicketAssigned.countDocuments({
            forClients: client._id,
          });
          return {
            ...client.toObject(),
            ticketsCount,
          };
        })
      );

      result = {
        data: clientsWithTicketsCount,
      };
    }
    if (result.data.length > 0) {
      for (const client of result.data) {
        if (Array.isArray(client.name)) {
          client.clientLogo = await Promise.all(
            client.name.map(async (image) => {
              return await getSignedUrlFromS3(`${image}` + ".png");
            })
          );
        } else if (client.name) {
          client.clientLogo = await getSignedUrlFromS3(
            `${client.name}` + ".png"
          );
        }
      }
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
      clients.clientLogo = await getSignedUrlFromS3(`${clients.name}` + ".png");
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
    if (result.data.length > 0) {
      for (const employee of result.data) {
        if (Array.isArray(employee.name)) {
          employee.imageUrl = await Promise.all(
            employee.name.map(async (image) => {
              return await getSignedUrlFromS3(`${image}` + ".jpg");
            })
          );
        } else if (employee.name) {
          employee.imageUrl = await getSignedUrlFromS3(
            `${employee.name}` + ".jpg"
          );
        }
      }
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
      employee.imageUrl = await getSignedUrlFromS3(`${employee.name}` + ".jpg");
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

exports.getClientEmployeeRel = async (req, res) => {
  // why have i written this
  try {
    const { id } = req.params;
    const clientAssigned = await Employees.findOne({ _id: id });

    if (clientAssigned) {
      const clientNames = clientAssigned.clients.map((item) =>
        item.clientName.split("-")[0].trim().toLowerCase()
      );

      const clientData = await getClient(clientNames);

      const clientsWithData = clientAssigned.clients.map((client) => {
        const clientInfo = clientData.find(
          (data) =>
            data.name.trim().toLowerCase() ===
            client.clientName.split("-")[0].trim().toLowerCase()
        );
        client.clientType = clientInfo;

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
      name: client.name.trim(),
      clientType: client.clientType,
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getEmployeeTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const tickets = await TicketAssigned.find({
      toEmployee: id,
      ticketraised: true,
    });

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

exports.getClientWork = async (req, res) => {
  try {
    const { id } = req.params;
    let { clientName, clientWork } = req.query;

    if (clientWork === "Youtube") {
      clientWork = "Youtube Management";
    }

    // Query for clients using the correct field name
    const client = await Clients.find({ name: clientName });

    if (client.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ clientWork: client[0][clientWork] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
