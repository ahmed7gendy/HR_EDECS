import React, { useState } from 'react';
import { useTable } from 'react-table';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const JobList = () => {
  const { t } = useLanguage();
  const [jobs] = useState([
    {
      id: 1,
      title: 'Senior Developer',
      department: 'Engineering',
      location: 'Dubai',
      type: 'Full-time',
      status: 'Open',
      applications: 15,
      postedDate: '2024-02-15',
      deadline: '2024-03-15',
    },
    // Add more sample data
  ]);

  const columns = [
    { Header: 'Job Title', accessor: 'title' },
    { Header: t('department'), accessor: 'department' },
    { Header: 'Location', accessor: 'location' },
    { Header: 'Type', accessor: 'type' },
    { Header: t('status'), accessor: 'status' },
    { Header: 'Applications', accessor: 'applications' },
    { Header: 'Posted Date', accessor: 'postedDate' },
    { Header: 'Deadline', accessor: 'deadline' },
    {
      Header: t('actions'),
      accessor: 'id',
      Cell: ({ value }) => (
        <div className="flex space-x-2">
          <Link to={`/recruitment/jobs/edit/${value}`} className="text-blue-500 hover:text-blue-700">
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button onClick={() => handleDelete(value)} className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-5 w-5" />
          </button>
          <Link to={`/recruitment/jobs/${value}/applications`} className="text-green-500 hover:text-green-700">
            View Applications
          </Link>
        </div>
      ),
    },
  ];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: jobs });

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log('Delete job:', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Openings</h1>
        <Link
          to="/recruitment/jobs/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Post New Job</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Open Positions</h3>
          <p className="text-3xl font-bold text-blue-500">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-green-500">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Hired This Month</h3>
          <p className="text-3xl font-bold text-purple-500">3</p>
        </div>
      </div>
    </div>
  );
};

export default JobList; 