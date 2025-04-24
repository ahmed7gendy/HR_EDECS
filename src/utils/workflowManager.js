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

// Workflow manager class
export class WorkflowManager {
  // Create workflow
  static async createWorkflow(workflowData) {
    try {
      const workflow = {
        ...workflowData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'workflows'), workflow);
      return { id: docRef.id, ...workflow };
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  // Get workflow by ID
  static async getWorkflow(workflowId) {
    try {
      const docRef = doc(db, 'workflows', workflowId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Workflow not found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting workflow:', error);
      throw error;
    }
  }

  // Get workflows by type
  static async getWorkflowsByType(type) {
    try {
      const workflowsQuery = query(
        collection(db, 'workflows'),
        where('type', '==', type),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(workflowsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting workflows by type:', error);
      throw error;
    }
  }

  // Update workflow
  static async updateWorkflow(workflowId, updates) {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  // Delete workflow
  static async deleteWorkflow(workflowId) {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  // Get workflow steps
  static async getWorkflowSteps(workflowId) {
    try {
      const stepsQuery = query(
        collection(db, 'workflowSteps'),
        where('workflowId', '==', workflowId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(stepsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting workflow steps:', error);
      throw error;
    }
  }

  // Add workflow step
  static async addWorkflowStep(stepData) {
    try {
      const step = {
        ...stepData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'workflowSteps'), step);
      return { id: docRef.id, ...step };
    } catch (error) {
      console.error('Error adding workflow step:', error);
      throw error;
    }
  }

  // Update workflow step
  static async updateWorkflowStep(stepId, updates) {
    try {
      const stepRef = doc(db, 'workflowSteps', stepId);
      await updateDoc(stepRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }
  }

  // Delete workflow step
  static async deleteWorkflowStep(stepId) {
    try {
      const stepRef = doc(db, 'workflowSteps', stepId);
      await updateDoc(stepRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting workflow step:', error);
      throw error;
    }
  }

  // Get workflow approvals
  static async getWorkflowApprovals(workflowId) {
    try {
      const approvalsQuery = query(
        collection(db, 'workflowApprovals'),
        where('workflowId', '==', workflowId)
      );
      const snapshot = await getDocs(approvalsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting workflow approvals:', error);
      throw error;
    }
  }

  // Add workflow approval
  static async addWorkflowApproval(approvalData) {
    try {
      const approval = {
        ...approvalData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'workflowApprovals'), approval);

      // Create notification for approver
      await NotificationManager.createNotification({
        type: 'workflow_approval',
        userId: approvalData.approverId,
        title: 'Workflow Approval Required',
        message: `You have a new ${approvalData.type} approval request`,
        data: { ...approval, id: docRef.id }
      });

      return { id: docRef.id, ...approval };
    } catch (error) {
      console.error('Error adding workflow approval:', error);
      throw error;
    }
  }

  // Update workflow approval
  static async updateWorkflowApproval(approvalId, updates) {
    try {
      const approvalRef = doc(db, 'workflowApprovals', approvalId);
      await updateDoc(approvalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Create notification for requester
      const approval = await this.getWorkflowApproval(approvalId);
      await NotificationManager.createNotification({
        type: 'workflow_approval_updated',
        userId: approval.requesterId,
        title: 'Workflow Approval Updated',
        message: `Your ${approval.type} approval request has been ${updates.status}`,
        data: { ...approval, ...updates }
      });

      return true;
    } catch (error) {
      console.error('Error updating workflow approval:', error);
      throw error;
    }
  }

  // Get workflow approval
  static async getWorkflowApproval(approvalId) {
    try {
      const docRef = doc(db, 'workflowApprovals', approvalId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Workflow approval not found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting workflow approval:', error);
      throw error;
    }
  }
} 