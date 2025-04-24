// Department data model and type definitions
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
 * @typedef {Object} Department
 * @property {string} id - Department ID
 * @property {string} name - Department name
 * @property {string} code - Department code
 * @property {string} description - Department description
 * @property {string} managerId - Reference to department manager
 * @property {string[]} employeeIds - References to department employees
 * @property {Object} budget - Department budget details
 * @property {Object} goals - Department goals and KPIs
 * @property {boolean} isActive - Department status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

class DepartmentModel {
  static collection = 'departments';

  static async getAll() {
    const querySnapshot = await getDocs(collection(db, this.collection));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  static async getByManager(managerId) {
    const q = query(collection(db, this.collection), where('managerId', '==', managerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async create(data) {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      isActive: true,
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

  static async addEmployee(departmentId, employeeId) {
    const docRef = doc(db, this.collection, departmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const employeeIds = data.employeeIds || [];
      if (!employeeIds.includes(employeeId)) {
        await updateDoc(docRef, {
          employeeIds: [...employeeIds, employeeId],
          updatedAt: new Date()
        });
      }
    }
  }

  static async removeEmployee(departmentId, employeeId) {
    const docRef = doc(db, this.collection, departmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const employeeIds = data.employeeIds || [];
      await updateDoc(docRef, {
        employeeIds: employeeIds.filter(id => id !== employeeId),
        updatedAt: new Date()
      });
    }
  }

  static async setManager(departmentId, managerId) {
    const docRef = doc(db, this.collection, departmentId);
    await updateDoc(docRef, {
      managerId,
      updatedAt: new Date()
    });
  }
}

export default DepartmentModel; 