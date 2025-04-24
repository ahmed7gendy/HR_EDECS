import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [leave, setLeave] = useState(null);
  const [leaveType, setLeaveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaveDetails();
  }, [id]);

  const fetchLeaveDetails = async () => {
    try {
      const leaveDoc = await getDoc(doc(db, 'leaves', id));
      if (leaveDoc.exists()) {
        const leaveData = { id: leaveDoc.id, ...leaveDoc.data() };
        setLeave(leaveData);

        // Fetch leave type details
        const leaveTypeDoc = await getDoc(doc(db, 'leaveTypes', leaveData.leaveTypeId));
        if (leaveTypeDoc.exists()) {
          setLeaveType({ id: leaveTypeDoc.id, ...leaveTypeDoc.data() });
        }
      } else {
        setError('Leave request not found');
      }
    } catch (err) {
      setError('Error fetching leave details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, rejectionReason = '') => {
    try {
      const leaveRef = doc(db, 'leaves', id);
      await updateDoc(leaveRef, {
        status: newStatus,
        rejectionReason: newStatus === 'rejected' ? rejectionReason : '',
        updatedAt: new Date().toISOString()
      });
      fetchLeaveDetails();
    } catch (err) {
      setError('Error updating leave status');
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        const leaveRef = doc(db, 'leaves', id);
        await updateDoc(leaveRef, {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        });
        fetchLeaveDetails();
      } catch (err) {
        setError('Error cancelling leave request');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!leave) return <div className="p-4">Leave request not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Leave Request Details</h2>
          <button
            onClick={() => navigate('/leaves')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Request Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Employee</p>
                <p className="mt-1">{leave.employeeName}</p>
              </div>
              <div>
                <p className="font-semibold">Leave Type</p>
                <p className="mt-1">{leaveType?.name || leave.leaveTypeId}</p>
              </div>
              <div>
                <p className="font-semibold">Start Date</p>
                <p className="mt-1">{new Date(leave.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">End Date</p>
                <p className="mt-1">{new Date(leave.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Duration</p>
                <p className="mt-1">
                  {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                </p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p className={`mt-1 ${getStatusColor(leave.status)} px-2 py-1 rounded-full inline-block`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </p>
              </div>
              {leave.rejectionReason && (
                <div>
                  <p className="font-semibold">Rejection Reason</p>
                  <p className="mt-1 text-red-600">{leave.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Reason</p>
                <p className="mt-1">{leave.reason}</p>
              </div>
              {leave.attachmentName && (
                <div>
                  <p className="font-semibold">Attachment</p>
                  <a
                    href={leave.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-indigo-600 hover:text-indigo-900"
                  >
                    {leave.attachmentName}
                  </a>
                </div>
              )}
              <div>
                <p className="font-semibold">Submitted On</p>
                <p className="mt-1">{new Date(leave.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-semibold">Last Updated</p>
                <p className="mt-1">{new Date(leave.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {leave.status === 'pending' && (
          <div className="mt-8 flex justify-end gap-2">
            {(currentUser.isAdmin || currentUser.isManager) && (
              <>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt('Enter rejection reason:');
                    if (reason) {
                      handleStatusUpdate('rejected', reason);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}
            {leave.employeeId === currentUser.uid && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveDetails; 