import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const projectDoc = await getDoc(doc(db, 'projects', id));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        } else {
          setError('Project not found');
        }

        // Fetch employees for team members
        const employeesQuery = query(
          collection(db, 'employees'),
          where('status', '==', 'active')
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        const employeesList = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeesList);
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
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Projects
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Description</p>
                <p className="mt-1">{project.description}</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p className={`mt-1 ${
                  project.status === 'completed' ? 'text-green-600' :
                  project.status === 'in_progress' ? 'text-yellow-600' :
                  project.status === 'on_hold' ? 'text-orange-600' :
                  project.status === 'cancelled' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {project.status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
              </div>
              <div>
                <p className="font-semibold">Timeline</p>
                <p className="mt-1">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Team Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Project Manager</p>
                <p className="mt-1">
                  {employees.find(emp => emp.id === project.managerId)?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="font-semibold">Team Members</p>
                <div className="mt-2 space-y-2">
                  {project.teamMembers.map(memberId => {
                    const member = employees.find(emp => emp.id === memberId);
                    return member ? (
                      <div key={memberId} className="flex items-center gap-2">
                        <span className="text-sm">{member.name}</span>
                        <span className="text-xs text-gray-500">({member.position})</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
            <div className="space-y-4">
              <div className="relative pl-8">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-500 -translate-x-1/2"></div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-semibold">Project Started</p>
                  <p className="text-sm text-gray-500">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-green-500 -translate-x-1/2"></div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-semibold">Current Status</p>
                  <p className="text-sm text-gray-500">
                    {project.status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-purple-500 -translate-x-1/2"></div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-semibold">Project End</p>
                  <p className="text-sm text-gray-500">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Project Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Team Size</p>
              <p className="text-2xl font-semibold">{project.teamMembers.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-2xl font-semibold">
                {Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{project.progress || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 