import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    employeeStats: {
      total: 0,
      byDepartment: {},
      byRole: {}
    },
    leaveStats: {
      total: 0,
      byType: {},
      byStatus: {}
    },
    projectStats: {
      total: 0,
      byStatus: {},
      byDepartment: {}
    },
    recruitmentStats: {
      total: 0,
      byStatus: {},
      byDepartment: {}
    },
    performanceStats: {
      average: 0,
      byDepartment: {}
    }
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        // Fetch employee statistics
        const employeesQuery = query(collection(db, 'users'));
        const employeesSnapshot = await getDocs(employeesQuery);
        const employees = employeesSnapshot.docs.map(doc => doc.data());
        
        const employeeStats = {
          total: employees.length,
          byDepartment: {},
          byRole: {}
        };

        employees.forEach(employee => {
          // Count by department
          if (employee.department) {
            employeeStats.byDepartment[employee.department] = 
              (employeeStats.byDepartment[employee.department] || 0) + 1;
          }
          // Count by role
          if (employee.role) {
            employeeStats.byRole[employee.role] = 
              (employeeStats.byRole[employee.role] || 0) + 1;
          }
        });

        // Fetch leave statistics
        const leavesQuery = query(collection(db, 'leaves'));
        const leavesSnapshot = await getDocs(leavesQuery);
        const leaves = leavesSnapshot.docs.map(doc => doc.data());
        
        const leaveStats = {
          total: leaves.length,
          byType: {},
          byStatus: {}
        };

        leaves.forEach(leave => {
          // Count by type
          if (leave.type) {
            leaveStats.byType[leave.type] = 
              (leaveStats.byType[leave.type] || 0) + 1;
          }
          // Count by status
          if (leave.status) {
            leaveStats.byStatus[leave.status] = 
              (leaveStats.byStatus[leave.status] || 0) + 1;
          }
        });

        // Fetch project statistics
        const projectsQuery = query(collection(db, 'projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => doc.data());
        
        const projectStats = {
          total: projects.length,
          byStatus: {},
          byDepartment: {}
        };

        projects.forEach(project => {
          // Count by status
          if (project.status) {
            projectStats.byStatus[project.status] = 
              (projectStats.byStatus[project.status] || 0) + 1;
          }
          // Count by department
          if (project.department) {
            projectStats.byDepartment[project.department] = 
              (projectStats.byDepartment[project.department] || 0) + 1;
          }
        });

        // Fetch recruitment statistics
        const jobsQuery = query(collection(db, 'jobs'));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map(doc => doc.data());
        
        const recruitmentStats = {
          total: jobs.length,
          byStatus: {},
          byDepartment: {}
        };

        jobs.forEach(job => {
          // Count by status
          if (job.status) {
            recruitmentStats.byStatus[job.status] = 
              (recruitmentStats.byStatus[job.status] || 0) + 1;
          }
          // Count by department
          if (job.department) {
            recruitmentStats.byDepartment[job.department] = 
              (recruitmentStats.byDepartment[job.department] || 0) + 1;
          }
        });

        // Fetch performance statistics
        const performanceQuery = query(collection(db, 'performance'));
        const performanceSnapshot = await getDocs(performanceQuery);
        const performances = performanceSnapshot.docs.map(doc => doc.data());
        
        const performanceStats = {
          average: 0,
          byDepartment: {}
        };

        let totalRating = 0;
        performances.forEach(performance => {
          if (performance.rating) {
            totalRating += performance.rating;
          }
          if (performance.department) {
            if (!performanceStats.byDepartment[performance.department]) {
              performanceStats.byDepartment[performance.department] = {
                total: 0,
                count: 0
              };
            }
            performanceStats.byDepartment[performance.department].total += performance.rating || 0;
            performanceStats.byDepartment[performance.department].count += 1;
          }
        });

        performanceStats.average = performances.length > 0 ? totalRating / performances.length : 0;

        // Calculate department averages
        Object.keys(performanceStats.byDepartment).forEach(dept => {
          const deptStats = performanceStats.byDepartment[dept];
          performanceStats.byDepartment[dept] = deptStats.count > 0 ? 
            deptStats.total / deptStats.count : 0;
        });

        setReportData({
          employeeStats,
          leaveStats,
          projectStats,
          recruitmentStats,
          performanceStats
        });
      } catch (error) {
        setError('Failed to load report data');
      }
      setLoading(false);
    }

    fetchReportData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  // Chart configurations
  const employeeByDepartmentChart = {
    labels: Object.keys(reportData.employeeStats.byDepartment),
    datasets: [
      {
        label: 'Employees by Department',
        data: Object.values(reportData.employeeStats.byDepartment),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const leaveByTypeChart = {
    labels: Object.keys(reportData.leaveStats.byType),
    datasets: [
      {
        label: 'Leaves by Type',
        data: Object.values(reportData.leaveStats.byType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  const projectByStatusChart = {
    labels: Object.keys(reportData.projectStats.byStatus),
    datasets: [
      {
        label: 'Projects by Status',
        data: Object.values(reportData.projectStats.byStatus),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const performanceByDepartmentChart = {
    labels: Object.keys(reportData.performanceStats.byDepartment),
    datasets: [
      {
        label: 'Average Performance by Department',
        data: Object.values(reportData.performanceStats.byDepartment),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Employee Statistics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Employee Statistics</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Employees: {reportData.employeeStats.total}</p>
                <div className="mt-4">
                  <Bar data={employeeByDepartmentChart} />
                </div>
              </div>
            </div>
          </div>

          {/* Leave Statistics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Leave Statistics</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Leaves: {reportData.leaveStats.total}</p>
                <div className="mt-4">
                  <Pie data={leaveByTypeChart} />
                </div>
              </div>
            </div>
          </div>

          {/* Project Statistics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Project Statistics</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Projects: {reportData.projectStats.total}</p>
                <div className="mt-4">
                  <Bar data={projectByStatusChart} />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Performance Statistics</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Average Performance: {reportData.performanceStats.average.toFixed(2)}
                </p>
                <div className="mt-4">
                  <Line data={performanceByDepartmentChart} />
                </div>
              </div>
            </div>
          </div>

          {/* Recruitment Statistics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Recruitment Statistics</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Jobs: {reportData.recruitmentStats.total}</p>
                <div className="mt-4">
                  <Bar data={{
                    labels: Object.keys(reportData.recruitmentStats.byStatus),
                    datasets: [{
                      label: 'Jobs by Status',
                      data: Object.values(reportData.recruitmentStats.byStatus),
                      backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    }],
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports; 