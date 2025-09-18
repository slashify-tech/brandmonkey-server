const ClientPerformance = require("../models/clientPerformance");
const EmployeeAllocation = require("../models/employeeAllocation");
const Clients = require("../models/clients");
const Employees = require("../models/employee");

// Sample data for client performance
const sampleClientPerformanceData = [
  {
    clientName: "Auto Repair Network",
    status: "Decline",
    statusDuration: "9mo",
    totalSpend: 24300,
    spendBreakdown: {
      meta: 14500,
      google: 9800,
      socialMedia: 0,
      other: 0
    },
    results: {
      impressions: 67,
      leads: 178,
      calls: 45,
      messages: 89
    },
    costPerResult: 64.12,
    trend: {
      percentage: -15.6,
      direction: "down"
    },
    monthlyData: [
      {
        month: "2024-01",
        spend: 2500,
        results: { impressions: 7, leads: 18, calls: 5, messages: 9 }
      },
      {
        month: "2024-02",
        spend: 2800,
        results: { impressions: 8, leads: 20, calls: 6, messages: 10 }
      },
      {
        month: "2024-03",
        spend: 2200,
        results: { impressions: 6, leads: 15, calls: 4, messages: 8 }
      }
    ]
  },
  {
    clientName: "Creative Design Hub",
    status: "Growth",
    statusDuration: "11mo",
    totalSpend: 24250,
    spendBreakdown: {
      meta: 13450,
      google: 10800,
      socialMedia: 0,
      other: 0
    },
    results: {
      impressions: 178,
      leads: 445,
      calls: 112,
      messages: 201
    },
    costPerResult: 25.91,
    trend: {
      percentage: 31.7,
      direction: "up"
    },
    monthlyData: [
      {
        month: "2024-01",
        spend: 2000,
        results: { impressions: 15, leads: 35, calls: 9, messages: 16 }
      },
      {
        month: "2024-02",
        spend: 2200,
        results: { impressions: 18, leads: 42, calls: 11, messages: 19 }
      },
      {
        month: "2024-03",
        spend: 2500,
        results: { impressions: 22, leads: 50, calls: 13, messages: 23 }
      }
    ]
  },
  {
    clientName: "E-commerce Startup",
    status: "New",
    statusDuration: "2mo",
    totalSpend: 9700,
    spendBreakdown: {
      meta: 5600,
      google: 4100,
      socialMedia: 0,
      other: 0
    },
    results: {
      impressions: 34,
      leads: 98,
      calls: 12,
      messages: 45
    },
    costPerResult: 51.32,
    trend: {
      percentage: 67.3,
      direction: "up"
    },
    monthlyData: [
      {
        month: "2024-02",
        spend: 4500,
        results: { impressions: 15, leads: 45, calls: 6, messages: 20 }
      },
      {
        month: "2024-03",
        spend: 5200,
        results: { impressions: 19, leads: 53, calls: 6, messages: 25 }
      }
    ]
  }
];

