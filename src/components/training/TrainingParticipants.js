import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const TrainingParticipants = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [training, setTraining] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    status: 'registered',
    attendance: false,
    feedback: '',
    score: '',
    certificate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    attendance: 'all'
  });

  useEffect(() => {
    fetchData();
  }, [id, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch training details
      const trainingDoc = await getDoc(doc(db, 'training', id));
      if (trainingDoc.exists()) {
        setTraining({ id: trainingDoc.id, ...trainingDoc.data() });
      }

      // Fetch participants
      let participantsQuery = query(
        collection(db, 'training_participants'),
        where('trainingId', '==', id),
        orderBy('registeredAt', 'desc')
      );

      if (filters.status !== 'all') {
        participantsQuery = query(participantsQuery, where('status', '==', filters.status));
      }
      if (filters.attendance !== 'all') {
        participantsQuery = query(participantsQuery, where('attendance', '==', filters.attendance === 'true'));
      }

      const participantsSnapshot = await getDocs(participantsQuery);
      const participantsList = participantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParticipants(participantsList);
    } catch (err) {
      setError('Error fetching data');
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
      const participantData = {
        ...formData,
        trainingId: id,
        registeredBy: currentUser.uid,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'training_participants', editingId), participantData);
      } else {
        await addDoc(collection(db, 'training_participants'), participantData);
      }

      setFormData({
        employeeId: '',
        status: 'registered',
        attendance: false,
        feedback: '',
        score: '',
        certificate: ''
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError('Error saving participant');
      console.error(err);
    }
  };

  const handleEdit = (participant) => {
    setFormData({
      employeeId: participant.employeeId,
      status: participant.status,
      attendance: participant.attendance,
      feedback: participant.feedback,
      score: participant.score,
      certificate: participant.certificate
    });
    setEditingId(participant.id);
  };

  const handleDelete = async (participantId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await deleteDoc(doc(db, 'training_participants', participantId));
        fetchData();
      } catch (err) {
        setError('Error removing participant');
        console.error(err);
      }
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
    const exportData = participants.map(participant => ({
      'Employee ID': participant.employeeId,
      'Status': participant.status,
      'Attendance': participant.attendance ? 'Present' : 'Absent',
      'Score': participant.score,
      'Feedback': participant.feedback,
      'Certificate': participant.certificate,
      'Registered At': participant.registeredAt
    }));
    exportToExcel(exportData, 'training_participants');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Employee ID', accessor: 'employeeId' },
      { header: 'Status', accessor: 'status' },
      { header: 'Attendance', accessor: 'attendance' },
      { header: 'Score', accessor: 'score' },
      { header: 'Certificate', accessor: 'certificate' }
    ];
    exportToPDF(participants, 'training_participants', columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!training) return <div className="p-4">Training not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Training Participants</h2>
            <p className="text-gray-500">{training.title}</p>
          </div>
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
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="registered">Registered</option>
                <option value="attended">Attended</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Score</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Certificate</label>
              <input
                type="text"
                name="certificate"
                value={formData.certificate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Feedback</label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="attendance"
                checked={formData.attendance}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Attendance</label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {editingId ? 'Update Participant' : 'Add Participant'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    employeeId: '',
                    status: 'registered',
                    attendance: false,
                    feedback: '',
                    score: '',
                    certificate: ''
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="attended">Attended</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendance</label>
            <select
              name="attendance"
              value={filters.attendance}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Attendance</option>
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{participant.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      participant.status === 'completed' ? 'bg-green-100 text-green-800' :
                      participant.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                      participant.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {participant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      participant.attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {participant.attendance ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.score}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.certificate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.feedback}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(participant)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id)}
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

export default TrainingParticipants; 