// Leave data model and type definitions
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';

/**
 * @typedef {Object} LeaveRequest
 * @property {string} id - Request ID
 * @property {string} employeeId - Reference to employee
 * @property {string} type - Leave type (annual, sick, etc.)
 * @property {Date} startDate - Start date
 * @property {Date} endDate - End date
 * @property {number} duration - Number of days
 * @property {string} status - Request status (pending, approved, rejected)
 * @property {string} reason - Leave reason
 * @property {string} approverId - Reference to approver
 * @property {string} comments - Approver comments
 * @property {Object} attachments - Supporting documents
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} LeaveBalance
 * @property {string} id - Balance ID
 * @property {string} employeeId - Reference to employee
 * @property {string} type - Leave type
 * @property {number} entitled - Total entitled days
 * @property {number} taken - Days taken
 * @property {number} remaining - Remaining days
 * @property {number} carryOver - Days carried over
 * @property {string} period - Year period
 */

class LeaveModel {
  static collection = 'leaves';
  static balanceCollection = 'leaveBalances';

  static async getEmployeeLeaves(employeeId, status = null) {
    let q = query(collection(db, this.collection), where('employeeId', '==', employeeId));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getLeaveBalance(employeeId, type, period) {
    const q = query(
      collection(db, this.balanceCollection),
      where('employeeId', '==', employeeId),
      where('type', '==', type),
      where('period', '==', period)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 
      ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
      : null;
  }

  static async requestLeave(data) {
    // Check leave balance
    const balance = await this.getLeaveBalance(
      data.employeeId,
      data.type,
      new Date().getFullYear().toString()
    );

    if (!balance || balance.remaining < data.duration) {
      throw new Error('Insufficient leave balance');
    }

    // Create leave request
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  }

  static async approveLeave(id, approverId, comments = '') {
    const docRef = doc(db, this.collection, id);
    const leaveDoc = await getDoc(docRef);
    
    if (!leaveDoc.exists()) {
      throw new Error('Leave request not found');
    }

    const leaveData = leaveDoc.data();
    
    // Update leave request
    await updateDoc(docRef, {
      status: 'approved',
      approverId,
      comments,
      updatedAt: Timestamp.now()
    });

    // Update leave balance
    await this.updateLeaveBalance(
      leaveData.employeeId,
      leaveData.type,
      leaveData.duration
    );
  }

  static async rejectLeave(id, approverId, comments = '') {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, {
      status: 'rejected',
      approverId,
      comments,
      updatedAt: Timestamp.now()
    });
  }

  static async cancelLeave(id) {
    const docRef = doc(db, this.collection, id);
    const leaveDoc = await getDoc(docRef);
    
    if (!leaveDoc.exists()) {
      throw new Error('Leave request not found');
    }

    const leaveData = leaveDoc.data();
    if (leaveData.status === 'approved') {
      // Restore leave balance
      await this.updateLeaveBalance(
        leaveData.employeeId,
        leaveData.type,
        -leaveData.duration
      );
    }

    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
  }

  static async updateLeaveBalance(employeeId, type, durationUsed) {
    const period = new Date().getFullYear().toString();
    const balance = await this.getLeaveBalance(employeeId, type, period);
    
    if (!balance) {
      throw new Error('Leave balance not found');
    }

    const docRef = doc(db, this.balanceCollection, balance.id);
    await updateDoc(docRef, {
      taken: balance.taken + durationUsed,
      remaining: balance.remaining - durationUsed,
      updatedAt: Timestamp.now()
    });
  }

  static async initializeLeaveBalance(employeeId, type, entitled, period) {
    const docRef = await addDoc(collection(db, this.balanceCollection), {
      employeeId,
      type,
      entitled,
      taken: 0,
      remaining: entitled,
      carryOver: 0,
      period,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async carryOverBalance(employeeId, type, fromPeriod, toPeriod, days) {
    // Get current balance
    const currentBalance = await this.getLeaveBalance(employeeId, type, fromPeriod);
    if (!currentBalance) {
      throw new Error('Current leave balance not found');
    }

    // Get or create new period balance
    let newBalance = await this.getLeaveBalance(employeeId, type, toPeriod);
    if (!newBalance) {
      const id = await this.initializeLeaveBalance(
        employeeId,
        type,
        currentBalance.entitled,
        toPeriod
      );
      newBalance = await this.getLeaveBalance(employeeId, type, toPeriod);
    }

    // Update new balance with carry over
    const docRef = doc(db, this.balanceCollection, newBalance.id);
    await updateDoc(docRef, {
      carryOver: days,
      remaining: newBalance.remaining + days,
      updatedAt: Timestamp.now()
    });
  }
}

export default LeaveModel; 