import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const TaxManagement = () => {
  const { currentUser } = useAuth();
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'income',
    rate: '',
    minAmount: '',
    maxAmount: '',
    description: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    isActive: 'all'
  });

  useEffect(() => {
    fetchTaxRates();
  }, [filters]);

  const fetchTaxRates = async () => {
    try {
      setLoading(true);
      let taxRatesQuery = query(
        collection(db, 'taxRates'),
        orderBy('createdAt', 'desc')
      );

      if (filters.type !== 'all') {
        taxRatesQuery = query(taxRatesQuery, where('type', '==', filters.type));
      }
      if (filters.isActive !== 'all') {
        taxRatesQuery = query(taxRatesQuery, where('isActive', '==', filters.isActive === 'true'));
      }

      const taxRatesSnapshot = await getDocs(taxRatesQuery);
      const taxRatesList = taxRatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTaxRates(taxRatesList);
    } catch (err) {
      setError('Error fetching tax rates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taxRateData = {
        ...formData,
        rate: parseFloat(formData.rate),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'taxRates', editingId), taxRateData);
      } else {
        await addDoc(collection(db, 'taxRates'), taxRateData);
      }

      setFormData({
        name: '',
        type: 'income',
        rate: '',
        minAmount: '',
        maxAmount: '',
        description: '',
        isActive: true
      });
      setEditingId(null);
      fetchTaxRates();
    } catch (err) {
      setError('Error saving tax rate');
      console.error(err);
    }
  };

  const handleEdit = (taxRate) => {
    setFormData({
      name: taxRate.name,
      type: taxRate.type,
      rate: taxRate.rate.toString(),
      minAmount: taxRate.minAmount.toString(),
      maxAmount: taxRate.maxAmount.toString(),
      description: taxRate.description,
      isActive: taxRate.isActive
    });
    setEditingId(taxRate.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tax rate?')) {
      try {
        await deleteDoc(doc(db, 'taxRates', id));
        fetchTaxRates();
      } catch (err) {
        setError('Error deleting tax rate');
        console.error(err);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExportExcel = () => {
    const exportData = taxRates.map(taxRate => ({
      'Name': taxRate.name,
      'Type': taxRate.type,
      'Rate': `${taxRate.rate}%`,
      'Min Amount': taxRate.minAmount,
      'Max Amount': taxRate.maxAmount,
      'Description': taxRate.description,
      'Status': taxRate.isActive ? 'Active' : 'Inactive'
    }));
    exportToExcel(exportData, 'tax_rates');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Name', accessor: 'name' },
      { header: 'Type', accessor: 'type' },
      { header: 'Rate', accessor: 'rate' },
      { header: 'Min Amount', accessor: 'minAmount' },
      { header: 'Max Amount', accessor: 'maxAmount' },
      { header: 'Status', accessor: 'isActive' }
    ];
    exportToPDF(taxRates, 'tax_rates', columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tax Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export PDF
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="income">Income Tax</option>
                <option value="social">Social Security</option>
                <option value="health">Health Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (%)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Amount</label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active</label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {editingId ? 'Update Tax Rate' : 'Add Tax Rate'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    type: 'income',
                    rate: '',
                    minAmount: '',
                    maxAmount: '',
                    description: '',
                    isActive: true
                  });
                  setEditingId(null);
                }}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income Tax</option>
              <option value="social">Social Security</option>
              <option value="health">Health Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxRates.map((taxRate) => (
                <tr key={taxRate.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{taxRate.name}</div>
                    <div className="text-sm text-gray-500">{taxRate.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {taxRate.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{taxRate.rate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      ${taxRate.minAmount} - ${taxRate.maxAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      taxRate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {taxRate.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(taxRate)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(taxRate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxManagement; 