import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { initializeDatabase, isDatabaseInitialized } from '../../utils/initialData';

const Setup = () => {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkInitialization = useCallback(async () => {
    try {
      const isInitialized = await isDatabaseInitialized(db);
      if (isInitialized) {
        navigate('/login');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkInitialization();
  }, [checkInitialization]);

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError('');
      await initializeDatabase();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            {initializing ? 'Initializing system...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            System Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Initialize your HR management system
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {initializing ? 'Initializing...' : 'Initialize System'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup; 