import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const JobForm = ({ initialValues = {}, isEdit = false }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Job title is required'),
    department: Yup.string().required('Department is required'),
    location: Yup.string().required('Location is required'),
    type: Yup.string().required('Job type is required'),
    description: Yup.string().required('Job description is required'),
    requirements: Yup.string().required('Requirements are required'),
    salary: Yup.string().required('Salary range is required'),
    deadline: Yup.date().required('Application deadline is required'),
  });

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const handleSubmit = (values, { setSubmitting }) => {
    // Implement save functionality
    console.log('Job details:', values);
    setSubmitting(false);
    navigate('/recruitment/jobs');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Job Posting' : 'Post New Job'}
      </h1>

      <Formik
        initialValues={{
          title: '',
          department: '',
          location: '',
          type: '',
          description: '',
          requirements: '',
          salary: '',
          deadline: null,
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
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
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
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <Field
                    name="department"
                    as="select"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </Field>
                  {errors.department && touched.department && (
                    <div className="text-red-500 text-sm mt-1">{errors.department}</div>
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
                  <label className="block text-sm font-medium text-gray-700">Job Type</label>
                  <Field
                    name="type"
                    as="select"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Job Type</option>
                    {jobTypes.map(type => (
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
                  <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                  <Field
                    name="salary"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.salary && touched.salary && (
                    <div className="text-red-500 text-sm mt-1">{errors.salary}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                  <DatePicker
                    selected={values.deadline}
                    onChange={date => setFieldValue('deadline', date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                  />
                  {errors.deadline && touched.deadline && (
                    <div className="text-red-500 text-sm mt-1">{errors.deadline}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Description</label>
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
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                <Field
                  name="requirements"
                  as="textarea"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.requirements && touched.requirements && (
                  <div className="text-red-500 text-sm mt-1">{errors.requirements}</div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/recruitment/jobs')}
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

export default JobForm; 