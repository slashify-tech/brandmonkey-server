const Clients = require("../models/clients");
const Employees = require("../models/employee");
const TicketAssigned = require("../models/ticketRaise");
const EmployeeReview = require("../models/reviewList");
const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");


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
      const { client, service } = req.body;
      const userId = req.params.id;
  
      const user = await Employees.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const servicesArray = service.split(",");
  
      let clientDistribution = await Employees.findOne({
        _id: user._id,
      });
  
      if (!clientDistribution) {
        clientDistribution = new Employees({
          _id: user._id,
          clients: [],
          progressStatus: "start",
        });
      }
  
      servicesArray.forEach((service) => {
        const existingClient = clientDistribution.clients.find(
          (client) => client.clientName === client
        );
        if (existingClient) {
          existingClient.progressValue = "0-10";
        } else {
          clientDistribution.clients.push({
            clientName: client + "-" + service,
            progressValue: "0-10",
          });
        }
      });
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
      await Employees.findByIdAndDelete(id);
  
      // Delete related ticket list
      await TicketAssigned.deleteMany({ toEmployee: id });
  
      // Delete related review list
      await EmployeeReview.findOneAndDelete({ employeeData: id });
  
      res
        .status(200)
        .json({
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
  
      await Clients.findByIdAndDelete(id);
  
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
      const employee = await Employees.findById( id );
  
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      // Find the index of the client in the clients array
      const clientIndex = employee.clients.findIndex((client) => client._id.toString() === clientId);
  
      if (clientIndex === -1) {
        return res.status(404).json({ message: "Client not found for the given employee" });
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