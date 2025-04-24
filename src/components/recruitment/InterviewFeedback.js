import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const InterviewFeedback = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [application, setApplication] = useState(null);
  const [feedback, setFeedback] = useState({
    technicalSkills: '',
    communicationSkills: '',
    problemSolving: '',
    culturalFit: '',
    overallRating: '',
    strengths: '',
    weaknesses: '',
    recommendations: '',
    finalDecision: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [interviewId]);

  const fetchData = async () => {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (interviewDoc.exists()) {
        const interviewData = interviewDoc.data();
        setInterview({ id: interviewDoc.id, ...interviewData });

        // Fetch application details
        const applicationDoc = await getDoc(doc(db, 'applications', interviewData.applicationId));
        if (applicationDoc.exists()) {
          setApplication({ id: applicationDoc.id, ...applicationDoc.data() });
        }
      }
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      // Update interview with feedback
      await updateDoc(doc(db, 'interviews', interviewId), {
        feedback,
        status: 'completed',
        updatedAt: new Date().toISOString()
      });

      // Update application status based on final decision
      if (feedback.finalDecision === 'accepted') {
        await updateDoc(doc(db, 'applications', interview.applicationId), {
          status: 'interview_passed',
          updatedAt: new Date().toISOString()
        });
      } else if (feedback.finalDecision === 'rejected') {
        await updateDoc(doc(db, 'applications', interview.applicationId), {
          status: 'interview_failed',
          updatedAt: new Date().toISOString()
        });
      }

      // Log activity
      await addDoc(collection(db, 'activities'), {
        type: 'interview_feedback_submitted',
        interviewId,
        applicationId: interview.applicationId,
        performedBy: 'current_user_id', // Replace with actual user ID
        timestamp: new Date().toISOString(),
        details: `Interview feedback submitted with decision: ${feedback.finalDecision}`
      });

      navigate(`/recruitment/applications/${interview.applicationId}`);
    } catch (err) {
      setError('Error submitting feedback');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!interview || !application) return <div className="p-4">Interview not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Interview Feedback</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Candidate Information</h3>
          <p><span className="font-medium">Name:</span> {application.applicantName}</p>
          <p><span className="font-medium">Position:</span> {application.jobTitle}</p>
          <p><span className="font-medium">Interview Type:</span> {interview.type}</p>
          <p><span className="font-medium">Interview Date:</span> {new Date(interview.date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Technical Skills</label>
              <textarea
                value={feedback.technicalSkills}
                onChange={(e) => setFeedback(prev => ({ ...prev, technicalSkills: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Communication Skills</label>
              <textarea
                value={feedback.communicationSkills}
                onChange={(e) => setFeedback(prev => ({ ...prev, communicationSkills: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Problem Solving</label>
              <textarea
                value={feedback.problemSolving}
                onChange={(e) => setFeedback(prev => ({ ...prev, problemSolving: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cultural Fit</label>
              <textarea
                value={feedback.culturalFit}
                onChange={(e) => setFeedback(prev => ({ ...prev, culturalFit: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
            <select
              value={feedback.overallRating}
              onChange={(e) => setFeedback(prev => ({ ...prev, overallRating: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Rating</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="below_average">Below Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Strengths</label>
              <textarea
                value={feedback.strengths}
                onChange={(e) => setFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Areas for Improvement</label>
              <textarea
                value={feedback.weaknesses}
                onChange={(e) => setFeedback(prev => ({ ...prev, weaknesses: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recommendations</label>
            <textarea
              value={feedback.recommendations}
              onChange={(e) => setFeedback(prev => ({ ...prev, recommendations: e.target.value }))}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Final Decision</label>
            <select
              value={feedback.finalDecision}
              onChange={(e) => setFeedback(prev => ({ ...prev, finalDecision: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accept</option>
              <option value="rejected">Reject</option>
              <option value="additional_interview">Additional Interview Needed</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/recruitment/applications/${interview.applicationId}`)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewFeedback; 