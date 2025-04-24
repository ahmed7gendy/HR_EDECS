import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Initial admin user data
const ADMIN_DATA = {
  email: 'admin@edecs.com',
  password: 'admin123456', // You should change this immediately after first login
  displayName: 'System Admin',
  role: 'admin'
};

// Basic data structure
const INITIAL_DATA_STRUCTURE = {
  departments: [
    { id: 'hr', name: 'Human Resources', description: 'HR Department' },
    { id: 'it', name: 'Information Technology', description: 'IT Department' },
    { id: 'finance', name: 'Finance', description: 'Finance Department' }
  ],
  employmentTypes: [
    { id: 'full-time', name: 'Full Time' },
    { id: 'part-time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' },
    { id: 'intern', name: 'Intern' }
  ],
  leaveTypes: [
    { id: 'annual', name: 'Annual Leave', defaultDays: 21 },
    { id: 'sick', name: 'Sick Leave', defaultDays: 14 },
    { id: 'maternity', name: 'Maternity Leave', defaultDays: 90 },
    { id: 'paternity', name: 'Paternity Leave', defaultDays: 14 }
  ],
  documentCategories: [
    { id: 'personal', name: 'Personal Documents' },
    { id: 'employment', name: 'Employment Documents' },
    { id: 'financial', name: 'Financial Documents' },
    { id: 'training', name: 'Training Certificates' }
  ],
  roles: [
    { id: 'admin', name: 'Administrator', level: 1 },
    { id: 'hr_manager', name: 'HR Manager', level: 2 },
    { id: 'department_head', name: 'Department Head', level: 3 },
    { id: 'employee', name: 'Employee', level: 4 }
  ],
  permissions: {
    admin: ['*'],
    hr_manager: [
      'manage_employees',
      'manage_attendance',
      'manage_leaves',
      'manage_payroll',
      'view_reports'
    ],
    department_head: [
      'view_department_employees',
      'manage_department_attendance',
      'approve_department_leaves',
      'view_department_reports'
    ],
    employee: [
      'view_profile',
      'submit_attendance',
      'request_leave',
      'view_payslips'
    ]
  }
};

export const initializeDatabase = async () => {
  try {
    // Check if admin already exists
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      console.log('Admin already exists');
      return;
    }

    // Create admin user
    const adminCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_DATA.email,
      ADMIN_DATA.password
    );

    // Update admin profile
    await updateProfile(adminCredential.user, {
      displayName: ADMIN_DATA.displayName
    });

    // Create admin document in users collection
    await setDoc(doc(db, 'users', adminCredential.user.uid), {
      email: ADMIN_DATA.email,
      displayName: ADMIN_DATA.displayName,
      role: ADMIN_DATA.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Initialize basic data structure
    for (const [collection, items] of Object.entries(INITIAL_DATA_STRUCTURE)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          await setDoc(doc(db, collection, item.id), {
            ...item,
            createdBy: adminCredential.user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } else {
        await setDoc(doc(db, collection, 'default'), {
          ...items,
          createdBy: adminCredential.user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }

    // Create settings collection with default company settings
    await setDoc(doc(db, 'settings', 'company'), {
      name: 'EDECS Business',
      email: 'contact@edecs.com',
      phone: '',
      address: '',
      logo: '',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      createdBy: adminCredential.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Database initialized successfully');
    return adminCredential.user;

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Function to check if database is initialized
export const isDatabaseInitialized = async () => {
  try {
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    return !adminSnapshot.empty;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
}; 