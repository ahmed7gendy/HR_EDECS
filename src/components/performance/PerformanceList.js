import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const PerformanceList = () => {
  const { t } = useLanguage();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const evaluationsRef = collection(db, 'performance_evaluations');
        const q = query(evaluationsRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        const evaluationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvaluations(evaluationsData);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const columns = [
    { Header: 'Employee Name', accessor: 'employeeName' },
    { Header: 'Department', accessor: 'department' },
    { Header: 'Evaluation Period', accessor: 'period' },
    { Header: 'Due Date', accessor: 'dueDate' },
    { Header: t('status'), accessor: 'status' },
    { Header: 'Overall Rating', accessor: 'overallRating' },
    {
      Header: t('actions'),
      accessor: 'id',
      Cell: ({ value }) => (
        <div className="flex space-x-2">
          <Link to={`/performance/evaluate/${value}`} className="text-blue-500 hover:text-blue-700">
            <PencilIcon className="h-5 w-5" />
          </Link>
          <Link to={`/performance/view/${value}`} className="text-green-500 hover:text-green-700">
            <ChartBarIcon className="h-5 w-5" />
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
  } = useTable({ columns, data: evaluations });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading evaluations...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Evaluations</h1>
        <Link
          to="/performance/schedule"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Schedule Evaluation</span>
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
          <h3 className="text-lg font-semibold mb-2">Pending Evaluations</h3>
          <p className="text-3xl font-bold text-yellow-500">{evaluations.filter(e => e.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Completed This Month</h3>
          <p className="text-3xl font-bold text-green-500">{evaluations.filter(e => e.status === 'completed').length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-blue-500">
            {evaluations.length > 0
              ? (evaluations.reduce((acc, curr) => acc + curr.overallRating, 0) / evaluations.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceList; 