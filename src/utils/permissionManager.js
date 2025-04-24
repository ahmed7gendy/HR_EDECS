import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

// Permission types
export const PermissionTypes = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',

  // Department management
  MANAGE_DEPARTMENTS: 'manage_departments',
  VIEW_DEPARTMENTS: 'view_departments',
  EDIT_DEPARTMENT: 'edit_department',
  DELETE_DEPARTMENT: 'delete_department',

  // Attendance management
  MANAGE_ATTENDANCE: 'manage_attendance',
  VIEW_ATTENDANCE: 'view_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',
  DELETE_ATTENDANCE: 'delete_attendance',

  // Leave management
  MANAGE_LEAVES: 'manage_leaves',
  VIEW_LEAVES: 'view_leaves',
  APPROVE_LEAVE: 'approve_leave',
  REJECT_LEAVE: 'reject_leave',

  // Payroll management
  MANAGE_PAYROLL: 'manage_payroll',
  VIEW_PAYROLL: 'view_payroll',
  PROCESS_PAYROLL: 'process_payroll',
  GENERATE_PAYSLIP: 'generate_payslip',

  // Recruitment management
  MANAGE_RECRUITMENT: 'manage_recruitment',
  VIEW_RECRUITMENT: 'view_recruitment',
  POST_JOB: 'post_job',
  REVIEW_APPLICATIONS: 'review_applications',

  // Training management
  MANAGE_TRAINING: 'manage_training',
  VIEW_TRAINING: 'view_training',
  SCHEDULE_TRAINING: 'schedule_training',
  ASSIGN_TRAINING: 'assign_training',

  // Performance management
  MANAGE_PERFORMANCE: 'manage_performance',
  VIEW_PERFORMANCE: 'view_performance',
  CONDUCT_REVIEW: 'conduct_review',
  APPROVE_REVIEW: 'approve_review',

  // Document management
  MANAGE_DOCUMENTS: 'manage_documents',
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENT: 'upload_document',
  DELETE_DOCUMENT: 'delete_document',

  // Project management
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_PROJECTS: 'view_projects',
  ASSIGN_PROJECT: 'assign_project',
  UPDATE_PROJECT: 'update_project',

  // Freelancer management
  MANAGE_FREELANCERS: 'manage_freelancers',
  VIEW_FREELANCERS: 'view_freelancers',
  HIRE_FREELANCER: 'hire_freelancer',
  PAY_FREELANCER: 'pay_freelancer',

  // Checklist management
  MANAGE_CHECKLISTS: 'manage_checklists',
  VIEW_CHECKLISTS: 'view_checklists',
  ASSIGN_CHECKLIST: 'assign_checklist',
  UPDATE_CHECKLIST: 'update_checklist',

  // Settings management
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  UPDATE_SETTINGS: 'update_settings',

  // Reports management
  MANAGE_REPORTS: 'manage_reports',
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORT: 'generate_report',
  EXPORT_REPORT: 'export_report'
};

// Permission manager class
export class PermissionManager {
  // Check if user has permission
  static async hasPermission(userId, permission) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      const roleDoc = await getDoc(doc(db, 'roles', userData.role));
      if (!roleDoc.exists()) return false;

      const roleData = roleDoc.data();
      return roleData.permissions.includes(permission) || roleData.permissions.includes('*');
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user permissions
  static async getUserPermissions(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const roleDoc = await getDoc(doc(db, 'roles', userData.role));
      if (!roleDoc.exists()) return [];

      const roleData = roleDoc.data();
      return roleData.permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Get role permissions
  static async getRolePermissions(roleId) {
    try {
      const roleDoc = await getDoc(doc(db, 'roles', roleId));
      if (!roleDoc.exists()) return [];

      const roleData = roleDoc.data();
      return roleData.permissions;
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }

  // Check if user has any of the given permissions
  static async hasAnyPermission(userId, permissions) {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.some(permission => 
        userPermissions.includes(permission) || userPermissions.includes('*')
      );
    } catch (error) {
      console.error('Error checking any permission:', error);
      return false;
    }
  }

  // Check if user has all of the given permissions
  static async hasAllPermissions(userId, permissions) {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.every(permission => 
        userPermissions.includes(permission) || userPermissions.includes('*')
      );
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }

  // Get users with specific permission
  static async getUsersWithPermission(permission) {
    try {
      const rolesQuery = query(
        collection(db, 'roles'),
        where('permissions', 'array-contains', permission)
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      const roleIds = rolesSnapshot.docs.map(doc => doc.id);

      const usersQuery = query(
        collection(db, 'users'),
        where('role', 'in', roleIds)
      );
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting users with permission:', error);
      return [];
    }
  }

  // Get users with any of the given permissions
  static async getUsersWithAnyPermission(permissions) {
    try {
      const rolesQuery = query(
        collection(db, 'roles'),
        where('permissions', 'array-contains-any', permissions)
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      const roleIds = rolesSnapshot.docs.map(doc => doc.id);

      const usersQuery = query(
        collection(db, 'users'),
        where('role', 'in', roleIds)
      );
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting users with any permission:', error);
      return [];
    }
  }
} 