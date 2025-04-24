import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { exportToPDF } from '../../utils/exportUtils';

const PayrollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayrollDetails();
  }, [id]);

  const fetchPayrollDetails = async () => {
    try {
      const payrollDoc = await getDoc(doc(db, 'payrolls', id));
      if (payrollDoc.exists()) {
        setPayroll({ id: payrollDoc.id, ...payrollDoc.data() });
      } else {
        setError('Payroll record not found');
      }
    } catch (err) {
      setError('Error fetching payroll details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'payrolls', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchPayrollDetails();
    } catch (err) {
      setError('Error updating payroll status');
      console.error(err);
    }
  };

  const handleExportPDF = () => {
    if (!payroll) return;

    const columns = [
      { header: 'Description', accessor: 'description' },
      { header: 'Amount', accessor: 'amount' }
    ];

    const data = [
      { description: 'Basic Salary', amount: payroll.basicSalary },
      { description: 'Allowances', amount: payroll.allowances },
      { description: 'Deductions', amount: payroll.deductions },
      { description: 'Net Salary', amount: payroll.netSalary }
    ];

    exportToPDF(data, `payroll_${payroll.employeeName}_${payroll.month}_${payroll.year}`, columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!payroll) return <div className="p-4">Payroll record not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payroll Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/payroll')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to List
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                <div className="mt-1 text-gray-900">{payroll.employeeName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <div className="mt-1 text-gray-900">{payroll.employeeId}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <div className="mt-1 text-gray-900">{payroll.department}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payroll Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <div className="mt-1 text-gray-900">
                  {new Date(2000, payroll.month - 1, 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payroll.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Generated On</label>
                <div className="mt-1 text-gray-900">
                  {new Date(payroll.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Salary Breakdown</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">${payroll.basicSalary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Allowances</span>
                <span className="font-medium">${payroll.allowances}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deductions</span>
                <span className="font-medium">${payroll.deductions}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Net Salary</span>
                  <span className="text-gray-900 font-semibold">${payroll.netSalary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {payroll.status === 'Pending' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusUpdate('Paid')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDetails; 