import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const activityTypes = {
  USER: 'user',
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  RECRUITMENT: 'recruitment',
  PROJECT: 'project',
  TRAINING: 'training',
  PERFORMANCE: 'performance',
  DOCUMENT: 'document',
  FREELANCER: 'freelancer',
  CHECKLIST: 'checklist',
  REPORT: 'report'
};

const activityActions = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  ASSIGN: 'assign',
  COMPLETE: 'complete',
  SUBMIT: 'submit',
  REVIEW: 'review'
};

export async function logActivity({
  userId,
  type,
  action,
  title,
  description,
  relatedId = null,
  metadata = {}
}) {
  try {
    const activityData = {
      userId,
      type,
      action,
      title,
      description,
      relatedId,
      metadata,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, 'activities'), activityData);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export { activityTypes, activityActions }; 