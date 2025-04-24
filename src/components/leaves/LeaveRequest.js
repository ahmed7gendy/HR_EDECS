import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
    status: 'pending'
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'leaveTypes'));
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveTypes(types);
    } catch (err) {
      setError('Error fetching leave types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setFormData(prev => ({
        ...prev,
        attachment: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateRequest = async () => {
    const selectedType = leaveTypes.find(type => type.id === formData.leaveTypeId);
    if (!selectedType) return 'Please select a leave type';

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();

    // Check if dates are valid
    if (startDate > endDate) return 'End date must be after start date';
    if (startDate < today) return 'Start date cannot be in the past';

    // Check advance notice requirement
    const daysUntilStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilStart < selectedType.advanceNoticeDays) {
      return `This leave type requires ${selectedType.advanceNoticeDays} days advance notice`;
    }

    // Check if attachment is required
    if (selectedType.requiresAttachment && !formData.attachment) {
      return 'Attachment is required for this leave type';
    }

    // Check leave balance
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    if (startYear !== endYear) {
      return 'Leave request cannot span across years';
    }

    // Calculate number of days
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (days > selectedType.maxDaysPerYear) {
      return `Maximum ${selectedType.maxDaysPerYear} days allowed for this leave type`;
    }

    // Check for overlapping leaves
    const leavesQuery = query(
      collection(db, 'leaves'),
      where('employeeId', '==', currentUser.uid),
      where('status', 'in', ['pending', 'approved'])
    );
    const leavesSnapshot = await getDocs(leavesQuery);
    const existingLeaves = leavesSnapshot.docs.map(doc => doc.data());

    for (const leave of existingLeaves) {
      const existingStart = new Date(leave.startDate);
      const existingEnd = new Date(leave.endDate);
      if (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      ) {
        return 'You have an overlapping leave request';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validationError = await validateRequest();
      if (validationError) {
        setError(validationError);
        return;
      }

      const leaveData = {
        ...formData,
        employeeId: currentUser.uid,
        employeeName: currentUser.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Handle file upload if attachment exists
      if (formData.attachment) {
        // TODO: Implement file upload to Firebase Storage
        // For now, we'll just store the file name
        leaveData.attachmentName = formData.attachment.name;
      }

      await addDoc(collection(db, 'leaves'), leaveData);
      navigate('/leaves');
    } catch (err) {
      setError('Error submitting leave request');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Request Leave</h2>
          <button
            onClick={() => navigate('/leaves')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.isPaid ? '(Paid)' : '(Unpaid)'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attachment</label>
            <input
              type="file"
              name="attachment"
              onChange={handleInputChange}
              className="mt-1 block w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload supporting documents (e.g., medical certificate)
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest; 