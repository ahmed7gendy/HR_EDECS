import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetchApplicationDetails();
    fetchInterviews();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const applicationDoc = await getDoc(doc(db, 'applications', id));
      if (applicationDoc.exists()) {
        const applicationData = applicationDoc.data();
        setApplication({ id: applicationDoc.id, ...applicationData });

        // Fetch job details
        const jobDoc = await getDoc(doc(db, 'jobs', applicationData.jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        }
      }
    } catch (err) {
      setError('Error fetching application details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('applicationId', '==', id)
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      const interviewsList = interviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(interviewsList);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setApplication(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Error updating application status');
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    if (!application || !job) return;

    const exportData = [{
      'Applicant Name': application.applicantName,
      'Email': application.email,
      'Phone': application.phone,
      'Job Title': job.title,
      'Department': job.department,
      'Status': application.status,
      'Applied Date': new Date(application.createdAt).toLocaleDateString(),
      'Last Updated': new Date(application.updatedAt).toLocaleDateString(),
      'Cover Letter': application.coverLetter,
      'Resume URL': application.resumeUrl
    }];

    exportToExcel(exportData, `application_${id}`);
  };

  const handleExportPDF = () => {
    if (!application || !job) return;

    const columns = [
      { header: 'Field', accessor: 'field' },
      { header: 'Value', accessor: 'value' }
    ];

    const data = [
      { field: 'Applicant Name', value: application.applicantName },
      { field: 'Email', value: application.email },
      { field: 'Phone', value: application.phone },
      { field: 'Job Title', value: job.title },
      { field: 'Department', value: job.department },
      { field: 'Status', value: application.status },
      { field: 'Applied Date', value: new Date(application.createdAt).toLocaleDateString() },
      { field: 'Last Updated', value: new Date(application.updatedAt).toLocaleDateString() },
      { field: 'Cover Letter', value: application.coverLetter },
      { field: 'Resume URL', value: application.resumeUrl }
    ];

    exportToPDF(data, `application_${id}`, columns);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!application || !job) return <div className="p-4">Application not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Application Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/recruitment/applications/${id}/schedule-interview`)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Schedule Interview
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1">{application.applicantName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1">{application.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1">{application.phone}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Job Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <p className="mt-1">{job.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="mt-1">{job.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Cover Letter</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{application.coverLetter}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Resume</h3>
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900"
          >
            View Resume
          </a>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Interview History</h3>
          {interviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  {interviews.map((interview) => (
                    <tr key={interview.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(interview.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {interview.status === 'scheduled' && (
                          <button
                            onClick={() => navigate(`/recruitment/interviews/${interview.id}/feedback`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Submit Feedback
                          </button>
                        )}
                        {interview.status === 'completed' && (
                          <button
                            onClick={() => navigate(`/recruitment/interviews/${interview.id}/feedback`)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View Feedback
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No interviews scheduled yet.</p>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            View Job Posting
          </button>
          <button
            onClick={() => navigate('/recruitment/jobs')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails; 