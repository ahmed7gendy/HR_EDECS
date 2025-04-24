import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Database schema for all collections
export const databaseSchema = {
  // Users collection
  users: {
    fields: {
      email: 'string',
      displayName: 'string',
      role: 'string',
      department: 'string',
      jobTitle: 'string',
      employmentType: 'string',
      status: 'string', // active, on_leave, terminated
      joiningDate: 'timestamp',
      salary: 'number',
      phone: 'string',
      address: 'string',
      emergencyContact: 'object',
      documents: 'array',
      permissions: 'array',
      settings: 'object',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Attendance collection
  attendance: {
    fields: {
      userId: 'string',
      date: 'timestamp',
      checkIn: 'timestamp',
      checkOut: 'timestamp',
      location: 'object',
      status: 'string', // present, absent, late, early
      workingHours: 'number',
      notes: 'string',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Leaves collection
  leaves: {
    fields: {
      userId: 'string',
      type: 'string',
      startDate: 'timestamp',
      endDate: 'timestamp',
      status: 'string', // pending, approved, rejected
      reason: 'string',
      approvedBy: 'string',
      approvedAt: 'timestamp',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Payroll collection
  payroll: {
    fields: {
      userId: 'string',
      month: 'string',
      year: 'string',
      baseSalary: 'number',
      allowances: 'array',
      deductions: 'array',
      netSalary: 'number',
      status: 'string', // pending, processed, paid
      paymentDate: 'timestamp',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Recruitment collection
  recruitment: {
    fields: {
      position: 'string',
      department: 'string',
      requirements: 'array',
      status: 'string', // open, closed
      applications: 'array',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Training collection
  training: {
    fields: {
      title: 'string',
      description: 'string',
      type: 'string',
      startDate: 'timestamp',
      endDate: 'timestamp',
      participants: 'array',
      status: 'string', // scheduled, ongoing, completed
      materials: 'array',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Performance collection
  performance: {
    fields: {
      userId: 'string',
      period: 'string',
      evaluator: 'string',
      criteria: 'array',
      ratings: 'object',
      comments: 'string',
      status: 'string', // draft, submitted, reviewed
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Documents collection
  documents: {
    fields: {
      userId: 'string',
      type: 'string',
      name: 'string',
      url: 'string',
      expiryDate: 'timestamp',
      status: 'string', // active, expired
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Projects collection
  projects: {
    fields: {
      name: 'string',
      description: 'string',
      startDate: 'timestamp',
      endDate: 'timestamp',
      status: 'string', // planning, active, completed
      team: 'array',
      tasks: 'array',
      budget: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Freelancers collection
  freelancers: {
    fields: {
      name: 'string',
      email: 'string',
      phone: 'string',
      skills: 'array',
      projects: 'array',
      paymentHistory: 'array',
      status: 'string', // active, inactive
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Checklists collection
  checklists: {
    fields: {
      title: 'string',
      type: 'string',
      items: 'array',
      assignedTo: 'string',
      status: 'string', // pending, completed
      attachments: 'array',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Settings collection
  settings: {
    fields: {
      company: 'object',
      attendance: 'object',
      leave: 'object',
      payroll: 'object',
      notifications: 'object',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  }
};

// Function to initialize database with schema
export const initializeDatabaseSchema = async (db) => {
  try {
    // Create collections with schema
    for (const [collectionName, schema] of Object.entries(databaseSchema)) {
      const collectionRef = collection(db, collectionName);
      await setDoc(doc(collectionRef, 'schema'), {
        ...schema,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return false;
  }
}; 