import { db, storage } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { NotificationManager } from './notificationManager';

// Document manager class
export class DocumentManager {
  // Upload document
  static async uploadDocument(file, metadata) {
    try {
      // Upload file to storage
      const storageRef = ref(storage, `documents/${metadata.userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Create document record
      const documentData = {
        ...metadata,
        url: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'documents'), documentData);

      // Create notification for document expiry
      if (metadata.expiryDate) {
        await NotificationManager.createDocumentExpiryNotification({
          ...documentData,
          id: docRef.id
        });
      }

      return { id: docRef.id, ...documentData };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get document by ID
  static async getDocument(documentId) {
    try {
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Document not found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Get user documents
  static async getUserDocuments(userId) {
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(documentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  // Update document
  static async updateDocument(documentId, updates) {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete document
  static async deleteDocument(documentId) {
    try {
      const document = await this.getDocument(documentId);
      
      // Delete file from storage
      const storageRef = ref(storage, document.url);
      await deleteObject(storageRef);

      // Delete document record
      await deleteDoc(doc(db, 'documents', documentId));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Get expiring documents
  static async getExpiringDocuments(daysThreshold = 30) {
    try {
      const now = new Date();
      const thresholdDate = new Date(now.setDate(now.getDate() + daysThreshold));

      const documentsQuery = query(
        collection(db, 'documents'),
        where('status', '==', 'active'),
        where('expiryDate', '<=', thresholdDate)
      );
      const snapshot = await getDocs(documentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting expiring documents:', error);
      throw error;
    }
  }

  // Get document types
  static async getDocumentTypes() {
    try {
      const typesQuery = query(collection(db, 'documentTypes'));
      const snapshot = await getDocs(typesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting document types:', error);
      throw error;
    }
  }

  // Get document categories
  static async getDocumentCategories() {
    try {
      const categoriesQuery = query(collection(db, 'documentCategories'));
      const snapshot = await getDocs(categoriesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting document categories:', error);
      throw error;
    }
  }

  // Get documents by type
  static async getDocumentsByType(type) {
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        where('type', '==', type)
      );
      const snapshot = await getDocs(documentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting documents by type:', error);
      throw error;
    }
  }

  // Get documents by category
  static async getDocumentsByCategory(category) {
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        where('category', '==', category)
      );
      const snapshot = await getDocs(documentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting documents by category:', error);
      throw error;
    }
  }
} 