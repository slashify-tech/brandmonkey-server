// Studio 3T Script - Client Migration and Performance Entry Creation
// Run this script in Studio 3T MongoDB Shell

print("=== Starting Client Migration Script ===");

// Step 1: Add timestamps to all clients without createdAt/updatedAt
print("\n[Step 1] Adding timestamps to client documents...");

const clientsCollection = db.clients;

// Get all clients without timestamps
const clientsWithoutTimestamps = clientsCollection.find({
  $or: [
    { createdAt: { $exists: false } },
    { updatedAt: { $exists: false } }
  ]
}).toArray();

print(`Found ${clientsWithoutTimestamps.length} clients without timestamps`);

let timestampUpdateCount = 0;
clientsWithoutTimestamps.forEach(client => {
  const updateData = {};
  
  if (!client.createdAt) {
    updateData.createdAt = new Date(client._id.getTimestamp());
  }
  
  if (!client.updatedAt) {
    updateData.updatedAt = new Date();
  }
  
  clientsCollection.updateOne(
    { _id: client._id },
    { $set: updateData }
  );
  
  timestampUpdateCount++;
});

print(`Updated ${timestampUpdateCount} clients with timestamps`);