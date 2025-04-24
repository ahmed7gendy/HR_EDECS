// Employee data model and type definitions
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
  deleteDoc 
} from 'firebase/firestore';

/**
 * @typedef {Object} Employee
 * @property {string} id - Employee ID
 * @property {string} userId - Reference to user account
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} address - Physical address
 * @property {string} departmentId - Reference to department
 * @property {string} position - Job position/title
 * @property {string} employmentType - Full-time/Part-time/Contract
 * @property {string} status - Active/Inactive/On Leave
 * @property {Date} joinDate - Start date
 * @property {number} salary - Base salary
 * @property {Object} benefits - Benefits package
 * @property {string} managerId - Reference to direct manager
 * @property {string[]} subordinateIds - References to direct reports
 * @property {Object} schedule - Working schedule
 * @property {Object} documents - Related documents
 * @property {Object} skills - Skill set and ratings
 * @property {Object} certifications - Professional certifications
 * @property {Object} emergencyContact - Emergency contact info
 */

class EmployeeModel {
  static collection = 'employees';

  static async getById(id) {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  static async getByDepartment(departmentId) {
    const q = query(collection(db, this.collection), where('departmentId', '==', departmentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getByManager(managerId) {
    const q = query(collection(db, this.collection), where('managerId', '==', managerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async create(data) {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async update(id, data) {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  static async delete(id) {
    const docRef = doc(db, this.collection, id);
    await deleteDoc(docRef);
  }

  static async getSubordinates(managerId) {
    return this.getByManager(managerId);
  }

  static async updateStatus(id, status) {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date()
    });
  }
}

export default EmployeeModel; 