import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const LeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxDays: '',
    paid: true,
    requiresApproval: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const leaveTypesSnapshot = await getDocs(collection(db, 'leave_types'));
      const leaveTypesList = leaveTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveTypes(leaveTypesList);
    } catch (err) {
      setError('Error fetching leave types');
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
      const leaveTypeData = {
        ...formData,
        maxDays: parseInt(formData.maxDays),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'leave_types', editingId), leaveTypeData);
      } else {
        await addDoc(collection(db, 'leave_types'), leaveTypeData);
      }

      setFormData({
        name: '',
        description: '',
        maxDays: '',
        paid: true,
        requiresApproval: true
      });
      setEditingId(null);
      fetchLeaveTypes();
    } catch (err) {
      setError('Error saving leave type');
      console.error(err);
    }
  };

  const handleEdit = (leaveType) => {
    setFormData({
      name: leaveType.name,
      description: leaveType.description,
      maxDays: leaveType.maxDays.toString(),
      paid: leaveType.paid,
      requiresApproval: leaveType.requiresApproval
    });
    setEditingId(leaveType.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      try {
        await deleteDoc(doc(db, 'leave_types', id));
        fetchLeaveTypes();
      } catch (err) {
        setError('Error deleting leave type');
        console.error(err);
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = leaveTypes.map(type => ({
      'Leave Type': type.name,
      'Description': type.description,
      'Max Days': type.maxDays,
      'Paid': type.paid ? 'Yes' : 'No',
      'Requires Approval': type.requiresApproval ? 'Yes' : 'No',
      'Created At': new Date(type.createdAt).toLocaleString(),
      'Updated At': new Date(type.updatedAt).toLocaleString()
    }));
    exportToExcel(exportData, 'leave_types');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Leave Type', accessor: 'name' },
      { header: 'Description', accessor: 'description' },
      { header: 'Max Days', accessor: 'maxDays' },
      { header: 'Paid', accessor: 'paid' },
      { header: 'Requires Approval', accessor: 'requiresApproval' }
    ];
    exportToPDF(leaveTypes, 'leave_types', columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Leave Types</h2>
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
              <label className="block text-sm font-medium text-gray-700">Max Days</label>
              <input
                type="number"
                name="maxDays"
                value={formData.maxDays}
                onChange={handleInputChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Paid Leave</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Requires Approval</label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {editingId ? 'Update Leave Type' : 'Add Leave Type'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    maxDays: '',
                    paid: true,
                    requiresApproval: true
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requires Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveTypes.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
                  <td className="px-6 py-4">{type.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{type.maxDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {type.paid ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {type.requiresApproval ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
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

export default LeaveTypes; 