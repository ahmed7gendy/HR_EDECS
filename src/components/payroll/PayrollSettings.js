import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import TaxManagement from './TaxManagement';
import SalaryStructure from './SalaryStructure';

const PayrollSettings = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    payFrequency: 'monthly',
    payDay: '25',
    taxYear: new Date().getFullYear(),
    taxRates: {
      incomeTax: {
        rate: 20,
        threshold: 12500
      },
      socialSecurity: {
        rate: 12,
        threshold: 9500
      },
      healthInsurance: {
        rate: 2,
        threshold: 0
      }
    },
    allowances: {
      housing: 0,
      transportation: 0,
      meal: 0,
      other: 0
    },
    deductions: {
      pension: 0,
      insurance: 0,
      loans: 0,
      other: 0
    },
    currency: 'USD',
    decimalPlaces: 2,
    roundingMethod: 'nearest',
    autoApprove: false,
    requireApproval: true,
    notifyEmployees: true,
    notifyManagers: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'settings', 'payroll'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (err) {
      setError('Error fetching settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTaxRateChange = (taxType, field, value) => {
    setSettings(prev => ({
      ...prev,
      taxRates: {
        ...prev.taxRates,
        [taxType]: {
          ...prev.taxRates[taxType],
          [field]: parseFloat(value)
        }
      }
    }));
  };

  const handleAllowanceChange = (allowanceType, value) => {
    setSettings(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [allowanceType]: parseFloat(value)
      }
    }));
  };

  const handleDeductionChange = (deductionType, value) => {
    setSettings(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [deductionType]: parseFloat(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'settings', 'payroll'), {
        ...settings,
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error updating settings');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payroll Settings</h2>
          {success && (
            <div className="text-green-600 bg-green-100 px-4 py-2 rounded">
              {success}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pay Frequency</label>
              <select
                name="payFrequency"
                value={settings.payFrequency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pay Day</label>
              <input
                type="number"
                name="payDay"
                value={settings.payDay}
                onChange={handleInputChange}
                min="1"
                max="31"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Year</label>
              <input
                type="number"
                name="taxYear"
                value={settings.taxYear}
                onChange={handleInputChange}
                min="2000"
                max="2100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Decimal Places</label>
              <input
                type="number"
                name="decimalPlaces"
                value={settings.decimalPlaces}
                onChange={handleInputChange}
                min="0"
                max="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rounding Method</label>
              <select
                name="roundingMethod"
                value={settings.roundingMethod}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="nearest">Nearest</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(settings.taxRates).map(([taxType, taxData]) => (
                <div key={taxType} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {taxType.charAt(0).toUpperCase() + taxType.slice(1)}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600">Rate (%)</label>
                      <input
                        type="number"
                        value={taxData.rate}
                        onChange={(e) => handleTaxRateChange(taxType, 'rate', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Threshold</label>
                      <input
                        type="number"
                        value={taxData.threshold}
                        onChange={(e) => handleTaxRateChange(taxType, 'threshold', e.target.value)}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Allowances</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(settings.allowances).map(([allowanceType, value]) => (
                <div key={allowanceType}>
                  <label className="block text-sm font-medium text-gray-700">
                    {allowanceType.charAt(0).toUpperCase() + allowanceType.slice(1)}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleAllowanceChange(allowanceType, e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(settings.deductions).map(([deductionType, value]) => (
                <div key={deductionType}>
                  <label className="block text-sm font-medium text-gray-700">
                    {deductionType.charAt(0).toUpperCase() + deductionType.slice(1)}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleDeductionChange(deductionType, e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="autoApprove"
                  checked={settings.autoApprove}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Auto-approve payroll
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireApproval"
                  checked={settings.requireApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Require manager approval
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifyEmployees"
                  checked={settings.notifyEmployees}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notify employees
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifyManagers"
                  checked={settings.notifyManagers}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notify managers
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollSettings; 