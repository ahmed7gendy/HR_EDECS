import { db } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { NotificationManager } from './notificationManager';

// Leave manager class
export class LeaveManager {
  // Request leave
  static async requestLeave(leaveData) {
    try {
      // Validate leave dates
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      if (startDate > endDate) throw new Error('Start date cannot be after end date');

      // Get user's leave balance
      const userDoc = await getDoc(doc(db, 'users', leaveData.userId));
      if (!userDoc.exists()) throw new Error('User not found');

      const userData = userDoc.data();
      const leaveBalance = userData.leaveBalance || {};

      // Check if user has enough leave balance
      if (leaveBalance[leaveData.type] < this.calculateLeaveDays(startDate, endDate)) {
        throw new Error('Insufficient leave balance');
      }

      // Create leave request
      const requestData = {
        ...leaveData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'leaves'), requestData);

      // Create notification for approver
      await NotificationManager.createLeaveRequestNotification({
        ...requestData,
        id: docRef.id,
        employeeName: userData.displayName
      });

      return { id: docRef.id, ...requestData };
    } catch (error) {
      console.error('Error requesting leave:', error);
      throw error;
    }
  }

  // Approve leave request
  static async approveLeave(leaveId, approverId) {
    try {
      const leaveRef = doc(db, 'leaves', leaveId);
      const leaveDoc = await getDoc(leaveRef);
      
      if (!leaveDoc.exists()) throw new Error('Leave request not found');
      const leaveData = leaveDoc.data();

      if (leaveData.status !== 'pending') throw new Error('Leave request is not pending');

      // Update leave request
      await updateDoc(leaveRef, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user's leave balance
      const userRef = doc(db, 'users', leaveData.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const leaveBalance = userData.leaveBalance || {};
      const leaveDays = this.calculateLeaveDays(
        new Date(leaveData.startDate.seconds * 1000),
        new Date(leaveData.endDate.seconds * 1000)
      );

      leaveBalance[leaveData.type] = (leaveBalance[leaveData.type] || 0) - leaveDays;

      await updateDoc(userRef, { leaveBalance });

      // Create notification for employee
      await NotificationManager.createNotification({
        type: 'leave_approved',
        userId: leaveData.userId,
        title: 'Leave Request Approved',
        message: `Your ${leaveData.type} leave request has been approved`,
        data: { ...leaveData, id: leaveId }
      });

      return true;
    } catch (error) {
      console.error('Error approving leave:', error);
      throw error;
    }
  }

  // Reject leave request
  static async rejectLeave(leaveId, approverId, reason) {
    try {
      const leaveRef = doc(db, 'leaves', leaveId);
      const leaveDoc = await getDoc(leaveRef);
      
      if (!leaveDoc.exists()) throw new Error('Leave request not found');
      const leaveData = leaveDoc.data();

      if (leaveData.status !== 'pending') throw new Error('Leave request is not pending');

      // Update leave request
      await updateDoc(leaveRef, {
        status: 'rejected',
        approvedBy: approverId,
        approvedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      // Create notification for employee
      await NotificationManager.createNotification({
        type: 'leave_rejected',
        userId: leaveData.userId,
        title: 'Leave Request Rejected',
        message: `Your ${leaveData.type} leave request has been rejected`,
        data: { ...leaveData, id: leaveId, reason }
      });

      return true;
    } catch (error) {
      console.error('Error rejecting leave:', error);
      throw error;
    }
  }

  // Get user's leave requests
  static async getUserLeaveRequests(userId) {
    try {
      const leavesQuery = query(
        collection(db, 'leaves'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(leavesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user leave requests:', error);
      throw error;
    }
  }

  // Get pending leave requests
  static async getPendingLeaveRequests(approverId) {
    try {
      const leavesQuery = query(
        collection(db, 'leaves'),
        where('approverId', '==', approverId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(leavesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending leave requests:', error);
      throw error;
    }
  }

  // Get leave balance
  static async getLeaveBalance(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');

      const userData = userDoc.data();
      return userData.leaveBalance || {};
    } catch (error) {
      console.error('Error getting leave balance:', error);
      throw error;
    }
  }

  // Calculate leave days
  static calculateLeaveDays(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }

  // Get leave statistics
  static async getLeaveStatistics(userId, year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const leavesQuery = query(
        collection(db, 'leaves'),
        where('userId', '==', userId),
        where('startDate', '>=', startDate),
        where('endDate', '<=', endDate)
      );
      const snapshot = await getDocs(leavesQuery);
      const leaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const statistics = {
        total: leaves.length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        pending: leaves.filter(l => l.status === 'pending').length,
        byType: {}
      };

      // Calculate statistics by leave type
      leaves.forEach(leave => {
        if (!statistics.byType[leave.type]) {
          statistics.byType[leave.type] = {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
          };
        }

        statistics.byType[leave.type].total++;
        statistics.byType[leave.type][leave.status]++;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting leave statistics:', error);
      throw error;
    }
  }
} 