import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    department: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchPayrolls();
  }, [filters]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const payrollsQuery = query(
        collection(db, 'payrolls'),
        orderBy('createdAt', 'desc')
      );
      const payrollsSnapshot = await getDocs(payrollsQuery);
      const payrollsList = payrollsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayrolls(payrollsList);
    } catch (err) {
      setError('Error fetching payrolls');
      console.error(err);
    } finally {
      setLoading(false);
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
    const exportData = payrolls.map(payroll => ({
      'Employee Name': payroll.employeeName,
      'Department': payroll.department,
      'Month': payroll.month,
      'Year': payroll.year,
      'Gross Salary': payroll.grossSalary,
      'Total Deductions': payroll.totalDeductions,
      'Net Salary': payroll.netSalary,
      'Status': payroll.status
    }));
    exportToExcel(exportData, 'payroll_list');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Employee Name', accessor: 'employeeName' },
      { header: 'Department', accessor: 'department' },
      { header: 'Month', accessor: 'month' },
      { header: 'Year', accessor: 'year' },
      { header: 'Gross Salary', accessor: 'grossSalary' },
      { header: 'Total Deductions', accessor: 'totalDeductions' },
      { header: 'Net Salary', accessor: 'netSalary' },
      { header: 'Status', accessor: 'status' }
    ];
    exportToPDF(payrolls, 'payroll_list', columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payroll List</h2>
          <div className="flex gap-2">
            <Link
              to="/payroll/settings"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Payroll Settings
            </Link>
            <Link
              to="/payroll/reports"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Reports
            </Link>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
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
              {payrolls.map((payroll) => (
                <tr key={payroll.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{payroll.employeeName}</div>
                    <div className="text-sm text-gray-500">{payroll.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payroll.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(2000, payroll.month - 1, 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${payroll.grossSalary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${payroll.totalDeductions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${payroll.netSalary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/payroll/${payroll.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
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

export default PayrollList; 