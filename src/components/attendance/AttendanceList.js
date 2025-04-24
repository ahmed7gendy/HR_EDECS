import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF, importFromExcel } from '../../utils/exportUtils';

const AttendanceList = () => {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all'); // all, present, absent, late

  const fetchData = useCallback(async () => {
    try {
      // Fetch employees
      const employeesQuery = collection(db, 'employees');
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeesList = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesList);

      // Fetch attendance records
      let attendanceQuery = collection(db, 'attendance');
      attendanceQuery = query(attendanceQuery, where('date', '==', selectedDate));

      if (filter !== 'all') {
        attendanceQuery = query(attendanceQuery, where('status', '==', filter));
      }

      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceList = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendance(attendanceList);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (employeeId, status) => {
    try {
      const existingRecord = attendance.find(record => record.employeeId === employeeId);
      const now = new Date().toISOString();

      if (existingRecord) {
        // Update existing record
        await updateDoc(doc(db, 'attendance', existingRecord.id), {
          status,
          updatedAt: now
        });
      } else {
        // Create new record
        const employee = employees.find(emp => emp.id === employeeId);
        await addDoc(collection(db, 'attendance'), {
          employeeId,
          employeeName: employee.name,
          date: selectedDate,
          status,
          createdAt: now,
          updatedAt: now
        });
      }

      fetchData();
    } catch (err) {
      setError('Error updating attendance');
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const exportData = employees.map(employee => {
      const record = attendance.find(r => r.employeeId === employee.id);
      return {
        'Employee Name': employee.name,
        'Status': record ? record.status : 'Not Marked',
        'Date': selectedDate,
        'Updated At': record ? new Date(record.updatedAt).toLocaleString() : '-'
      };
    });
    exportToExcel(exportData, `attendance_${selectedDate}`);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Employee Name', accessor: 'employeeName' },
      { header: 'Status', accessor: 'status' },
      { header: 'Date', accessor: 'date' },
      { header: 'Updated At', accessor: 'updatedAt' }
    ];
    exportToPDF(attendance, `attendance_${selectedDate}`, columns);
  };

  const handleImportExcel = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const data = await importFromExcel(file);
      for (const record of data) {
        const employee = employees.find(emp => emp.name === record['Employee Name']);
        if (employee) {
          await handleStatusUpdate(employee.id, record.Status.toLowerCase());
        }
      }
    } catch (err) {
      setError('Error importing data');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
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
              <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
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
              {employees.map((employee) => {
                const attendanceRecord = attendance.find(record => record.employeeId === employee.id);
                return (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendanceRecord ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendanceRecord.status)}`}>
                          {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(employee.id, 'present')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(employee.id, 'absent')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(employee.id, 'late')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Late
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

export default AttendanceList; 