// Sample data for employee allocation
const sampleEmployeeAllocationData = [
  {
    employeeName: "Sarah Johnson",
    role: "Senior Developer",
    hourlyRate: 85,
    hoursWorked: 160,
    contributionPercentage: 35,
    totalCost: 13600,
    clientAllocations: [
      {
        clientName: "Auto Repair Network",
        hoursAllocated: 60,
        costForClient: 5100
      },
      {
        clientName: "Creative Design Hub",
        hoursAllocated: 100,
        costForClient: 8500
      }
    ],
    monthlyData: [
      {
        month: "2024-01",
        hoursWorked: 40,
        totalCost: 3400,
        clientBreakdown: [
          { clientName: "Auto Repair Network", hours: 15, cost: 1275 },
          { clientName: "Creative Design Hub", hours: 25, cost: 2125 }
        ]
      },
      {
        month: "2024-02",
        hoursWorked: 45,
        totalCost: 3825,
        clientBreakdown: [
          { clientName: "Auto Repair Network", hours: 20, cost: 1700 },
          { clientName: "Creative Design Hub", hours: 25, cost: 2125 }
        ]
      }
    ],
    period: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31")
    }
  },
  {
    employeeName: "Mike Chen",
    role: "Project Manager",
    hourlyRate: 75,
    hoursWorked: 120,
    contributionPercentage: 25,
    totalCost: 9000,
    clientAllocations: [
      {
        clientName: "E-commerce Startup",
        hoursAllocated: 80,
        costForClient: 6000
      },
      {
        clientName: "Creative Design Hub",
        hoursAllocated: 40,
        costForClient: 3000
      }
    ],
    monthlyData: [
      {
        month: "2024-01",
        hoursWorked: 35,
        totalCost: 2625,
        clientBreakdown: [
          { clientName: "E-commerce Startup", hours: 25, cost: 1875 },
          { clientName: "Creative Design Hub", hours: 10, cost: 750 }
        ]
      },
      {
        month: "2024-02",
        hoursWorked: 40,
        totalCost: 3000,
        clientBreakdown: [
          { clientName: "E-commerce Startup", hours: 30, cost: 2250 },
          { clientName: "Creative Design Hub", hours: 10, cost: 750 }
        ]
      }
    ],
    period: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31")
    }
  },
  {
    employeeName: "Emma Davis",
    role: "UI/UX Designer",
    hourlyRate: 65,
    hoursWorked: 100,
    contributionPercentage: 20,
    totalCost: 6500,
    clientAllocations: [
      {
        clientName: "Creative Design Hub",
        hoursAllocated: 60,
        costForClient: 3900
      },
      {
        clientName: "E-commerce Startup",
        hoursAllocated: 40,
        costForClient: 2600
      }
    ],
    monthlyData: [
      {
        month: "2024-01",
        hoursWorked: 30,
        totalCost: 1950,
        clientBreakdown: [
          { clientName: "Creative Design Hub", hours: 20, cost: 1300 },
          { clientName: "E-commerce Startup", hours: 10, cost: 650 }
        ]
      },
      {
        month: "2024-02",
        hoursWorked: 35,
        totalCost: 2275,
        clientBreakdown: [
          { clientName: "Creative Design Hub", hours: 20, cost: 1300 },
          { clientName: "E-commerce Startup", hours: 15, cost: 975 }
        ]
      }
    ],
    period: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31")
    }
  },
  {
    employeeName: "Alex Rodriguez",
    role: "Developer",
    hourlyRate: 70,
    hoursWorked: 140,
    contributionPercentage: 30,
    totalCost: 9800,
    clientAllocations: [
      {
        clientName: "Auto Repair Network",
        hoursAllocated: 80,
        costForClient: 5600
      },
      {
        clientName: "E-commerce Startup",
        hoursAllocated: 60,
        costForClient: 4200
      }
    ],
    monthlyData: [
      {
        month: "2024-01",
        hoursWorked: 45,
        totalCost: 3150,
        clientBreakdown: [
          { clientName: "Auto Repair Network", hours: 25, cost: 1750 },
          { clientName: "E-commerce Startup", hours: 20, cost: 1400 }
        ]
      },
      {
        month: "2024-02",
        hoursWorked: 50,
        totalCost: 3500,
        clientBreakdown: [
          { clientName: "Auto Repair Network", hours: 30, cost: 2100 },
          { clientName: "E-commerce Startup", hours: 20, cost: 1400 }
        ]
      }
    ],
    period: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31")
    }
  },
  {
    employeeName: "Lisa Wang",
    role: "QA Engineer",
    hourlyRate: 55,
    hoursWorked: 80,
    contributionPercentage: 15,
    totalCost: 4400,
    clientAllocations: [
      {
        clientName: "Creative Design Hub",
        hoursAllocated: 50,
        costForClient: 2750
      },
      {
        clientName: "Auto Repair Network",
        hoursAllocated: 30,
        costForClient: 1650
      }
    ],
    monthlyData: [
      {
        month: "2024-01",
        hoursWorked: 25,
        totalCost: 1375,
        clientBreakdown: [
          { clientName: "Creative Design Hub", hours: 15, cost: 825 },
          { clientName: "Auto Repair Network", hours: 10, cost: 550 }
        ]
      },
      {
        month: "2024-02",
        hoursWorked: 30,
        totalCost: 1650,
        clientBreakdown: [
          { clientName: "Creative Design Hub", hours: 20, cost: 1100 },
          { clientName: "Auto Repair Network", hours: 10, cost: 550 }
        ]
      }
    ],
    period: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31")
    }
  }
];

// Function to seed client performance data
const seedClientPerformanceData = async () => {
  try {
    // Clear existing data
    await ClientPerformance.deleteMany({});
    
    // Get existing clients to link with performance data
    const clients = await Clients.find({});
    
    if (clients.length === 0) {
      console.log("No clients found. Please create clients first.");
      return;
    }

    // Create performance data for each client
    for (let i = 0; i < Math.min(sampleClientPerformanceData.length, clients.length); i++) {
      const client = clients[i];
      const performanceData = sampleClientPerformanceData[i];
      
      const clientPerformance = new ClientPerformance({
        clientId: client._id,
        clientName: performanceData.clientName,
        status: performanceData.status,
        statusDuration: performanceData.statusDuration,
        totalSpend: performanceData.totalSpend,
        spendBreakdown: performanceData.spendBreakdown,
        results: performanceData.results,
        costPerResult: performanceData.costPerResult,
        trend: performanceData.trend,
        monthlyData: performanceData.monthlyData
      });
      
      await clientPerformance.save();
    }
    
    console.log("Client performance data seeded successfully");
  } catch (error) {
    console.error("Error seeding client performance data:", error);
  }
};

// Function to seed employee allocation data
const seedEmployeeAllocationData = async () => {
  try {
    // Clear existing data
    await EmployeeAllocation.deleteMany({});
    
    // Get existing employees to link with allocation data
    const employees = await Employees.find({ type: { $ne: "superadmin" } });
    
    if (employees.length === 0) {
      console.log("No employees found. Please create employees first.");
      return;
    }

    // Create allocation data for each employee
    for (let i = 0; i < Math.min(sampleEmployeeAllocationData.length, employees.length); i++) {
      const employee = employees[i];
      const allocationData = sampleEmployeeAllocationData[i];
      
      const employeeAllocation = new EmployeeAllocation({
        employeeId: employee._id,
        employeeName: allocationData.employeeName,
        role: allocationData.role,
        hourlyRate: allocationData.hourlyRate,
        hoursWorked: allocationData.hoursWorked,
        contributionPercentage: allocationData.contributionPercentage,
        totalCost: allocationData.totalCost,
        clientAllocations: allocationData.clientAllocations,
        monthlyData: allocationData.monthlyData,
        period: allocationData.period
      });
      
      await employeeAllocation.save();
    }
    
    console.log("Employee allocation data seeded successfully");
  } catch (error) {
    console.error("Error seeding employee allocation data:", error);
  }
};

// Function to seed all dashboard data
const seedDashboardData = async () => {
  try {
    console.log("Starting dashboard data seeding...");
    await seedClientPerformanceData();
    await seedEmployeeAllocationData();
    console.log("Dashboard data seeding completed successfully");
  } catch (error) {
    console.error("Error seeding dashboard data:", error);
  }
};

module.exports = {
  seedClientPerformanceData,
  seedEmployeeAllocationData,
  seedDashboardData
};




