import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeModel from '../../models/Employee';
import DepartmentModel from '../../models/Department';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const EmployeeForm = ({ initialValues = {}, isEdit = false }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { translations } = useLanguage();
  const { theme } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(translations.required_field),
    email: Yup.string().email(translations.invalid_email).required(translations.required_field),
    department: Yup.string().required(translations.required_field),
    position: Yup.string().required(translations.required_field),
    status: Yup.string().required(translations.required_field),
    joinDate: Yup.date().required(translations.required_field),
    salary: Yup.number().required(translations.required_field),
    phone: Yup.string().required(translations.required_field),
    address: Yup.string().required(translations.required_field),
    employmentType: Yup.string().required(translations.required_field),
    managerId: Yup.string(),
    emergencyContact: Yup.object().shape({
      name: Yup.string().required(translations.required_field),
      phone: Yup.string().required(translations.required_field),
      relationship: Yup.string().required(translations.required_field)
    })
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load departments
        const deptData = await DepartmentModel.getAll();
        setDepartments(deptData);

        // Load potential managers (employees with management roles)
        const managersData = await EmployeeModel.getByRole('manager');
        setManagers(managersData);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError(translations.error_loading_data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [translations]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await EmployeeModel.update(initialValues.id, values);
        
        // Update department assignment if changed
        if (values.department !== initialValues.department) {
          await DepartmentModel.removeEmployee(initialValues.department, initialValues.id);
          await DepartmentModel.addEmployee(values.department, initialValues.id);
        }
      } else {
        const employeeId = await EmployeeModel.create(values);
        await DepartmentModel.addEmployee(values.department, employeeId);
      }

      navigate('/employees');
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(translations.error_saving_employee);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? translations.edit_employee : translations.add_employee}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{
          name: '',
          email: '',
          department: '',
          position: '',
          status: 'Active',
          joinDate: '',
          salary: '',
          phone: '',
          address: '',
          employmentType: 'Full-time',
          managerId: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          ...initialValues
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field
                  name="name"
                  as={TextField}
                  fullWidth
                  label={translations.name}
                  error={touched.name && errors.name}
                  helperText={touched.name && errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  name="email"
                  as={TextField}
                  fullWidth
                  label={translations.email}
                  error={touched.email && errors.email}
                  helperText={touched.email && errors.email}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={touched.department && errors.department}>
                  <InputLabel>{translations.department}</InputLabel>
                  <Field
                    name="department"
                    as={Select}
                    label={translations.department}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  name="position"
                  as={TextField}
                  fullWidth
                  label={translations.position}
                  error={touched.position && errors.position}
                  helperText={touched.position && errors.position}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={touched.status && errors.status}>
                  <InputLabel>{translations.status}</InputLabel>
                  <Field
                    name="status"
                    as={Select}
                    label={translations.status}
                  >
                    <MenuItem value="Active">{translations.active}</MenuItem>
                    <MenuItem value="On Leave">{translations.on_leave}</MenuItem>
                    <MenuItem value="Inactive">{translations.inactive}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  name="joinDate"
                  as={TextField}
                  fullWidth
                  type="date"
                  label={translations.join_date}
                  InputLabelProps={{ shrink: true }}
                  error={touched.joinDate && errors.joinDate}
                  helperText={touched.joinDate && errors.joinDate}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  name="salary"
                  as={TextField}
                  fullWidth
                  type="number"
                  label={translations.salary}
                  error={touched.salary && errors.salary}
                  helperText={touched.salary && errors.salary}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  name="phone"
                  as={TextField}
                  fullWidth
                  label={translations.phone}
                  error={touched.phone && errors.phone}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  name="address"
                  as={TextField}
                  fullWidth
                  multiline
                  rows={3}
                  label={translations.address}
                  error={touched.address && errors.address}
                  helperText={touched.address && errors.address}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={touched.employmentType && errors.employmentType}>
                  <InputLabel>{translations.employment_type}</InputLabel>
                  <Field
                    name="employmentType"
                    as={Select}
                    label={translations.employment_type}
                  >
                    <MenuItem value="Full-time">{translations.full_time}</MenuItem>
                    <MenuItem value="Part-time">{translations.part_time}</MenuItem>
                    <MenuItem value="Contract">{translations.contract}</MenuItem>
                    <MenuItem value="Intern">{translations.intern}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{translations.manager}</InputLabel>
                  <Field
                    name="managerId"
                    as={Select}
                    label={translations.manager}
                  >
                    <MenuItem value="">{translations.no_manager}</MenuItem>
                    {managers.map(manager => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {translations.emergency_contact}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Field
                  name="emergencyContact.name"
                  as={TextField}
                  fullWidth
                  label={translations.contact_name}
                  error={touched.emergencyContact?.name && errors.emergencyContact?.name}
                  helperText={touched.emergencyContact?.name && errors.emergencyContact?.name}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Field
                  name="emergencyContact.phone"
                  as={TextField}
                  fullWidth
                  label={translations.contact_phone}
                  error={touched.emergencyContact?.phone && errors.emergencyContact?.phone}
                  helperText={touched.emergencyContact?.phone && errors.emergencyContact?.phone}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Field
                  name="emergencyContact.relationship"
                  as={TextField}
                  fullWidth
                  label={translations.contact_relationship}
                  error={touched.emergencyContact?.relationship && errors.emergencyContact?.relationship}
                  helperText={touched.emergencyContact?.relationship && errors.emergencyContact?.relationship}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/employees')}
                  >
                    {translations.cancel}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? translations.saving : translations.save}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default EmployeeForm; 