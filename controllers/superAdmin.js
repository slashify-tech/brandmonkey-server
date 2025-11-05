const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const EmployeeReview = require("../models/reviewList");
const ClientPerformance = require("../models/clientPerformance");
const dotenv = require("dotenv");
const {
  resizeImage,
  uploadToS3,
  generateFileName,
  deleteFromS3,
} = require("../utils/s3Utils");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");

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

exports.addEmployee = async (req, res, next) => {
  try {
    let hashedPass;
    if (req.body.password) {
      hashedPass = simpleEncrypt(req.body.password, 5);
    }
    const {name, email} = req.body;
    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;

      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);

      await uploadToS3(resizedImageBuffer, fileName, mimetype);

      await Employees.create({
        ...req.body,
        name : name.trim(),
        email : email.toLowerCase(),
        password: hashedPass,
        phoneNumber: req.body.phoneNumber,
        type: "employee",
        image: fileName,
        monthlySalary: req.body.monthlySalary,
      });
    } else {
      await Employees.create({
        ...req.body,
        name : name.trim(),
        email : email.toLowerCase(),
        password: hashedPass,
        phoneNumber: req.body.phoneNumber,
        type: "employee",
        monthlySalary: req.body.monthlySalary,
      });
    }
    // await employee.save();
    res.status(201).json("adding succesful");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addClient = async (req, res, next) => {
  try {
    const {name} = req.body;
    let client;
    
    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;

      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);

      await uploadToS3(resizedImageBuffer, fileName, mimetype);

      client = await Clients.create({ ...req.body, logo: fileName, name : name.trim() });
    } else {
      client = await Clients.create({ ...req.body, name : name.trim() });
    }
    
    // Create blank client performance entries for all 5 weeks of current month
    // Only if no documents exist for this client
    const existingPerformance = await ClientPerformance.findOne({ clientId: client._id });
    
    if (!existingPerformance) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const performanceEntries = [];
      
      for (let week = 1; week <= 1; week++) {
        performanceEntries.push({
          clientId: client._id,
          month: currentMonth,
          week: week,
          status: 'Active'
        });
      }
      
      await ClientPerformance.insertMany(performanceEntries);
    }
    
    res.status(201).json("adding succesful");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editClient = async (req, res, next) => {
  try {
    const {name} = req.body;
    const client = await Clients.findById(req.params.id);

    if (!client) {
      return res.status(404).json("client not found");
    }

    let upadatedClient;
    upadatedClient = { ...req.body , name : name.trim()};
    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;

      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);

      await deleteFromS3(client.logo);

      await uploadToS3(resizedImageBuffer, fileName, mimetype);
      upadatedClient.logo = fileName;
    }

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

exports.editEmployee = async (req, res, next) => {
  try {
    const {name, email} = req.body;
    const employee = await Employees.findById(req.params.id);

    if (!employee) {
      return res.status(404).json("employee not found");
    }

    let upadatedEmployee = {
      ...req.body,
      name : name.trim(),
      email : email.toLowerCase(),
      password: simpleEncrypt(req.body.password, 5),
    };
    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;

      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);

      if (employee.image !== "") {
        await deleteFromS3(employee.image);
      }

      await uploadToS3(resizedImageBuffer, fileName, mimetype);
      upadatedEmployee.image = fileName;
    }

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

