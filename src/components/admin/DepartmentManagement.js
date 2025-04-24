import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function DepartmentManagement() {
  const { userRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager: ''
  });

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'hr') {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }

    async function fetchDepartments() {
      try {
        const departmentsQuery = query(collection(db, 'departments'));
        const querySnapshot = await getDocs(departmentsQuery);
        const departmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDepartments(departmentsList);
      } catch (error) {
        setError('Failed to load departments');
      }
      setLoading(false);
    }

    fetchDepartments();
  }, [userRole]);

  async function handleAddDepartment(e) {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const docRef = await addDoc(collection(db, 'departments'), {
        ...newDepartment,
        createdAt: new Date().toISOString()
      });
      setDepartments([...departments, { id: docRef.id, ...newDepartment }]);
      setNewDepartment({ name: '', description: '', manager: '' });
      setSuccess('Department added successfully');
    } catch (error) {
      setError('Failed to add department');
    }
  }

  async function handleUpdateDepartment(departmentId, updatedData) {
    try {
      setError('');
      setSuccess('');
      await updateDoc(doc(db, 'departments', departmentId), updatedData);
      setDepartments(departments.map(dept => 
        dept.id === departmentId ? { ...dept, ...updatedData } : dept
      ));
      setSuccess('Department updated successfully');
    } catch (error) {
      setError('Failed to update department');
    }
  }

  async function handleDeleteDepartment(departmentId) {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteDoc(doc(db, 'departments', departmentId));
      setDepartments(departments.filter(dept => dept.id !== departmentId));
      setSuccess('Department deleted successfully');
    } catch (error) {
      setError('Failed to delete department');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && userRole !== 'admin' && userRole !== 'hr') {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Department Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage company departments.</p>
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
          <div className="border-t border-gray-200">
            <form onSubmit={handleAddDepartment} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                    Department Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    id="manager"
                    value={newDepartment.manager}
                    onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Department
                </button>
              </div>
            </form>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{department.manager || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{department.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 