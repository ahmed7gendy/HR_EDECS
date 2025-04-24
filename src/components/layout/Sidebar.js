import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: '📊' },
    { title: 'Employees', path: '/employees', icon: '👥' },
    { title: 'Attendance', path: '/attendance', icon: '⏰' },
    { title: 'Payroll', path: '/payroll', icon: '💰' },
    { title: 'Leave Management', path: '/leaves', icon: '📅' },
    { title: 'Recruitment', path: '/recruitment', icon: '📝' },
    { title: 'Training', path: '/training', icon: '🎓' },
    { title: 'Performance', path: '/performance', icon: '📈' },
    { title: 'Documents', path: '/documents', icon: '📁' },
    { title: 'Projects', path: '/projects', icon: '🏗️' },
    { title: 'Freelancers', path: '/freelancers', icon: '👨‍💼' },
    { title: 'Checklists', path: '/checklists', icon: '✅' },
    { title: 'Reports', path: '/reports', icon: '📊' },
    { title: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="text-2xl font-bold mb-8">HR System</div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg mb-2"
          >
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 