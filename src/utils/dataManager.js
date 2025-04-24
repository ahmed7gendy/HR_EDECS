import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  writeBatch,
  doc,
  setDoc
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Data manager class
export class DataManager {
  // Export data to Excel
  static async exportToExcel(collectionName, filters = {}) {
    try {
      let dataQuery = collection(db, collectionName);
      
      // Apply filters
      if (Object.keys(filters).length > 0) {
        dataQuery = query(dataQuery, where(filters));
      }

      // Get data
      const snapshot = await getDocs(dataQuery);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, collectionName);

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `${collectionName}_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data from Excel
  static async importFromExcel(file, collectionName) {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Prepare batch write
            const batch = writeBatch(db);
            
            // Add documents to batch
            for (const item of jsonData) {
              const { id, ...data } = item;
              const docRef = doc(collection(db, collectionName), id || undefined);
              batch.set(docRef, {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }

            // Commit batch
            await batch.commit();
            resolve(true);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Export employee data
  static async exportEmployeeData(filters = {}) {
    try {
      const employeesQuery = query(
        collection(db, 'users'),
        where('role', '!=', 'admin'),
        ...Object.entries(filters).map(([key, value]) => where(key, '==', value))
      );

      const snapshot = await getDocs(employeesQuery);
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(employees);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `employees_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting employee data:', error);
      throw error;
    }
  }

  // Export attendance data
  static async exportAttendanceData(filters = {}) {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        ...Object.entries(filters).map(([key, value]) => where(key, '==', value)),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(attendanceQuery);
      const attendance = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(attendance);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `attendance_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      throw error;
    }
  }

  // Export payroll data
  static async exportPayrollData(filters = {}) {
    try {
      const payrollQuery = query(
        collection(db, 'payroll'),
        ...Object.entries(filters).map(([key, value]) => where(key, '==', value)),
        orderBy('month', 'desc')
      );

      const snapshot = await getDocs(payrollQuery);
      const payroll = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(payroll);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `payroll_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting payroll data:', error);
      throw error;
    }
  }

  // Export leave data
  static async exportLeaveData(filters = {}) {
    try {
      const leaveQuery = query(
        collection(db, 'leaves'),
        ...Object.entries(filters).map(([key, value]) => where(key, '==', value)),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(leaveQuery);
      const leaves = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(leaves);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Leaves');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `leaves_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting leave data:', error);
      throw error;
    }
  }

  // Export performance data
  static async exportPerformanceData(filters = {}) {
    try {
      const performanceQuery = query(
        collection(db, 'performance'),
        ...Object.entries(filters).map(([key, value]) => where(key, '==', value)),
        orderBy('period', 'desc')
      );

      const snapshot = await getDocs(performanceQuery);
      const performance = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(performance);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Performance');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save file
      saveAs(dataBlob, `performance_export_${new Date().toISOString()}.xlsx`);

      return true;
    } catch (error) {
      console.error('Error exporting performance data:', error);
      throw error;
    }
  }
} 