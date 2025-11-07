const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const { Hits } = require("../models/activities");
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
    const totalTickets = employee[0].totalTicketsIssued || 0;
    const totalTicketsResolved = employee[0].totalTicketsResolved || 0;
    const totalWorkProgress = parseInt(employee[0].progressPercentage) || 0;
    res.status(201).json({
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
        .select("-updatedAt -createdAt")
        .limit(pageSize)
        .skip(startIndex);

      const clientsWithTicketsCount = await Promise.all(
        clientsData.map(async (client) => {
          const ticketsCount = await TicketAssigned.countDocuments({
            forClients: client._id,
          });
          const { updatedAt, createdAt, ...clientObj } = client.toObject();
          return {
            ...clientObj,
            ticketsCount,
          };
        })
      );

      result = {
        nextPage: pageNumber + 1,
        data: clientsWithTicketsCount,
      };
    } else {
      const clientsData = await Clients.find(query).select(
        "-updatedAt -createdAt"
      );

      const clientsWithTicketsCount = await Promise.all(
        clientsData.map(async (client) => {
          const ticketsCount = await TicketAssigned.countDocuments({
            forClients: client._id,
          });
          const { updatedAt, createdAt, ...clientObj } = client.toObject();
          return {
            ...clientObj,
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
        if (Array.isArray(client.logo)) {
          client.clientLogo = await Promise.all(
            client.logo.map(async (image) => {
              return await getSignedUrlFromS3(`${image}`);
            })
          );
        } else if (client.logo) {
          client.clientLogo = await getSignedUrlFromS3(`${client.logo}`);
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
    const clients = await Clients.findById(id).select("-updatedAt -createdAt");
    if (clients) {
      clients.clientLogo = await getSignedUrlFromS3(`${clients.logo}`);
      const { updatedAt, createdAt, ...clientObj } = clients.toObject();
      res.status(200).json(clientObj);
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
    const start = Date.now(); // Record the start time
    const { page, limit, search } = req.query;
    let query = { type: { $ne: "superadmin" } };
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
          data: await Employees.find(query)
            .select(
              "-clients -team -password -progressPercentage -Gender -DateOfBirth -DateOfJoining -type"
            )
            .limit(pageSize)
            .skip(startIndex),
        };
      } else {
        result = {
          data: await Employees.find(query)
            .select(
              "-clients -team -password -progressPercentage -Gender -DateOfBirth -DateOfJoining -type"
            )
            .limit(pageSize)
            .skip(startIndex),
        };
      }
    } else {
      result = {
        data: await Employees.find(query).select(
          "-clients -team -password -progressPercentage -Gender -DateOfBirth -DateOfJoining -type"
        ),
      };
    }
    if (result.data.length > 0) {
      for (const employee of result.data) {
        if (Array.isArray(employee.name)) {
          employee.imageUrl = await Promise.all(
            employee.image.map(async (image) => {
              return await getSignedUrlFromS3(`${image}`);
            })
          );
        } else if (employee.name) {
          employee.imageUrl = await getSignedUrlFromS3(`${employee.image}`);
        }
      }
    }
    const end = Date.now(); // Record the end time
    const elapsedSeconds = (end - start) / 1000; // Calculate elapsed time in seconds

    console.log(elapsedSeconds + "secs");

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
      // Fetch and update client logos
      await Promise.all(
        employee.clients.map(async (client) => {
          client.clientLogo = client?.clientName?.length > 0 ? await getSignedUrlFromS3(
            `${client?.clientName?.split("-")[0]?.trim()}.png` || ""
          ) : "";
        })
      );
      employee.imageUrl = employee?.image?.length > 0 ? await getSignedUrlFromS3(`${employee?.image}`) : "";

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
  try {
    const { id } = req.params;
    const { date } = req.query;
    const clientAssigned = await Employees.findOne({ _id: id });

    if (clientAssigned) {
      const clientIds = clientAssigned.clients.map((item) => item.clientId);

      const clientData = await getClient(clientIds);

      // Build query for hits
      const hitsQuery = {
        employeeId: id,
      };

      // Filter by month if date is provided
      if (date) {
        const dateObj = new Date(date);

        // Validate date
        if (isNaN(dateObj.getTime())) {
          return res
            .status(400)
            .json({
              error: "Invalid date format. Please provide a valid date.",
            });
        }

        const targetYear = dateObj.getFullYear();
        const targetMonth = dateObj.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const targetMonthStr = `${targetYear}-${targetMonth
          .toString()
          .padStart(2, "0")}`;

        // Filter by month field (hits are aggregated by month in "YYYY-MM" format)
        hitsQuery.month = targetMonthStr;
      }

      // Fetch hits for this employee (optionally filtered by month)
      const employeeHits = await Hits.find(hitsQuery);
      // Create a map to aggregate hits by clientId
      const hitsMap = new Map();
      employeeHits.forEach((hit) => {
        const clientId = hit.clientId?.toString();
        if (clientId) {
          if (hitsMap.has(clientId)) {
            const existing = hitsMap.get(clientId);
            hitsMap.set(clientId, {
              totalHits: existing.totalHits + hit.noOfHits,
            });
          } else {
            hitsMap.set(clientId, {
              totalHits: hit.noOfHits,
            });
          }
        }
      });

      const clientsWithData = await Promise.all(
        clientAssigned.clients
          .map(async (client) => {
            const clientInfo = clientData.find(
              (data) => data._id?.toString() === client.clientId?.toString()
            );

            // Skip if clientInfo is not found
            if (!clientInfo) {
              return null;
            }

            const clientWork =
              client.clientName?.split("-")[1]?.trim().toLowerCase() || "";

            // Get hits data for this client
            const clientHitsData = hitsMap.get(client.clientId?.toString()) || {
              totalHits: 0,
            };
            const totalHits = clientHitsData.totalHits;
            const totalHours = (totalHits * 30) / 60; // Convert hits to hours (30 min per hit)

            // Build object and filter out undefined values
            const clientObj = {
              clientType: clientInfo?.clientType || null,
              clientName: clientInfo?.name
                ? `${clientInfo.name} - ${clientWork}`
                : null,
              progressValue: client?.progressValue || null,
              clientLogo: clientInfo?.logo
                ? await getSignedUrlFromS3(`${clientInfo.logo}`)
                : null,
              logo: clientInfo?.logo || null,
              _id: clientInfo?._id || null,
              createdAt: clientInfo?.createdAt || null,
              updatedAt: clientInfo?.updatedAt || null,
              totalHits: totalHits || 0,
              totalHours: totalHours || 0,
              services: client?.services?.length > 0 ? client?.services.join(", ") : `${clientWork}`,
            };

            // Remove undefined values
            Object.keys(clientObj).forEach((key) => {
              if (clientObj[key] === undefined) {
                delete clientObj[key];
              }
            });

            return clientObj;
          })
          .filter((client) => client !== null) // Remove null entries
      );

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

const getClient = async (clientIds) => {
  try {
    const clientData = await Clients.find({
      _id: { $in: clientIds },
    });

    return clientData.map((client) => ({
      _id: client._id,
      name: client.name.trim(),
      clientType: client.clientType,
      logo: client.logo,
      progressValue: client.progressValue,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
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

exports.getClientName = async (req, res) => {
  try {
    const { clientOrNot } = req.query;

    if (clientOrNot) {
      const client = await Clients.find({}).select("name");

      if (client.length === 0) {
        return res.status(404).json({ error: "No Clients found" });
      }
      res.status(200).json({ client });
    } else {
      const employee = await Employees.find({}).select("name");

      if (employee.length === 0) {
        return res.status(404).json({ error: "No Clients found" });
      }
      res.status(200).json({ employee });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
