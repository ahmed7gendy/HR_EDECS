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

// Attendance manager class
export class AttendanceManager {
  // Record check-in
  static async recordCheckIn(userId, location = null) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if already checked in today
      const existingCheckIn = await this.getTodayAttendance(userId);
      if (existingCheckIn) throw new Error('Already checked in today');

      // Get user's working hours
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');

      const userData = userDoc.data();
      const workingHours = userData.workingHours || { start: '09:00', end: '17:00' };

      // Calculate status
      const checkInTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(workingHours.start.split(':')[0]) * 60 + 
                       parseInt(workingHours.start.split(':')[1]);
      const status = checkInTime > startTime ? 'late' : 'present';

      // Create attendance record
      const attendanceData = {
        userId,
        date: today,
        checkIn: now,
        location,
        status,
        workingHours: 0,
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'attendance'), attendanceData);

      // Create notification for late check-in
      if (status === 'late') {
        await NotificationManager.createAttendanceAnomalyNotification({
          ...attendanceData,
          id: docRef.id,
          type: 'late_checkin'
        });
      }

      return { id: docRef.id, ...attendanceData };
    } catch (error) {
      console.error('Error recording check-in:', error);
      throw error;
    }
  }

  // Record check-out
  static async recordCheckOut(userId) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Get today's attendance
      const attendance = await this.getTodayAttendance(userId);
      if (!attendance) throw new Error('No check-in record found for today');

      // Get user's working hours
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');

      const userData = userDoc.data();
      const workingHours = userData.workingHours || { start: '09:00', end: '17:00' };

      // Calculate working hours
      const checkInTime = new Date(attendance.checkIn.seconds * 1000);
      const checkOutTime = now;
      const workingHoursDiff = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      // Calculate status
      const checkOutTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const endTime = parseInt(workingHours.end.split(':')[0]) * 60 + 
                     parseInt(workingHours.end.split(':')[1]);
      const status = checkOutTimeMinutes < endTime ? 'early' : attendance.status;

      // Update attendance record
      const attendanceRef = doc(db, 'attendance', attendance.id);
      await updateDoc(attendanceRef, {
        checkOut: now,
        workingHours: workingHoursDiff,
        status,
        updatedAt: serverTimestamp()
      });

      // Create notification for early check-out
      if (status === 'early') {
        await NotificationManager.createAttendanceAnomalyNotification({
          ...attendance,
          id: attendance.id,
          type: 'early_checkout'
        });
      }

      return { id: attendance.id, ...attendance, checkOut: now, workingHours: workingHoursDiff, status };
    } catch (error) {
      console.error('Error recording check-out:', error);
      throw error;
    }
  }

  // Get today's attendance
  static async getTodayAttendance(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('date', '==', today)
      );
      const snapshot = await getDocs(attendanceQuery);
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('Error getting today\'s attendance:', error);
      throw error;
    }
  }

  // Get user attendance history
  static async getUserAttendanceHistory(userId, startDate, endDate) {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const snapshot = await getDocs(attendanceQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user attendance history:', error);
      throw error;
    }
  }

  // Get department attendance
  static async getDepartmentAttendance(departmentId, date) {
    try {
      // Get department employees
      const employeesQuery = query(
        collection(db, 'users'),
        where('department', '==', departmentId)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeeIds = employeesSnapshot.docs.map(doc => doc.id);

      // Get attendance records
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', 'in', employeeIds),
        where('date', '==', date)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      return attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting department attendance:', error);
      throw error;
    }
  }

  // Get attendance statistics
  static async getAttendanceStatistics(userId, startDate, endDate) {
    try {
      const attendance = await this.getUserAttendanceHistory(userId, startDate, endDate);
      
      const statistics = {
        totalDays: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        late: attendance.filter(a => a.status === 'late').length,
        early: attendance.filter(a => a.status === 'early').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0)
      };

      return statistics;
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      throw error;
    }
  }

  // Update attendance record
  static async updateAttendanceRecord(attendanceId, updates) {
    try {
      const attendanceRef = doc(db, 'attendance', attendanceId);
      await updateDoc(attendanceRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  }
} 