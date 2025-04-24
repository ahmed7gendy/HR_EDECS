import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';

const InterviewScheduling = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    try {
      // Fetch application details
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      if (applicationDoc.exists()) {
        setApplication({ id: applicationDoc.id, ...applicationDoc.data() });
      }

      // Fetch available interviewers
      const interviewersQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['interviewer', 'manager'])
      );
      const interviewersSnapshot = await getDocs(interviewersQuery);
      const interviewersList = interviewersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviewers(interviewersList);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const interviewData = {
        applicationId,
        interviewerId: selectedInterviewer,
        date: interviewDate,
        time: interviewTime,
        type: interviewType,
        notes,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add interview to interviews collection
      const interviewRef = await addDoc(collection(db, 'interviews'), interviewData);

      // Update application status
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'interview_scheduled',
        updatedAt: new Date().toISOString()
      });

      // Log activity
      await addDoc(collection(db, 'activities'), {
        type: 'interview_scheduled',
        applicationId,
        interviewId: interviewRef.id,
        performedBy: 'current_user_id', // Replace with actual user ID
        timestamp: new Date().toISOString(),
        details: `Interview scheduled for ${format(new Date(`${interviewDate}T${interviewTime}`), 'PPp')}`
      });

      navigate(`/recruitment/applications/${applicationId}`);
    } catch (err) {
      setError('Error scheduling interview');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!application) return <div className="p-4">Application not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Schedule Interview</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Applicant Information</h3>
          <p><span className="font-medium">Name:</span> {application.applicantName}</p>
          <p><span className="font-medium">Position:</span> {application.jobTitle}</p>
        </div>

        <form onSubmit={handleScheduleInterview} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Interviewer</label>
            <select
              value={selectedInterviewer}
              onChange={(e) => setSelectedInterviewer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Interviewer</option>
              {interviewers.map(interviewer => (
                <option key={interviewer.id} value={interviewer.id}>
                  {interviewer.name} ({interviewer.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Interview Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="technical">Technical Interview</option>
              <option value="hr">HR Interview</option>
              <option value="final">Final Interview</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Add any specific notes or requirements for the interview"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/recruitment/applications/${applicationId}`)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduling; 