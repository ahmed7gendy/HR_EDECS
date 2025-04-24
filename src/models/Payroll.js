// Payroll data model and type definitions
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
 * @typedef {Object} PayrollRecord
 * @property {string} id - Record ID
 * @property {string} employeeId - Reference to employee
 * @property {string} period - Pay period (YYYY-MM)
 * @property {number} baseSalary - Base salary amount
 * @property {number} overtime - Overtime pay
 * @property {number} bonus - Bonus amount
 * @property {number} deductions - Total deductions
 * @property {Object} taxDetails - Tax breakdown
 * @property {Object} benefits - Benefits breakdown
 * @property {Object} allowances - Allowances breakdown
 * @property {number} netPay - Final pay amount
 * @property {string} status - Processing status
 * @property {Date} paymentDate - Date of payment
 * @property {string} paymentMethod - Method of payment
 * @property {string} bankAccount - Bank account details
 * @property {Object} metadata - Additional metadata
 */

class PayrollModel {
  static collection = 'payroll';

  static async getByEmployee(employeeId, period = null) {
    let q = query(collection(db, this.collection), where('employeeId', '==', employeeId));
    
    if (period) {
      q = query(q, where('period', '==', period));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getByPeriod(period) {
    const q = query(collection(db, this.collection), where('period', '==', period));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async create(data) {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async update(id, data) {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  static async delete(id) {
    const docRef = doc(db, this.collection, id);
    await deleteDoc(docRef);
  }

  static async processPayroll(employeeId, period, options = {}) {
    const {
      calculateOvertime = true,
      includeBonus = true,
      includeBenefits = true,
      calculateTax = true
    } = options;

    // Get employee details
    const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
    if (!employeeDoc.exists()) {
      throw new Error('Employee not found');
    }

    const employee = employeeDoc.data();
    let payrollData = {
      employeeId,
      period,
      baseSalary: employee.salary,
      overtime: 0,
      bonus: 0,
      deductions: 0,
      taxDetails: {},
      benefits: {},
      allowances: {},
      netPay: employee.salary
    };

    // Calculate overtime if needed
    if (calculateOvertime) {
      const overtimeHours = await this.calculateOvertimeHours(employeeId, period);
      payrollData.overtime = this.calculateOvertimePay(overtimeHours, employee.salary);
    }

    // Add bonus if applicable
    if (includeBonus) {
      payrollData.bonus = await this.calculateBonus(employeeId, period);
    }

    // Process benefits
    if (includeBenefits) {
      payrollData.benefits = await this.calculateBenefits(employeeId);
      payrollData.deductions += Object.values(payrollData.benefits)
        .reduce((total, benefit) => total + (benefit.employeeContribution || 0), 0);
    }

    // Calculate tax
    if (calculateTax) {
      payrollData.taxDetails = this.calculateTax(
        payrollData.baseSalary + 
        payrollData.overtime + 
        payrollData.bonus
      );
      payrollData.deductions += payrollData.taxDetails.totalTax;
    }

    // Calculate net pay
    payrollData.netPay = 
      payrollData.baseSalary + 
      payrollData.overtime + 
      payrollData.bonus - 
      payrollData.deductions;

    // Create payroll record
    return this.create(payrollData);
  }

  static calculateTax(grossIncome) {
    // Simplified tax calculation - should be replaced with actual tax rules
    const incomeTax = grossIncome * 0.2; // 20% income tax
    const socialSecurity = grossIncome * 0.1; // 10% social security
    
    return {
      incomeTax,
      socialSecurity,
      totalTax: incomeTax + socialSecurity
    };
  }

  static async calculateOvertimeHours(employeeId, period) {
    // Get attendance records and calculate overtime
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      where('period', '==', period)
    );
    
    const attendanceSnapshot = await getDocs(attendanceQuery);
    let totalOvertimeHours = 0;
    
    attendanceSnapshot.forEach(doc => {
      const attendance = doc.data();
      if (attendance.overtime) {
        totalOvertimeHours += attendance.overtime;
      }
    });
    
    return totalOvertimeHours;
  }

  static calculateOvertimePay(hours, baseSalary) {
    const hourlyRate = baseSalary / 160; // Assuming 160 working hours per month
    return hours * (hourlyRate * 1.5); // Overtime rate is 1.5x regular rate
  }

  static async calculateBonus(employeeId, period) {
    // Get performance metrics and calculate bonus
    const performanceQuery = query(
      collection(db, 'performance'),
      where('employeeId', '==', employeeId),
      where('period', '==', period)
    );
    
    const performanceSnapshot = await getDocs(performanceQuery);
    let bonus = 0;
    
    performanceSnapshot.forEach(doc => {
      const performance = doc.data();
      if (performance.rating >= 4) { // Bonus for high performers
        bonus += performance.bonus || 0;
      }
    });
    
    return bonus;
  }

  static async calculateBenefits(employeeId) {
    // Get employee benefits configuration
    const benefitsQuery = query(
      collection(db, 'benefits'),
      where('employeeId', '==', employeeId)
    );
    
    const benefitsSnapshot = await getDocs(benefitsQuery);
    const benefits = {};
    
    benefitsSnapshot.forEach(doc => {
      const benefit = doc.data();
      benefits[benefit.type] = {
        amount: benefit.amount,
        employerContribution: benefit.employerContribution,
        employeeContribution: benefit.employeeContribution
      };
    });
    
    return benefits;
  }
}

export default PayrollModel; 