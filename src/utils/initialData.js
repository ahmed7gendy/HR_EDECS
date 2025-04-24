export const initialData = {
  users: {
    admin: {
      email: "admin@edecs.com",
      displayName: "System Admin",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: ["*"], // All permissions
      settings: {
        language: "en",
        theme: "light",
        notifications: true
      }
    }
  },

  roles: {
    admin: {
      name: "Administrator",
      level: 1,
      permissions: ["*"],
      description: "Full system access"
    },
    hr_manager: {
      name: "HR Manager",
      level: 2,
      permissions: [
        "view_employees",
        "manage_employees",
        "view_attendance",
        "manage_attendance",
        "view_payroll",
        "manage_payroll",
        "view_leaves",
        "manage_leaves",
        "view_recruitment",
        "manage_recruitment",
        "view_training",
        "manage_training",
        "view_performance",
        "manage_performance",
        "view_reports"
      ],
      description: "HR department management access"
    },
    department_head: {
      name: "Department Head",
      level: 3,
      permissions: [
        "view_department_employees",
        "view_department_attendance",
        "approve_department_leaves",
        "view_department_performance",
        "manage_department_performance",
        "view_department_reports"
      ],
      description: "Department management access"
    },
    employee: {
      name: "Employee",
      level: 4,
      permissions: [
        "view_profile",
        "view_attendance",
        "submit_attendance",
        "view_payslips",
        "request_leave",
        "view_training"
      ],
      description: "Basic employee access"
    }
  },

  departments: {
    hr: {
      name: "Human Resources",
      code: "HR",
      description: "Human Resources Department",
      managerId: null, // Will be set when assigning a manager
      isActive: true
    },
    it: {
      name: "Information Technology",
      code: "IT",
      description: "IT Department",
      managerId: null,
      isActive: true
    },
    finance: {
      name: "Finance",
      code: "FIN",
      description: "Finance Department",
      managerId: null,
      isActive: true
    }
  },

  settings: {
    company: {
      name: "EDECS Business",
      email: "contact@edecs.com",
      phone: "01156265436",
      address: "123 Main St, Anytown, USA",
      website: "https://www.edecs.com",
      logo: "https://via.placeholder.com/150",
      taxId: "1234567890",
      registrationNumber: "1234567890",
      workingHours: {
        start: "09:00",
        end: "17:00",
        breakStart: "13:00",
        breakEnd: "14:00"
      },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      fiscalYear: {
        start: "01-01",
        end: "12-31"
      }
    },
    leave: {
      types: {
        annual: {
          name: "Annual Leave",
          daysPerYear: 21,
          carryOver: true,
          maxCarryOver: 5,
          paid: true
        },
        sick: {
          name: "Sick Leave",
          daysPerYear: 14,
          carryOver: false,
          paid: true
        },
        unpaid: {
          name: "Unpaid Leave",
          daysPerYear: 0,
          carryOver: false,
          paid: false
        }
      }
    },
    attendance: {
      graceMinutes: 15,
      lateThreshold: 30,
      absentThreshold: 240
    },
    payroll: {
      currency: "USD",
      paymentDate: 25,
      taxSettings: {
        enabled: true,
        calculateTax: true
      },
      components: {
        basic: {
          name: "Basic Salary",
          type: "fixed",
          taxable: true
        },
        hra: {
          name: "Housing Allowance",
          type: "fixed",
          taxable: true
        },
        transport: {
          name: "Transport Allowance",
          type: "fixed",
          taxable: true
        }
      }
    }
  }
};

// Function to initialize the database with this data
export const initializeDatabase = async (db, auth) => {
  try {
    // Create admin user in Authentication
    const adminCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@edecs.com",
      "Admin@123" // Initial password that should be changed on first login
    );

    // Update admin profile
    await updateProfile(adminCredential.user, {
      displayName: "System Admin"
    });

    // Initialize Firestore collections
    const batch = writeBatch(db);

    // Add admin user document
    batch.set(doc(db, 'users', adminCredential.user.uid), {
      ...initialData.users.admin,
      uid: adminCredential.user.uid
    });

    // Add roles
    Object.entries(initialData.roles).forEach(([roleId, roleData]) => {
      batch.set(doc(db, 'roles', roleId), {
        ...roleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Add departments
    Object.entries(initialData.departments).forEach(([deptId, deptData]) => {
      batch.set(doc(db, 'departments', deptId), {
        ...deptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Add settings
    batch.set(doc(db, 'settings', 'company'), {
      ...initialData.settings.company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Add leave settings
    batch.set(doc(db, 'settings', 'leave'), {
      ...initialData.settings.leave,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Add attendance settings
    batch.set(doc(db, 'settings', 'attendance'), {
      ...initialData.settings.attendance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Add payroll settings
    batch.set(doc(db, 'settings', 'payroll'), {
      ...initialData.settings.payroll,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Commit the batch
    await batch.commit();

    return {
      success: true,
      adminUid: adminCredential.user.uid,
      message: "Database initialized successfully"
    };

  } catch (error) {
    console.error("Error initializing database:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to check if database is already initialized
export const isDatabaseInitialized = async (db) => {
  try {
    const adminQuery = query(
      collection(db, 'users'),
      where('role', '==', 'admin'),
      limit(1)
    );
    
    const snapshot = await getDocs(adminQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking database initialization:", error);
    return false;
  }
}; 