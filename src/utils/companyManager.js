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

// Company manager class
export class CompanyManager {
  // Create company
  static async createCompany(companyData) {
    try {
      const company = {
        ...companyData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'companies'), company);
      return { id: docRef.id, ...company };
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Get company by ID
  static async getCompany(companyId) {
    try {
      const docRef = doc(db, 'companies', companyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Company not found');
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  }

  // Update company
  static async updateCompany(companyId, updates) {
    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Delete company
  static async deleteCompany(companyId) {
    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Get company settings
  static async getCompanySettings(companyId) {
    try {
      const settingsRef = doc(db, 'companySettings', companyId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (!settingsSnap.exists()) {
        // Create default settings if not exists
        const defaultSettings = {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          leavePolicy: {
            annual: 21,
            sick: 14,
            maternity: 90,
            paternity: 14
          },
          attendancePolicy: {
            lateThreshold: 15, // minutes
            earlyLeaveThreshold: 15, // minutes
            overtimeRate: 1.5
          },
          payrollPolicy: {
            paymentDay: 25,
            paymentMethod: 'bank_transfer',
            taxRate: 0.1
          }
        };

        await this.updateCompanySettings(companyId, defaultSettings);
        return defaultSettings;
      }

      return settingsSnap.data();
    } catch (error) {
      console.error('Error getting company settings:', error);
      throw error;
    }
  }

  // Update company settings
  static async updateCompanySettings(companyId, settings) {
    try {
      const settingsRef = doc(db, 'companySettings', companyId);
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  }

  // Get company languages
  static async getCompanyLanguages(companyId) {
    try {
      const languagesQuery = query(
        collection(db, 'companyLanguages'),
        where('companyId', '==', companyId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(languagesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting company languages:', error);
      throw error;
    }
  }

  // Add company language
  static async addCompanyLanguage(languageData) {
    try {
      const language = {
        ...languageData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'companyLanguages'), language);
      return { id: docRef.id, ...language };
    } catch (error) {
      console.error('Error adding company language:', error);
      throw error;
    }
  }

  // Update company language
  static async updateCompanyLanguage(languageId, updates) {
    try {
      const languageRef = doc(db, 'companyLanguages', languageId);
      await updateDoc(languageRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating company language:', error);
      throw error;
    }
  }

  // Delete company language
  static async deleteCompanyLanguage(languageId) {
    try {
      const languageRef = doc(db, 'companyLanguages', languageId);
      await updateDoc(languageRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting company language:', error);
      throw error;
    }
  }

  // Get company currencies
  static async getCompanyCurrencies(companyId) {
    try {
      const currenciesQuery = query(
        collection(db, 'companyCurrencies'),
        where('companyId', '==', companyId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(currenciesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting company currencies:', error);
      throw error;
    }
  }

  // Add company currency
  static async addCompanyCurrency(currencyData) {
    try {
      const currency = {
        ...currencyData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'companyCurrencies'), currency);
      return { id: docRef.id, ...currency };
    } catch (error) {
      console.error('Error adding company currency:', error);
      throw error;
    }
  }

  // Update company currency
  static async updateCompanyCurrency(currencyId, updates) {
    try {
      const currencyRef = doc(db, 'companyCurrencies', currencyId);
      await updateDoc(currencyRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating company currency:', error);
      throw error;
    }
  }

  // Delete company currency
  static async deleteCompanyCurrency(currencyId) {
    try {
      const currencyRef = doc(db, 'companyCurrencies', currencyId);
      await updateDoc(currencyRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting company currency:', error);
      throw error;
    }
  }
} 