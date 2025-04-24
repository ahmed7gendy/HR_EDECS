import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const PerformanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    evaluationDate: new Date().toISOString().split('T')[0],
    overallRating: 5,
    categories: {
      jobKnowledge: 5,
      workQuality: 5,
      attendance: 5,
      communication: 5,
      teamwork: 5,
      initiative: 5,
      problemSolving: 5,
      leadership: 5
    },
    strengths: '',
    areasForImprovement: '',
    goals: '',
    comments: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const employeeDoc = await getDoc(doc(db, 'employees', id));
        if (employeeDoc.exists()) {
          setEmployee({ id: employeeDoc.id, ...employeeDoc.data() });
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        setError('Error fetching employee data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: parseInt(value)
      }
    }));
  };

  const calculateOverallRating = () => {
    const categories = Object.values(formData.categories);
    const sum = categories.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / categories.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const overallRating = calculateOverallRating();
      const evaluationData = {
        ...formData,
        overallRating,
        employeeId: id,
        employeeName: employee.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'performanceEvaluations'), evaluationData);
      navigate('/performance');
    } catch (err) {
      setError('Error saving evaluation');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!employee) return <div className="p-4">Employee not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Performance Evaluation</h2>
          <button
            onClick={() => navigate('/performance')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Employee Information</h3>
          <p className="text-gray-600">{employee.name}</p>
          <p className="text-gray-600">{employee.position}</p>
          <p className="text-gray-600">{employee.department}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Evaluation Date</label>
            <input
              type="date"
              name="evaluationDate"
              value={formData.evaluationDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.categories).map(([category, value]) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700">
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => handleCategoryChange(category, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} - {rating === 1 ? 'Poor' : rating === 2 ? 'Below Average' : rating === 3 ? 'Average' : rating === 4 ? 'Above Average' : 'Excellent'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Strengths</label>
            <textarea
              name="strengths"
              value={formData.strengths}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Areas for Improvement</label>
            <textarea
              name="areasForImprovement"
              value={formData.areasForImprovement}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceForm; 