const { Task, Hits } = require('../models/activities');
const Clients = require('../models/clients');
const Employees = require('../models/employee');

// Sample activities data
const sampleActivities = [
  'Content Creation',
  'Social Media Posting',
  'Client Communication',
  'Design Work',
  'Video Editing',
  'Photo Editing',
  'Campaign Management',
  'Analytics Review',
  'Strategy Planning',
  'Content Scheduling',
  'Client Meeting',
  'Report Generation',
  'SEO Optimization',
  'Ad Campaign Setup',
  'Performance Analysis',
  'Content Research',
  'Brand Management',
  'Client Feedback',
  'Project Planning',
  'Quality Assurance'
];

// Sample time slots - matching the exact format from the example
const timeSlots = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM'
];

// Generate random date within the past 30 days
const getRandomDate = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime());
  const randomDate = new Date(randomTime);
  
  // Format date as "DD MMM YYYY" (e.g., "2 Oct 2025")
  const day = randomDate.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[randomDate.getMonth()];
  const year = randomDate.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Generate random time within a day
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate countId (simple number)
const getCountId = () => {
  // Generate a random number between 1 and 1000
  return Math.floor(Math.random() * 1000) + 1;
};

// Main seeder function
const seedActivities = async (employeeId, numberOfDocs = 100) => {
  try {
    console.log(`Starting activities seeding for employee: ${employeeId}`);
    
    // Verify employee exists
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Get all clients for this employee
    const clients = await Clients.find({});
    if (clients.length === 0) {
      throw new Error('No clients found in database');
    }

    console.log(`Found ${clients.length} clients for seeding`);

    const activities = [];
    const hitsMap = new Map(); // To track hits per client per month

    // Generate random activities
    for (let i = 0; i < numberOfDocs; i++) {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
      const randomTimeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const randomDate = getRandomDate();
      const countId = getCountId();
      
      // Randomly choose between regular activity and extra activity
      const type = Math.random() < 0.8 ? 'activity' : 'extraActivity';

      const activity = {
        employeeId: employeeId,
        clientName: randomClient.name,
        clientId: randomClient._id,
        activity: randomActivity,
        timeSlot: randomTimeSlot,
        date: randomDate,
        type: type,
        countId: countId,
        isDeleted: false
      };

      activities.push(activity);

      // Track hits for this client and month
      const month = randomDate.substring(0, 7); // YYYY-MM format
      const hitKey = `${employeeId}-${randomClient._id}-${month}`;
      
      if (hitsMap.has(hitKey)) {
        hitsMap.set(hitKey, hitsMap.get(hitKey) + 1);
      } else {
        hitsMap.set(hitKey, 1);
      }
    }

    // Insert activities
    console.log(`Inserting ${activities.length} activities...`);
    const insertedActivities = await Task.insertMany(activities);
    console.log(`Successfully inserted ${insertedActivities.length} activities`);

    // Create hits based on activities
    const hits = [];
    for (const [hitKey, noOfHits] of hitsMap) {
      const [empId, clientId, month] = hitKey.split('-');
      const client = clients.find(c => c._id.toString() === clientId);
      
      if (client) {
        hits.push({
          employeeId: empId,
          clientName: client.name,
          clientId: client._id,
          noOfHits: noOfHits,
          month: month,
          isDeleted: false
        });
      }
    }

    // Insert hits
    console.log(`Inserting ${hits.length} hits...`);
    const insertedHits = await Hits.insertMany(hits);
    console.log(`Successfully inserted ${insertedHits.length} hits`);

    return {
      activities: insertedActivities.length,
      hits: insertedHits.length,
      message: `Successfully seeded ${insertedActivities.length} activities and ${insertedHits.length} hits for employee ${employeeId}`
    };

  } catch (error) {
    console.error('Error seeding activities:', error);
    throw error;
  }
};

// Function to clear existing data for an employee
const clearEmployeeData = async (employeeId) => {
  try {
    console.log(`Clearing existing data for employee: ${employeeId}`);
    
    // Mark activities as deleted
    const deletedActivities = await Task.updateMany(
      { employeeId: employeeId, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    
    // Mark hits as deleted
    const deletedHits = await Hits.updateMany(
      { employeeId: employeeId, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    
    console.log(`Marked ${deletedActivities.modifiedCount} activities and ${deletedHits.modifiedCount} hits as deleted`);
    
    return {
      activitiesDeleted: deletedActivities.modifiedCount,
      hitsDeleted: deletedHits.modifiedCount
    };
  } catch (error) {
    console.error('Error clearing employee data:', error);
    throw error;
  }
};

// Function to get seeding statistics
const getSeedingStats = async (employeeId) => {
  try {
    const activityCount = await Task.countDocuments({ 
      employeeId: employeeId, 
      isDeleted: false 
    });
    
    const hitsCount = await Hits.countDocuments({ 
      employeeId: employeeId, 
      isDeleted: false 
    });
    
    // Get date range
    const oldestActivity = await Task.findOne(
      { employeeId: employeeId, isDeleted: false },
      {},
      { sort: { date: 1 } }
    );
    
    const newestActivity = await Task.findOne(
      { employeeId: employeeId, isDeleted: false },
      {},
      { sort: { date: -1 } }
    );
    
    return {
      employeeId: employeeId,
      totalActivities: activityCount,
      totalHits: hitsCount,
      dateRange: {
        oldest: oldestActivity ? oldestActivity.date : null,
        newest: newestActivity ? newestActivity.date : null
      }
    };
  } catch (error) {
    console.error('Error getting seeding stats:', error);
    throw error;
  }
};

module.exports = {
  seedActivities,
  clearEmployeeData,
  getSeedingStats
};
