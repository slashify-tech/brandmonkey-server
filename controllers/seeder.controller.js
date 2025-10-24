const { seedActivities } = require('../seeders/activitiesSeeder');
const { Task, Hits } = require('../models/activities');
const Clients = require('../models/clients');
const Employees = require('../models/employee');

// Seed activities and hits for an employee
exports.seedEmployeeData = async (req, res) => {
  try {
    const { employeeId, numberOfDocs = 100 } = req.body;

    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    // Validate employee exists
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Check if employee has existing data
    const existingActivities = await Task.countDocuments({ 
      employeeId: employeeId, 
      isDeleted: false 
    });
    
    const existingHits = await Hits.countDocuments({ 
      employeeId: employeeId, 
      isDeleted: false 
    });

    if (existingActivities > 0 || existingHits > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee already has data. Use clearEmployeeData first to remove existing data.',
        existingData: {
          activities: existingActivities,
          hits: existingHits
        }
      });
    }

    // Seed activities (this will also create hits automatically)
    const result = await seedActivities(employeeId, numberOfDocs);

    res.status(200).json({
      success: true,
      message: 'Employee data seeded successfully',
      data: result
    });

  } catch (error) {
    console.error('Error seeding employee data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding employee data',
      error: error.message 
    });
  }
};