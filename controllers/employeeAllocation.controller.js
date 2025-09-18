const EmployeeAllocation = require("../models/employeeAllocation");
const Employees = require("../models/employee");

// Create or update employee allocation data
exports.createOrUpdateEmployeeAllocation = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      role,
      hourlyRate,
      hoursWorked,
      contributionPercentage,
      totalCost,
      clientAllocations,
      monthlyData,
      period
    } = req.body;

    // Check if employee exists
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Find existing allocation record or create new one
    let allocation = await EmployeeAllocation.findOne({ employeeId });
    
    if (allocation) {
      // Update existing record
      allocation.employeeName = employeeName || allocation.employeeName;
      allocation.role = role || allocation.role;
      allocation.hourlyRate = hourlyRate || allocation.hourlyRate;
      allocation.hoursWorked = hoursWorked || allocation.hoursWorked;
      allocation.contributionPercentage = contributionPercentage || allocation.contributionPercentage;
      allocation.totalCost = totalCost || allocation.totalCost;
      allocation.clientAllocations = clientAllocations || allocation.clientAllocations;
      allocation.monthlyData = monthlyData || allocation.monthlyData;
      allocation.period = period || allocation.period;
      allocation.lastUpdated = new Date();
    } else {
      // Create new record
      allocation = new EmployeeAllocation({
        employeeId,
        employeeName: employeeName || employee.name,
        role: role || employee.designation,
        hourlyRate: hourlyRate || 0,
        hoursWorked: hoursWorked || 0,
        contributionPercentage: contributionPercentage || 0,
        totalCost: totalCost || 0,
        clientAllocations: clientAllocations || [],
        monthlyData: monthlyData || [],
        period: period || {
          startDate: new Date(),
          endDate: new Date()
        }
      });
    }

    await allocation.save();
    res.status(201).json({ message: "Employee allocation data saved successfully", allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all employee allocation data
exports.getAllEmployeeAllocations = async (req, res) => {
  try {
    const { search, role, startDate, endDate, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.employeeName = { $regex: search, $options: "i" };
    }
    
    // Add role filter
    if (role) {
      query.role = { $regex: role, $options: "i" };
    }

    // Add date range filter
    if (startDate && endDate) {
      query["period.startDate"] = { $gte: new Date(startDate) };
      query["period.endDate"] = { $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;
    
    const allocations = await EmployeeAllocation.find(query)
      .populate("employeeId", "name designation team")
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await EmployeeAllocation.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      allocations,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get employee allocation by ID
exports.getEmployeeAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const allocation = await EmployeeAllocation.findById(id)
      .populate("employeeId", "name designation team email phoneNumber");
    
    if (!allocation) {
      return res.status(404).json({ error: "Employee allocation data not found" });
    }

    res.status(200).json({ allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get employee allocation by employee ID
exports.getEmployeeAllocationByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const allocation = await EmployeeAllocation.findOne({ employeeId })
      .populate("employeeId", "name designation team email phoneNumber");
    
    if (!allocation) {
      return res.status(404).json({ error: "Employee allocation data not found" });
    }

    res.status(200).json({ allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get employee allocation dashboard data
exports.getEmployeeAllocationDashboard = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    
    let query = {};
    if (search) {
      query.employeeName = { $regex: search, $options: "i" };
    }
    if (startDate && endDate) {
      query["period.startDate"] = { $gte: new Date(startDate) };
      query["period.endDate"] = { $lte: new Date(endDate) };
    }

    // Get employee allocation data
    const allocations = await EmployeeAllocation.find(query)
      .populate("employeeId", "name designation team")
      .sort({ lastUpdated: -1 });

    // Calculate summary statistics
    const totalEmployees = allocations.length;
    const totalHours = allocations.reduce((sum, alloc) => sum + alloc.hoursWorked, 0);
    const totalCost = allocations.reduce((sum, alloc) => sum + alloc.totalCost, 0);
    const averageHourlyRate = totalHours > 0 ? totalCost / totalHours : 0;

    // Calculate cost breakdown by role
    const costByRole = allocations.reduce((acc, alloc) => {
      const role = alloc.role;
      if (!acc[role]) {
        acc[role] = { count: 0, totalCost: 0, totalHours: 0 };
      }
      acc[role].count += 1;
      acc[role].totalCost += alloc.totalCost;
      acc[role].totalHours += alloc.hoursWorked;
      return acc;
    }, {});

    res.status(200).json({
      summary: {
        totalEmployees,
        totalHours,
        totalCost,
        averageHourlyRate
      },
      costByRole,
      allocations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update employee allocation metrics
exports.updateEmployeeAllocationMetrics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { hoursWorked, clientAllocations, period } = req.body;

    const allocation = await EmployeeAllocation.findOne({ employeeId });
    if (!allocation) {
      return res.status(404).json({ error: "Employee allocation data not found" });
    }

    // Update hours worked
    if (hoursWorked !== undefined) {
      allocation.hoursWorked = hoursWorked;
    }

    // Update client allocations
    if (clientAllocations) {
      allocation.clientAllocations = clientAllocations;
    }

    // Update period
    if (period) {
      allocation.period = period;
    }

    // Recalculate total cost
    allocation.totalCost = allocation.hoursWorked * allocation.hourlyRate;

    // Recalculate contribution percentage (this would need business logic)
    // For now, we'll keep it as is or calculate based on total team hours
    const totalTeamHours = await EmployeeAllocation.aggregate([
      { $group: { _id: null, totalHours: { $sum: "$hoursWorked" } } }
    ]);
    
    if (totalTeamHours.length > 0 && totalTeamHours[0].totalHours > 0) {
      allocation.contributionPercentage = (allocation.hoursWorked / totalTeamHours[0].totalHours) * 100;
    }

    allocation.lastUpdated = new Date();
    await allocation.save();

    res.status(200).json({ message: "Employee allocation metrics updated successfully", allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete employee allocation data
exports.deleteEmployeeAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const allocation = await EmployeeAllocation.findByIdAndDelete(id);
    if (!allocation) {
      return res.status(404).json({ error: "Employee allocation data not found" });
    }

    res.status(200).json({ message: "Employee allocation data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get employee hours and allocation table data
exports.getEmployeeHoursAndAllocation = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    
    let query = {};
    if (search) {
      query.employeeName = { $regex: search, $options: "i" };
    }
    if (startDate && endDate) {
      query["period.startDate"] = { $gte: new Date(startDate) };
      query["period.endDate"] = { $lte: new Date(endDate) };
    }

    const allocations = await EmployeeAllocation.find(query)
      .populate("employeeId", "name designation team")
      .sort({ employeeName: 1 });

    // Calculate totals
    const totalHours = allocations.reduce((sum, alloc) => sum + alloc.hoursWorked, 0);
    const totalCost = allocations.reduce((sum, alloc) => sum + alloc.totalCost, 0);

    res.status(200).json({
      employees: allocations,
      summary: {
        totalEmployees: allocations.length,
        totalHours,
        totalCost
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

