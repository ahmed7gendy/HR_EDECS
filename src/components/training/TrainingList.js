import React, { useState } from 'react';
import { useTable } from 'react-table';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TrainingList = () => {
  const { t } = useLanguage();
  const [trainings] = useState([
    {
      id: 1,
      title: 'Leadership Skills',
      type: 'Workshop',
      instructor: 'Dr. Sarah Johnson',
      startDate: '2024-03-15',
      endDate: '2024-03-16',
      location: 'Training Room A',
      participants: 15,
      status: 'Upcoming',
      cost: 5000,
    },
    // Add more sample data
  ]);

  const columns = [
    { Header: 'Training Title', accessor: 'title' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Instructor', accessor: 'instructor' },
    { Header: 'Start Date', accessor: 'startDate' },
    { Header: 'End Date', accessor: 'endDate' },
    { Header: 'Location', accessor: 'location' },
    { Header: 'Participants', accessor: 'participants' },
    { Header: t('status'), accessor: 'status' },
    { Header: 'Cost', accessor: 'cost' },
    {
      Header: t('actions'),
      accessor: 'id',
      Cell: ({ value }) => (
        <div className="flex space-x-2">
          <Link to={`/training/edit/${value}`} className="text-blue-500 hover:text-blue-700">
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button onClick={() => handleDelete(value)} className="text-red-500 hover:text-red-700">
            <TrashIcon className="h-5 w-5" />
          </button>
          <Link to={`/training/${value}/participants`} className="text-green-500 hover:text-green-700">
            <UserGroupIcon className="h-5 w-5" />
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
  } = useTable({ columns, data: trainings });

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log('Delete training:', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Training Programs</h1>
        <Link
          to="/training/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Training Program</span>
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
          <h3 className="text-lg font-semibold mb-2">Upcoming Trainings</h3>
          <p className="text-3xl font-bold text-blue-500">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Active Participants</h3>
          <p className="text-3xl font-bold text-green-500">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Completed This Month</h3>
          <p className="text-3xl font-bold text-purple-500">3</p>
        </div>
      </div>
    </div>
  );
};

export default TrainingList; 