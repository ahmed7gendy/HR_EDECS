import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function SystemSettings() {
  const { userRole } = useAuth();
  const [settings, setSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    leavePolicy: {
      annualLeave: 20,
      sickLeave: 10,
      maternityLeave: 90,
      paternityLeave: 14
    },
    payrollSettings: {
      paymentDay: 25,
      currency: 'USD',
      taxRate: 0.2
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notificationTypes: ['leave', 'attendance', 'payroll', 'performance']
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }

    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'system'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
      } catch (error) {
        setError('Failed to load settings');
      }
      setLoading(false);
    }

    fetchSettings();
  }, [userRole]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await updateDoc(doc(db, 'settings', 'system'), settings);
      setSuccess('Settings updated successfully');
    } catch (error) {
      setError('Failed to update settings');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && userRole !== 'admin') {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage system-wide configurations.</p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                    Company Email
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    id="companyEmail"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                    Company Address
                  </label>
                  <textarea
                    name="companyAddress"
                    id="companyAddress"
                    rows={3}
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Working Hours</h4>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="workingHoursStart" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="workingHoursStart"
                      id="workingHoursStart"
                      value={settings.workingHours.start}
                      onChange={(e) => setSettings({
                        ...settings,
                        workingHours: { ...settings.workingHours, start: e.target.value }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHoursEnd" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="workingHoursEnd"
                      id="workingHoursEnd"
                      value={settings.workingHours.end}
                      onChange={(e) => setSettings({
                        ...settings,
                        workingHours: { ...settings.workingHours, end: e.target.value }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Leave Policy</h4>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="annualLeave" className="block text-sm font-medium text-gray-700">
                      Annual Leave (days)
                    </label>
                    <input
                      type="number"
                      name="annualLeave"
                      id="annualLeave"
                      value={settings.leavePolicy.annualLeave}
                      onChange={(e) => setSettings({
                        ...settings,
                        leavePolicy: { ...settings.leavePolicy, annualLeave: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="sickLeave" className="block text-sm font-medium text-gray-700">
                      Sick Leave (days)
                    </label>
                    <input
                      type="number"
                      name="sickLeave"
                      id="sickLeave"
                      value={settings.leavePolicy.sickLeave}
                      onChange={(e) => setSettings({
                        ...settings,
                        leavePolicy: { ...settings.leavePolicy, sickLeave: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Payroll Settings</h4>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700">
                      Payment Day
                    </label>
                    <input
                      type="number"
                      name="paymentDay"
                      id="paymentDay"
                      min="1"
                      max="31"
                      value={settings.payrollSettings.paymentDay}
                      onChange={(e) => setSettings({
                        ...settings,
                        payrollSettings: { ...settings.payrollSettings, paymentDay: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="taxRate"
                      id="taxRate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.payrollSettings.taxRate * 100}
                      onChange={(e) => setSettings({
                        ...settings,
                        payrollSettings: { ...settings.payrollSettings, taxRate: parseFloat(e.target.value) / 100 }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Notification Settings</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      id="emailNotifications"
                      checked={settings.notificationSettings.emailNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          emailNotifications: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      id="pushNotifications"
                      checked={settings.notificationSettings.pushNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          pushNotifications: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable Push Notifications
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 