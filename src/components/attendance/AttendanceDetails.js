import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceDoc = await getDoc(doc(db, 'attendance', id));
        if (attendanceDoc.exists()) {
          setAttendance({ id: attendanceDoc.id, ...attendanceDoc.data() });
        } else {
          setError('Attendance record not found');
        }
      } catch (err) {
        setError('Error fetching attendance details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'attendance', id), {
        status: newStatus,
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      
      setAttendance(prev => ({
        ...prev,
        status: newStatus,
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      setError('Error updating status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        No attendance record found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Details</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Employee</p>
            <p className="font-medium">{attendance.employeeName}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">
              {new Date(attendance.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Check In</p>
            <p className="font-medium">{attendance.checkIn}</p>
          </div>
          <div>
            <p className="text-gray-600">Check Out</p>
            <p className="font-medium">{attendance.checkOut || 'Not checked out'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className={`font-medium ${
              attendance.status === 'present' ? 'text-green-600' :
              attendance.status === 'late' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Working Hours</p>
            <p className="font-medium">{attendance.workingHours || 'N/A'}</p>
          </div>
        </div>

        {currentUser.role === 'admin' || currentUser.role === 'hr' ? (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleStatusUpdate('present')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={attendance.status === 'present'}
            >
              Mark Present
            </button>
            <button
              onClick={() => handleStatusUpdate('late')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              disabled={attendance.status === 'late'}
            >
              Mark Late
            </button>
            <button
              onClick={() => handleStatusUpdate('absent')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={attendance.status === 'absent'}
            >
              Mark Absent
            </button>
          </div>
        ) : null}

        {attendance.notes && (
          <div className="mt-6">
            <p className="text-gray-600">Notes</p>
            <p className="mt-1">{attendance.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetails; 