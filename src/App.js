import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeList from './components/employees/EmployeeList';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeProfile from './components/employees/EmployeeProfile';
import EmployeeDashboard from './components/employees/EmployeeDashboard';
import EmployeeDocuments from './components/employees/EmployeeDocuments';
import EmployeeHistory from './components/employees/EmployeeHistory';
import AttendanceList from './components/attendance/AttendanceList';
import AttendanceDetails from './components/attendance/AttendanceDetails';
import AttendanceForm from './components/attendance/AttendanceForm';
import PayrollList from './components/payroll/PayrollList';
import PayrollDetails from './components/payroll/PayrollDetails';
import PayrollForm from './components/payroll/PayrollForm';
import PayrollSettings from './components/payroll/PayrollSettings';
import PayrollReports from './components/payroll/PayrollReports';
import LeaveList from './components/leaves/LeaveList';
import LeaveRequest from './components/leaves/LeaveRequest';
import LeaveDetails from './components/leaves/LeaveDetails';
import LeaveTypes from './components/leaves/LeaveTypes';
import JobList from './components/recruitment/JobList';
import JobForm from './components/recruitment/JobForm';
import JobDetails from './components/recruitment/JobDetails';
import JobApplications from './components/recruitment/JobApplications';
import ApplicationDetails from './components/recruitment/ApplicationDetails';
import InterviewScheduling from './components/recruitment/InterviewScheduling';
import InterviewFeedback from './components/recruitment/InterviewFeedback';
import TrainingList from './components/training/TrainingList';
import TrainingForm from './components/training/TrainingForm';
import TrainingDetails from './components/training/TrainingDetails';
import TrainingParticipants from './components/training/TrainingParticipants';
import PerformanceList from './components/performance/PerformanceList';
import PerformanceForm from './components/performance/PerformanceForm';
import PerformanceDetails from './components/performance/PerformanceDetails';
import ScheduleEvaluation from './components/performance/ScheduleEvaluation';
import ProjectDashboard from './components/projects/ProjectDashboard';
import ProjectDetails from './components/projects/ProjectDetails';
import Freelancers from './components/freelancers/Freelancers';
import FreelancerDetails from './components/freelancers/FreelancerDetails';
import Checklists from './components/checklists/Checklists';
import Reports from './components/reports/Reports';
import CompanySettings from './components/settings/CompanySettings';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import NotificationsCenter from './components/notifications/NotificationsCenter';
import HelpCenter from './components/help/HelpCenter';
import UserManagement from './components/admin/UserManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import SystemSettings from './components/admin/SystemSettings';
import PermissionsManagement from './components/admin/PermissionsManagement';
import DepartmentDetails from './components/admin/DepartmentDetails';
import DocumentManagement from './components/documents/DocumentManagement';
import DocumentCategories from './components/documents/DocumentCategories';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import Setup from './components/admin/Setup';
import AdminSignup from './components/auth/AdminSignup';
import './App.css';

function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <Router>
            <Routes>
              <Route path="/setup" element={<Setup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/employees/add" element={<EmployeeForm />} />
                        <Route path="/employees/edit/:id" element={<EmployeeForm isEdit />} />
                        <Route path="/employees/:id" element={<EmployeeProfile />} />
                        <Route path="/employees/:id/dashboard" element={<EmployeeDashboard />} />
                        <Route path="/employees/:id/documents" element={<EmployeeDocuments />} />
                        <Route path="/employees/:id/history" element={<EmployeeHistory />} />
                        <Route path="/attendance" element={<AttendanceList />} />
                        <Route path="/attendance/add" element={<AttendanceForm />} />
                        <Route path="/attendance/edit/:id" element={<AttendanceForm isEdit />} />
                        <Route path="/attendance/:id" element={<AttendanceDetails />} />
                        <Route path="/payroll" element={<PayrollList />} />
                        <Route path="/payroll/add" element={<PayrollForm />} />
                        <Route path="/payroll/edit/:id" element={<PayrollForm isEdit />} />
                        <Route path="/payroll/:id" element={<PayrollDetails />} />
                        <Route path="/payroll/settings" element={<PayrollSettings />} />
                        <Route path="/payroll/reports" element={<PayrollReports />} />
                        <Route path="/leaves" element={<LeaveList />} />
                        <Route path="/leaves/request" element={<LeaveRequest />} />
                        <Route path="/leaves/view/:id" element={<LeaveDetails />} />
                        <Route path="/leaves/types" element={<LeaveTypes />} />
                        <Route path="/recruitment/jobs" element={<JobList />} />
                        <Route path="/recruitment/jobs/add" element={<JobForm />} />
                        <Route path="/recruitment/jobs/edit/:id" element={<JobForm isEdit />} />
                        <Route path="/recruitment/jobs/:id" element={<JobDetails />} />
                        <Route path="/recruitment/jobs/:id/applications" element={<JobApplications />} />
                        <Route path="/recruitment/applications/:id" element={<ApplicationDetails />} />
                        <Route path="/recruitment/applications/:id/schedule-interview" element={<InterviewScheduling />} />
                        <Route path="/recruitment/interviews/:id/feedback" element={<InterviewFeedback />} />
                        <Route path="/training" element={<TrainingList />} />
                        <Route path="/training/add" element={<TrainingForm />} />
                        <Route path="/training/edit/:id" element={<TrainingForm isEdit />} />
                        <Route path="/training/:id" element={<TrainingDetails />} />
                        <Route path="/training/:id/participants" element={<TrainingParticipants />} />
                        <Route path="/performance" element={<PerformanceList />} />
                        <Route path="/performance/evaluate/:id" element={<PerformanceForm />} />
                        <Route path="/performance/view/:id" element={<PerformanceDetails />} />
                        <Route path="/performance/schedule" element={<ScheduleEvaluation />} />
                        <Route path="/projects" element={<ProjectDashboard />} />
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/freelancers" element={<Freelancers />} />
                        <Route path="/freelancers/:id" element={<FreelancerDetails />} />
                        <Route path="/checklists" element={<Checklists />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<CompanySettings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/notifications" element={<NotificationsCenter />} />
                        <Route path="/help" element={<HelpCenter />} />
                        <Route 
                          path="/admin/users" 
                          element={
                            <PrivateRoute requiredRole="admin">
                              <UserManagement />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/admin/departments" 
                          element={
                            <PrivateRoute requiredRole="admin">
                              <DepartmentManagement />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/admin/departments/:id" 
                          element={
                            <PrivateRoute requiredRole="admin">
                              <DepartmentDetails />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/admin/settings" 
                          element={
                            <PrivateRoute requiredRole="admin">
                              <SystemSettings />
                            </PrivateRoute>
                          } 
                        />
                        <Route 
                          path="/admin/permissions" 
                          element={
                            <PrivateRoute requiredRole="admin">
                              <PermissionsManagement />
                            </PrivateRoute>
                          } 
                        />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

// Update your router configuration to use the future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
]);

export default App; 