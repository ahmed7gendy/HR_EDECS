import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const PerformanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        const evaluationDoc = await getDoc(doc(db, 'performance_evaluations', id));
        if (evaluationDoc.exists()) {
          setEvaluation({ id: evaluationDoc.id, ...evaluationDoc.data() });
        } else {
          setError('Evaluation not found');
        }
      } catch (err) {
        setError('Error fetching evaluation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationDetails();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!evaluation) return <div className="p-4">Evaluation not found</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Performance Evaluation Details</h2>
          <button
            onClick={() => navigate('/performance')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Employee Name</p>
                <p>{evaluation.employeeName}</p>
              </div>
              <div>
                <p className="font-semibold">Department</p>
                <p>{evaluation.department}</p>
              </div>
              <div>
                <p className="font-semibold">Position</p>
                <p>{evaluation.position}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Evaluation Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Evaluation Period</p>
                <p>{evaluation.evaluationPeriod}</p>
              </div>
              <div>
                <p className="font-semibold">Evaluator</p>
                <p>{evaluation.evaluatorName}</p>
              </div>
              <div>
                <p className="font-semibold">Evaluation Date</p>
                <p>{new Date(evaluation.evaluationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {evaluation.metrics.map((metric, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">{metric.name}</p>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    metric.score >= 4 ? 'bg-green-100 text-green-800' :
                    metric.score >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {metric.score}/5
                  </span>
                </div>
                <p className="text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Overall Assessment</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Strengths</p>
              <p className="mt-2">{evaluation.strengths}</p>
            </div>
            <div>
              <p className="font-semibold">Areas for Improvement</p>
              <p className="mt-2">{evaluation.areasForImprovement}</p>
            </div>
            <div>
              <p className="font-semibold">Goals for Next Period</p>
              <p className="mt-2">{evaluation.nextPeriodGoals}</p>
            </div>
          </div>
        </div>

        {evaluation.comments && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Additional Comments</h3>
            <p>{evaluation.comments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDetails; 