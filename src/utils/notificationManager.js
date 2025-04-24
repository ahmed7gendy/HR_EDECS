import { db } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

// Notification types
export const NotificationTypes = {
  LEAVE_REQUEST: 'leave_request',
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  DOCUMENT_EXPIRY: 'document_expiry',
  PERFORMANCE_REVIEW: 'performance_review',
  PAYROLL_PROCESSED: 'payroll_processed',
  ATTENDANCE_ANOMALY: 'attendance_anomaly',
  PROJECT_ASSIGNMENT: 'project_assignment',
  TRAINING_SCHEDULED: 'training_scheduled',
  CHECKLIST_ASSIGNED: 'checklist_assigned',
  SYSTEM_ALERT: 'system_alert'
};

// Notification manager class
export class NotificationManager {
  // Create a new notification
  static async createNotification({
    type,
    userId,
    title,
    message,
    data = {},
    priority = 'normal'
  }) {
    try {
      const notification = {
        type,
        userId,
        title,
        message,
        data,
        priority,
        isRead: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 50) {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId) {
    try {
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(unreadQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(unreadQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create leave request notification
  static async createLeaveRequestNotification(leaveData) {
    return this.createNotification({
      type: NotificationTypes.LEAVE_REQUEST,
      userId: leaveData.approverId,
      title: 'New Leave Request',
      message: `${leaveData.employeeName} has requested ${leaveData.type} leave`,
      data: leaveData,
      priority: 'high'
    });
  }

  // Create document expiry notification
  static async createDocumentExpiryNotification(documentData) {
    return this.createNotification({
      type: NotificationTypes.DOCUMENT_EXPIRY,
      userId: documentData.userId,
      title: 'Document Expiry Alert',
      message: `Your ${documentData.type} document will expire on ${documentData.expiryDate}`,
      data: documentData,
      priority: 'high'
    });
  }

  // Create performance review notification
  static async createPerformanceReviewNotification(performanceData) {
    return this.createNotification({
      type: NotificationTypes.PERFORMANCE_REVIEW,
      userId: performanceData.userId,
      title: 'Performance Review Due',
      message: `Your performance review for ${performanceData.period} is due`,
      data: performanceData,
      priority: 'normal'
    });
  }

  // Create payroll processed notification
  static async createPayrollProcessedNotification(payrollData) {
    return this.createNotification({
      type: NotificationTypes.PAYROLL_PROCESSED,
      userId: payrollData.userId,
      title: 'Payroll Processed',
      message: `Your salary for ${payrollData.month}/${payrollData.year} has been processed`,
      data: payrollData,
      priority: 'normal'
    });
  }

  // Create attendance anomaly notification
  static async createAttendanceAnomalyNotification(attendanceData) {
    return this.createNotification({
      type: NotificationTypes.ATTENDANCE_ANOMALY,
      userId: attendanceData.userId,
      title: 'Attendance Anomaly Detected',
      message: `Anomaly detected in your attendance on ${attendanceData.date}`,
      data: attendanceData,
      priority: 'high'
    });
  }

  // Create project assignment notification
  static async createProjectAssignmentNotification(projectData) {
    return this.createNotification({
      type: NotificationTypes.PROJECT_ASSIGNMENT,
      userId: projectData.userId,
      title: 'New Project Assignment',
      message: `You have been assigned to project: ${projectData.projectName}`,
      data: projectData,
      priority: 'normal'
    });
  }

  // Create training scheduled notification
  static async createTrainingScheduledNotification(trainingData) {
    return this.createNotification({
      type: NotificationTypes.TRAINING_SCHEDULED,
      userId: trainingData.userId,
      title: 'Training Scheduled',
      message: `You have been scheduled for training: ${trainingData.title}`,
      data: trainingData,
      priority: 'normal'
    });
  }

  // Create checklist assigned notification
  static async createChecklistAssignedNotification(checklistData) {
    return this.createNotification({
      type: NotificationTypes.CHECKLIST_ASSIGNED,
      userId: checklistData.userId,
      title: 'New Checklist Assigned',
      message: `You have been assigned a new checklist: ${checklistData.title}`,
      data: checklistData,
      priority: 'normal'
    });
  }
} 