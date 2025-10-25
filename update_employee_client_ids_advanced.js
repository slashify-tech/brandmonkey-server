// Advanced Studio 3T Script to update employee client array with client IDs
// This script matches client names (before the "-") to get client IDs from the clients collection

// Configuration
var DRY_RUN = true; // Set to false to actually perform updates
var BATCH_SIZE = 10; // Process employees in batches
var VERBOSE_LOGGING = true;

// Statistics
var stats = {
  totalEmployees: 0,
  employeesProcessed: 0,
  employeesUpdated: 0,
  clientsUpdated: 0,
  clientsSkipped: 0,
  clientsNotFound: 0,
  errors: 0
};

print("=".repeat(60));
print("EMPLOYEE CLIENT ID UPDATE SCRIPT");
print("=".repeat(60));
print("Mode: " + (DRY_RUN ? "DRY RUN (no changes will be made)" : "LIVE UPDATE"));
print("Batch Size: " + BATCH_SIZE);
print("=".repeat(60));

// Get total count of employees with clients
stats.totalEmployees = db.employees.countDocuments({
  "clients": { $exists: true, $ne: [] }
});

print("Found " + stats.totalEmployees + " employees with client data");

if (stats.totalEmployees === 0) {
  print("No employees found with client data. Exiting...");
  quit();
}

// Process employees in batches
var skip = 0;
var hasMore = true;

while (hasMore) {
  print("\n" + "-".repeat(40));
  print("Processing batch starting from employee " + skip);
  
  var employees = db.employees.find({
    "clients": { $exists: true, $ne: [] }
  }).skip(skip).limit(BATCH_SIZE);
  
  var batchCount = 0;
  
  employees.forEach(function(employee) {
    batchCount++;
    stats.employeesProcessed++;
    
    if (VERBOSE_LOGGING) {
      print("\nProcessing employee: " + employee.name + " (ID: " + employee._id + ")");
    }
    
    var hasUpdates = false;
    var updatedClients = [];
    var employeeStats = {
      clientsProcessed: 0,
      clientsUpdated: 0,
      clientsSkipped: 0,
      clientsNotFound: 0
    };
    
    if (employee.clients && employee.clients.length > 0) {
      employee.clients.forEach(function(client, index) {
        employeeStats.clientsProcessed++;
        var clientName = client.clientName;
        var updatedClient = Object.assign({}, client);
        
        // Check if clientId already exists
        if (client.clientId) {
          if (VERBOSE_LOGGING) {
            print("  Client " + (index + 1) + ": Already has clientId - " + client.clientId);
          }
          updatedClients.push(updatedClient);
          employeeStats.clientsSkipped++;
          stats.clientsSkipped++;
          return;
        }
        
        // Extract client name (before the "-")
        var actualClientName = clientName;
        if (clientName && clientName.includes(" - ")) {
          actualClientName = clientName.split(" - ")[0].trim();
        }
        
        if (VERBOSE_LOGGING) {
          print("  Client " + (index + 1) + ": Looking for '" + actualClientName + "'");
        }
        
        // Find matching client in clients collection
        var matchingClient = null;
        
        // Try exact match first
        matchingClient = db.clients.findOne({
          "name": { $regex: new RegExp("^" + actualClientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") }
        });
        
        // Try partial match if exact match fails
        if (!matchingClient) {
          matchingClient = db.clients.findOne({
            "name": { $regex: actualClientName, $options: "i" }
          });
        }
        
        if (matchingClient) {
          updatedClient.clientId = matchingClient._id;
          updatedClient.clientType = matchingClient.clientType || "Unknown";
          
          if (VERBOSE_LOGGING) {
            print("  ✓ Found match: " + matchingClient.name + " (ID: " + matchingClient._id + ")");
          }
          
          hasUpdates = true;
          employeeStats.clientsUpdated++;
          stats.clientsUpdated++;
        } else {
          if (VERBOSE_LOGGING) {
            print("  ⚠ No match found for: " + actualClientName + " (keeping without clientId)");
          }
          employeeStats.clientsNotFound++;
          stats.clientsNotFound++;
          // Still mark as having updates to save the employee record
          hasUpdates = true;
        }
        
        updatedClients.push(updatedClient);
      });
      
      // Always update employee record if there are clients to process
      if (employeeStats.clientsProcessed > 0) {
        if (!DRY_RUN) {
          try {
            var result = db.employees.updateOne(
              { "_id": employee._id },
              { $set: { "clients": updatedClients } }
            );
            
            if (result.modifiedCount > 0) {
              print("  ✓ Updated employee " + employee.name + " (processed " + employeeStats.clientsProcessed + " clients)");
              stats.employeesUpdated++;
            } else {
              print("  ✗ Failed to update employee " + employee.name);
              stats.errors++;
            }
          } catch (error) {
            print("  ✗ Error updating employee " + employee.name + ": " + error.message);
            stats.errors++;
          }
        } else {
          print("  [DRY RUN] Would update employee " + employee.name + " (processed " + employeeStats.clientsProcessed + " clients)");
          stats.employeesUpdated++;
        }
      } else {
        if (VERBOSE_LOGGING) {
          print("  - No clients to process for employee " + employee.name);
        }
      }
    }
    
    if (VERBOSE_LOGGING) {
      print("  Employee stats: " + employeeStats.clientsUpdated + " updated, " + 
            employeeStats.clientsSkipped + " skipped, " + 
            employeeStats.clientsNotFound + " not found");
    }
  });
  
  skip += BATCH_SIZE;
  hasMore = batchCount === BATCH_SIZE;
}

// Final summary
print("\n" + "=".repeat(60));
print("UPDATE SUMMARY");
print("=".repeat(60));
print("Total employees found: " + stats.totalEmployees);
print("Employees processed: " + stats.employeesProcessed);
print("Employees updated: " + stats.employeesUpdated);
print("Client records updated: " + stats.clientsUpdated);
print("Client records skipped (already had ID): " + stats.clientsSkipped);
print("Client records not found: " + stats.clientsNotFound);
print("Errors encountered: " + stats.errors);
print("=".repeat(60));

if (DRY_RUN) {
  print("\n⚠️  This was a DRY RUN - no changes were made");
  print("Set DRY_RUN = false to perform actual updates");
} else {
  print("\n✅ Update completed successfully");
}

// Verification query - show some examples of updated data
print("\nVERIFICATION - Sample of updated employees:");
var sampleEmployees = db.employees.find({
  "clients.clientId": { $exists: true }
}).limit(3);

var verificationCount = 0;
sampleEmployees.forEach(function(emp) {
  verificationCount++;
  print("\nEmployee " + verificationCount + ": " + emp.name);
  emp.clients.forEach(function(client, index) {
    if (client.clientId) {
      print("  Client " + (index + 1) + ": " + client.clientName + " (ID: " + client.clientId + ")");
    }
  });
});

if (verificationCount === 0) {
  print("No employees found with client IDs - this might indicate the script needs to be run");
}
