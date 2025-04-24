import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TrainingForm = ({ initialValues = {}, isEdit = false }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Training title is required'),
    type: Yup.string().required('Training type is required'),
    instructor: Yup.string().required('Instructor is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    location: Yup.string().required('Location is required'),
    maxParticipants: Yup.number()
      .required('Maximum participants is required')
      .min(1, 'Must be at least 1'),
    cost: Yup.number().required('Cost is required'),
    description: Yup.string().required('Description is required'),
    objectives: Yup.string().required('Objectives are required'),
  });

  const trainingTypes = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'course', label: 'Course' },
    { value: 'certification', label: 'Certification' },
    { value: 'conference', label: 'Conference' },
  ];

  const handleSubmit = (values, { setSubmitting }) => {
    // Implement save functionality
    console.log('Training details:', values);
    setSubmitting(false);
    navigate('/training');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Training Program' : 'Add Training Program'}
      </h1>

      <Formik
        initialValues={{
          title: '',
          type: '',
          instructor: '',
          startDate: null,
          endDate: null,
          location: '',
          maxParticipants: '',
          cost: '',
          description: '',
          objectives: '',
          ...initialValues,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, setFieldValue, values }) => (
          <Form className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Training Title</label>
                  <Field
                    name="title"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.title && touched.title && (
                    <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Training Type</label>
                  <Field
                    name="type"
                    as="select"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {trainingTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Field>
                  {errors.type && touched.type && (
                    <div className="text-red-500 text-sm mt-1">{errors.type}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Instructor</label>
                  <Field
                    name="instructor"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.instructor && touched.instructor && (
                    <div className="text-red-500 text-sm mt-1">{errors.instructor}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <Field
                    name="location"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.location && touched.location && (
                    <div className="text-red-500 text-sm mt-1">{errors.location}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <DatePicker
                    selected={values.startDate}
                    onChange={date => setFieldValue('startDate', date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                  />
                  {errors.startDate && touched.startDate && (
                    <div className="text-red-500 text-sm mt-1">{errors.startDate}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <DatePicker
                    selected={values.endDate}
                    onChange={date => setFieldValue('endDate', date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    dateFormat="MMMM d, yyyy"
                    minDate={values.startDate || new Date()}
                  />
                  {errors.endDate && touched.endDate && (
                    <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Participants</label>
                  <Field
                    name="maxParticipants"
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.maxParticipants && touched.maxParticipants && (
                    <div className="text-red-500 text-sm mt-1">{errors.maxParticipants}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost</label>
                  <Field
                    name="cost"
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.cost && touched.cost && (
                    <div className="text-red-500 text-sm mt-1">{errors.cost}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Field
                  name="description"
                  as="textarea"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && touched.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
                <Field
                  name="objectives"
                  as="textarea"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.objectives && touched.objectives && (
                  <div className="text-red-500 text-sm mt-1">{errors.objectives}</div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/training')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? t('loading') : t('save')}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TrainingForm; 