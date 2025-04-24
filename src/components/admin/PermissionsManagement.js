import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'hr', name: 'HR Manager' },
  { id: 'manager', name: 'Department Manager' },
  { id: 'employee', name: 'Employee' }
];

const permissions = {
  users: {
    view: 'View Users',
    create: 'Create Users',
    edit: 'Edit Users',
    delete: 'Delete Users'
  },
  departments: {
    view: 'View Departments',
    create: 'Create Departments',
    edit: 'Edit Departments',
    delete: 'Delete Departments'
  },
  attendance: {
    view: 'View Attendance',
    create: 'Create Attendance',
    edit: 'Edit Attendance',
    delete: 'Delete Attendance'
  },
  leaves: {
    view: 'View Leaves',
    create: 'Create Leaves',
    edit: 'Edit Leaves',
    delete: 'Delete Leaves'
  },
  payroll: {
    view: 'View Payroll',
    create: 'Create Payroll',
    edit: 'Edit Payroll',
    delete: 'Delete Payroll'
  },
  recruitment: {
    view: 'View Recruitment',
    create: 'Create Recruitment',
    edit: 'Edit Recruitment',
    delete: 'Delete Recruitment'
  },
  training: {
    view: 'View Training',
    create: 'Create Training',
    edit: 'Edit Training',
    delete: 'Delete Training'
  },
  performance: {
    view: 'View Performance',
    create: 'Create Performance',
    edit: 'Edit Performance',
    delete: 'Delete Performance'
  },
  documents: {
    view: 'View Documents',
    create: 'Create Documents',
    edit: 'Edit Documents',
    delete: 'Delete Documents'
  },
  projects: {
    view: 'View Projects',
    create: 'Create Projects',
    edit: 'Edit Projects',
    delete: 'Delete Projects'
  },
  freelancers: {
    view: 'View Freelancers',
    create: 'Create Freelancers',
    edit: 'Edit Freelancers',
    delete: 'Delete Freelancers'
  },
  checklists: {
    view: 'View Checklists',
    create: 'Create Checklists',
    edit: 'Edit Checklists',
    delete: 'Delete Checklists'
  },
  reports: {
    view: 'View Reports',
    create: 'Create Reports',
    edit: 'Edit Reports',
    delete: 'Delete Reports'
  }
};

export default function PermissionsManagement() {
  const { userRole } = useAuth();
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }

    async function fetchPermissions() {
      try {
        const permissionsDoc = await getDoc(doc(db, 'settings', 'permissions'));
        if (permissionsDoc.exists()) {
          setRolePermissions(permissionsDoc.data());
        } else {
          // Initialize with default permissions
          const defaultPermissions = {};
          roles.forEach(role => {
            defaultPermissions[role.id] = {};
            Object.keys(permissions).forEach(module => {
              defaultPermissions[role.id][module] = {
                view: role.id === 'admin' || role.id === 'hr',
                create: role.id === 'admin',
                edit: role.id === 'admin',
                delete: role.id === 'admin'
              };
            });
          });
          setRolePermissions(defaultPermissions);
        }
      } catch (error) {
        setError('Failed to load permissions');
      }
      setLoading(false);
    }

    fetchPermissions();
  }, [userRole]);

  async function handlePermissionChange(roleId, module, action, value) {
    try {
      setError('');
      setSuccess('');
      const updatedPermissions = {
        ...rolePermissions,
        [roleId]: {
          ...rolePermissions[roleId],
          [module]: {
            ...rolePermissions[roleId][module],
            [action]: value
          }
        }
      };
      await updateDoc(doc(db, 'settings', 'permissions'), updatedPermissions);
      setRolePermissions(updatedPermissions);
      setSuccess('Permissions updated successfully');
    } catch (error) {
      setError('Failed to update permissions');
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Permissions Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage role-based access control.</p>
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
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {roles.map((role) => (
                  <div key={role.id} className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">{role.name}</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(permissions).map(([module, modulePermissions]) => (
                        <div key={module} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">{module.charAt(0).toUpperCase() + module.slice(1)}</h5>
                          <div className="space-y-3">
                            {Object.entries(modulePermissions).map(([action, label]) => (
                              <div key={action} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${role.id}-${module}-${action}`}
                                  checked={rolePermissions[role.id]?.[module]?.[action] || false}
                                  onChange={(e) => handlePermissionChange(role.id, module, action, e.target.checked)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`${role.id}-${module}-${action}`} className="ml-2 block text-sm text-gray-900">
                                  {label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 