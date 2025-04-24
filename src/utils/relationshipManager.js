import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';

// Relationship manager for HR modules
export class RelationshipManager {
  // Get employee details with related data
  static async getEmployeeDetails(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('Employee not found');

      const userData = userDoc.data();

      // Get related data
      const [attendance, leaves, payroll, documents, performance] = await Promise.all([
        this.getEmployeeAttendance(userId),
        this.getEmployeeLeaves(userId),
        this.getEmployeePayroll(userId),
        this.getEmployeeDocuments(userId),
        this.getEmployeePerformance(userId)
      ]);

      return {
        ...userData,
        attendance,
        leaves,
        payroll,
        documents,
        performance
      };
    } catch (error) {
      console.error('Error getting employee details:', error);
      throw error;
    }
  }

  // Get employee attendance
  static async getEmployeeAttendance(userId) {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(attendanceQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employee attendance:', error);
      throw error;
    }
  }

  // Get employee leaves
  static async getEmployeeLeaves(userId) {
    try {
      const leavesQuery = query(
        collection(db, 'leaves'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(leavesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employee leaves:', error);
      throw error;
    }
  }

  // Get employee payroll
  static async getEmployeePayroll(userId) {
    try {
      const payrollQuery = query(
        collection(db, 'payroll'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(payrollQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employee payroll:', error);
      throw error;
    }
  }

  // Get employee documents
  static async getEmployeeDocuments(userId) {
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(documentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employee documents:', error);
      throw error;
    }
  }

  // Get employee performance
  static async getEmployeePerformance(userId) {
    try {
      const performanceQuery = query(
        collection(db, 'performance'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(performanceQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employee performance:', error);
      throw error;
    }
  }

  // Get project details with team members
  static async getProjectDetails(projectId) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) throw new Error('Project not found');

      const projectData = projectDoc.data();

      // Get team members details
      const teamMembers = await Promise.all(
        projectData.team.map(async (memberId) => {
          const memberDoc = await getDoc(doc(db, 'users', memberId));
          return memberDoc.exists() ? { id: memberId, ...memberDoc.data() } : null;
        })
      );

      return {
        ...projectData,
        team: teamMembers.filter(member => member !== null)
      };
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  }

  // Get department details with employees
  static async getDepartmentDetails(departmentId) {
    try {
      const departmentDoc = await getDoc(doc(db, 'departments', departmentId));
      if (!departmentDoc.exists()) throw new Error('Department not found');

      const departmentData = departmentDoc.data();

      // Get department employees
      const employeesQuery = query(
        collection(db, 'users'),
        where('department', '==', departmentId)
      );
      const snapshot = await getDocs(employeesQuery);
      const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        ...departmentData,
        employees
      };
    } catch (error) {
      console.error('Error getting department details:', error);
      throw error;
    }
  }

  // Update employee status and related data
  static async updateEmployeeStatus(userId, newStatus) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });

      // Update related collections based on status
      if (newStatus === 'terminated') {
        // Update projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('team', 'array-contains', userId)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          const updatedTeam = projectData.team.filter(id => id !== userId);
          await updateDoc(doc(db, 'projects', projectDoc.id), { team: updatedTeam });
        }

        // Update checklists
        const checklistsQuery = query(
          collection(db, 'checklists'),
          where('assignedTo', '==', userId)
        );
        const checklistsSnapshot = await getDocs(checklistsQuery);
        
        for (const checklistDoc of checklistsSnapshot.docs) {
          await updateDoc(doc(db, 'checklists', checklistDoc.id), { 
            status: 'pending',
            assignedTo: null
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating employee status:', error);
      throw error;
    }
  }
} 