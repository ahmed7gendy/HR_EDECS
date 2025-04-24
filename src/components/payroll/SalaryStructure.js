import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const SalaryStructure = () => {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseSalary: '',
    allowances: [{ name: '', amount: '', type: 'fixed' }],
    deductions: [{ name: '', amount: '', type: 'fixed' }],
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSalaryStructures();
  }, []);

  const fetchSalaryStructures = async () => {
    try {
      const salaryStructuresQuery = query(
        collection(db, 'salary_structures'),
        orderBy('createdAt', 'desc')
      );
      const salaryStructuresSnapshot = await getDocs(salaryStructuresQuery);
      const salaryStructuresList = salaryStructuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSalaryStructures(salaryStructuresList);
    } catch (err) {
      setError('Error fetching salary structures');
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

  const handleAllowanceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.map((allowance, i) => 
        i === index ? { ...allowance, [field]: value } : allowance
      )
    }));
  };

  const handleDeductionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.map((deduction, i) => 
        i === index ? { ...deduction, [field]: value } : deduction
      )
    }));
  };

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { name: '', amount: '', type: 'fixed' }]
    }));
  };

  const removeAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const addDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: '', type: 'fixed' }]
    }));
  };

  const removeDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const salaryStructureData = {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: formData.allowances.map(allowance => ({
          ...allowance,
          amount: parseFloat(allowance.amount)
        })),
        deductions: formData.deductions.map(deduction => ({
          ...deduction,
          amount: parseFloat(deduction.amount)
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'salary_structures', editingId), salaryStructureData);
      } else {
        await addDoc(collection(db, 'salary_structures'), salaryStructureData);
      }

      setFormData({
        name: '',
        description: '',
        baseSalary: '',
        allowances: [{ name: '', amount: '', type: 'fixed' }],
        deductions: [{ name: '', amount: '', type: 'fixed' }],
        isActive: true
      });
      setEditingId(null);
      fetchSalaryStructures();
    } catch (err) {
      setError('Error saving salary structure');
      console.error(err);
    }
  };

  const handleEdit = (salaryStructure) => {
    setFormData({
      name: salaryStructure.name,
      description: salaryStructure.description,
      baseSalary: salaryStructure.baseSalary.toString(),
      allowances: salaryStructure.allowances.map(allowance => ({
        ...allowance,
        amount: allowance.amount.toString()
      })),
      deductions: salaryStructure.deductions.map(deduction => ({
        ...deduction,
        amount: deduction.amount.toString()
      })),
      isActive: salaryStructure.isActive
    });
    setEditingId(salaryStructure.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary structure?')) {
      try {
        await deleteDoc(doc(db, 'salary_structures', id));
        fetchSalaryStructures();
      } catch (err) {
        setError('Error deleting salary structure');
        console.error(err);
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = salaryStructures.map(structure => ({
      'Structure Name': structure.name,
      'Description': structure.description,
      'Base Salary': structure.baseSalary,
      'Total Allowances': structure.allowances.reduce((sum, a) => sum + a.amount, 0),
      'Total Deductions': structure.deductions.reduce((sum, d) => sum + d.amount, 0),
      'Net Salary': structure.baseSalary + 
        structure.allowances.reduce((sum, a) => sum + a.amount, 0) - 
        structure.deductions.reduce((sum, d) => sum + d.amount, 0),
      'Status': structure.isActive ? 'Active' : 'Inactive',
      'Created At': new Date(structure.createdAt).toLocaleString(),
      'Updated At': new Date(structure.updatedAt).toLocaleString()
    }));
    exportToExcel(exportData, 'salary_structures');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Structure Name', accessor: 'name' },
      { header: 'Description', accessor: 'description' },
      { header: 'Base Salary', accessor: 'baseSalary' },
      { header: 'Total Allowances', accessor: 'totalAllowances' },
      { header: 'Total Deductions', accessor: 'totalDeductions' },
      { header: 'Net Salary', accessor: 'netSalary' },
      { header: 'Status', accessor: 'isActive' }
    ];

    const data = salaryStructures.map(structure => ({
      ...structure,
      totalAllowances: structure.allowances.reduce((sum, a) => sum + a.amount, 0),
      totalDeductions: structure.deductions.reduce((sum, d) => sum + d.amount, 0),
      netSalary: structure.baseSalary + 
        structure.allowances.reduce((sum, a) => sum + a.amount, 0) - 
        structure.deductions.reduce((sum, d) => sum + d.amount, 0)
    }));

    exportToPDF(data, 'salary_structures', columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Salary Structure</h2>
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
              <label className="block text-sm font-medium text-gray-700">Structure Name</label>
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
              <label className="block text-sm font-medium text-gray-700">Base Salary</label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Allowances</h3>
                <button
                  type="button"
                  onClick={addAllowance}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Add Allowance
                </button>
              </div>
              {formData.allowances.map((allowance, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      value={allowance.name}
                      onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                      placeholder="Allowance Name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={allowance.amount}
                      onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={allowance.type}
                      onChange={(e) => handleAllowanceChange(index, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeAllowance(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Deductions</h3>
                <button
                  type="button"
                  onClick={addDeduction}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Add Deduction
                </button>
              </div>
              {formData.deductions.map((deduction, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      value={deduction.name}
                      onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
                      placeholder="Deduction Name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={deduction.amount}
                      onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={deduction.type}
                      onChange={(e) => handleDeductionChange(index, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeDeduction(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
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
              {editingId ? 'Update Salary Structure' : 'Add Salary Structure'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    baseSalary: '',
                    allowances: [{ name: '', amount: '', type: 'fixed' }],
                    deductions: [{ name: '', amount: '', type: 'fixed' }],
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Structure Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
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
              {salaryStructures.map((structure) => {
                const totalAllowances = structure.allowances.reduce((sum, a) => sum + a.amount, 0);
                const totalDeductions = structure.deductions.reduce((sum, d) => sum + d.amount, 0);
                const netSalary = structure.baseSalary + totalAllowances - totalDeductions;

                return (
                  <tr key={structure.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{structure.name}</div>
                        <div className="text-sm text-gray-500">{structure.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${structure.baseSalary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${totalAllowances}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${totalDeductions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${netSalary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        structure.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {structure.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(structure.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryStructure; 