exports.addFieldsToClients = async (req, res) => {
  try {
    const { fieldName } = req.body;
    const defaultValue = "NA";

    const isFieldInSchema = Clients.schema.paths[fieldName] != null;

    if (!isFieldInSchema) {
      const updatedClients = await Clients.updateMany(
        {},
        { $set: { [fieldName]: defaultValue } }
      );

      res.status(200).json({
        message: `Field '${fieldName}' added to all clients with default value '${defaultValue}'.`,
        updatedClients,
      });
    } else {
      res.status(400).json({
        error: `Field '${fieldName}' already exists in the client schema.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.editFieldsInClients = async (req, res) => {
  try {
    const { oldFieldName, newFieldName } = req.body;

    const clientsToUpdate = await Clients.find({
      [oldFieldName]: { $exists: true },
    });

    if (clientsToUpdate.length > 0) {
      const updatePromises = clientsToUpdate.map((client) =>
        Clients.findByIdAndUpdate(client._id, {
          [newFieldName]: client[oldFieldName],
          $unset: { [oldFieldName]: 1 },
        })
      );

      await Promise.all(updatePromises);
      res.status(200).json({
        message: `Field '${oldFieldName}' updated to '${newFieldName}' in applicable clients.`,
      });
    } else {
      res
        .status(404)
        .json({ error: `No clients found with the field '${oldFieldName}'.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteFieldsFromClients = async (req, res) => {
  try {
    const { fieldName } = req.body;

    const updatedClients = await Clients.updateMany(
      {},
      { $unset: { [fieldName]: 1 } }
    );

    res.status(200).json({
      message: `Field '${fieldName}' deleted from all clients.`,
      updatedClients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.storeClientDistributionData = async (req, res) => {
  try {
    const { clients, service } = req.body; // Expecting an array of client names and a single service
    const userId = req.params.id;
    // console.log(clients, service);
    // console.log(userId);

    const user = await Employees.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let clientDistribution = await Employees.findOne({ _id: user._id });
    if (!clientDistribution) {
      clientDistribution = new Employees({
        _id: user._id,
        clients: [],
        progressPercentage: "0",
      });
    }

    // Find client IDs by matching names
    const clientIds = [];
    const clientDetails = [];
    
    for (const clientName of clients) {
      const client = await Clients.findOne({ name: clientName.trim() });
      if (client) {
        clientIds.push(client._id);
        clientDetails.push({
          clientId: client._id,
          clientName: client.name,
          clientType: client.clientType || "Unknown"
        });
      } else {
        console.warn(`Client not found: ${clientName}`);
      }
    }

    for (const clientDetail of clientDetails) {
      const existingClientIndex = clientDistribution.clients.findIndex(
        (clientObj) => clientObj.clientName.startsWith(clientDetail.clientName.trim())
      );

      if (existingClientIndex !== -1) {
        // Update existing client with new service
        clientDistribution.clients[existingClientIndex].progressValue = "0-10";
        clientDistribution.clients[existingClientIndex].clientName += `, ${service.trim()}`;
        clientDistribution.clients[existingClientIndex].services.push(service.trim());
      } else {
        // Add new client with service
        clientDistribution.clients.push({
          clientId: clientDetail.clientId, // Store the client ID
          clientName: `${clientDetail.clientName.trim()} - ${service.trim()}`,
          services: [service.trim()],
          progressValue: "0-10"
        });
      }
    }

    // Remove duplicates based on clientName
    clientDistribution.clients = clientDistribution.clients.filter(
      (client, index, self) =>
        index === self.findIndex((c) => c.clientName === client.clientName)
    );

    const savedClientDistribution = await clientDistribution.save();
    res.status(201).json(savedClientDistribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




exports.updateClientType = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Clients.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (client.clientType.toLowerCase() === "regular") {
      client.clientType = "Onetime";
    } else if (client.clientType.toLowerCase() === "onetime") {
      client.clientType = "Regular";
    }

    const updatedClient = await client.save();

    // Find and update all instances in clientDistributionSchema with a partial clientName match
    await Employees.updateMany(
      { "clients.clientName": { $regex: new RegExp(client.name, "i") } },
      { $set: { "clients.$.clientType": client.clientType } }
    );

    // Fetch and return the updated clientDistributionSchema
    const updatedDistribution = await Employees.find({
      "clients.clientName": { $regex: new RegExp(client.name, "i") },
    });

    res.status(200).json({ updatedClient, updatedDistribution });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required parameter: id." });
    }

    // Delete employee data
    const employee = await Employees.findOne({ _id: id });
    if (employee.image !== "") {
      await deleteFromS3(employee.image);
    }
    await Employees.findByIdAndUpdate(id, { isDeleted: true });

    // Delete related ticket list
    await TicketAssigned.deleteMany({ toEmployee: id });

    // Delete related review list
    await EmployeeReview.findOneAndDelete({ employeeData: id });

    res.status(200).json({
      message:
        "Employee data, ticket list, and review list deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteClientData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required parameter: id." });
    }

    // Find the client to be deleted
    const deletedClient = await Clients.findById(id);

    if (deletedClient.logo !== "") {
      await deleteFromS3(deletedClient.logo);
    }

    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found." });
    }

    // Delete the client
    await Clients.findByIdAndDelete(id);

    // Remove the client from the clients array of all employees
    await Employees.updateMany(
      {},
      { $pull: { clients: { clientName: deletedClient.name } } }
    );

    res.status(200).json({ message: "Client data deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteClientAllot = async (req, res) => {
  const { id } = req.params;
  const { clientId } = req.query;

  try {
    // Find the employee by id
    const employee = await Employees.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Find the index of the client in the clients array
    const clientIndex = employee.clients.findIndex(
      (client) => client._id.toString() === clientId
    );

    if (clientIndex === -1) {
      return res
        .status(404)
        .json({ message: "Client not found for the given employee" });
    }

    // Remove the client from the clients array
    employee.clients.splice(clientIndex, 1);

    // Save the updated employee
    await employee.save();

    return res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
