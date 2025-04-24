import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          setError('Job not found');
        }

        // Fetch applications
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', id)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsList = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsList);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!job) return <div className="p-4">Job not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{job.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/recruitment/jobs/${id}/applications`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              View Applications
            </button>
            <button
              onClick={() => navigate('/recruitment/jobs')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Jobs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Job Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Department</p>
                <p className="mt-1">{job.department}</p>
              </div>
              <div>
                <p className="font-semibold">Location</p>
                <p className="mt-1">{job.location}</p>
              </div>
              <div>
                <p className="font-semibold">Type</p>
                <p className="mt-1">{job.type}</p>
              </div>
              <div>
                <p className="font-semibold">Salary Range</p>
                <p className="mt-1">${job.salaryRange.min} - ${job.salaryRange.max}</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p className={`mt-1 ${
                  job.status === 'open' ? 'text-green-600' :
                  job.status === 'closed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Experience</p>
                <p className="mt-1">{job.requirements.experience} years</p>
              </div>
              <div>
                <p className="font-semibold">Education</p>
                <p className="mt-1">{job.requirements.education}</p>
              </div>
              <div>
                <p className="font-semibold">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.requirements.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Job Description</h3>
          <div className="prose max-w-none">
            <p>{job.description}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Application Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold">{applications.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Reviewed</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {applications.filter(app => app.status === 'reviewed').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-blue-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
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
                {applications.slice(0, 5).map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.applicantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/recruitment/applications/${application.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 