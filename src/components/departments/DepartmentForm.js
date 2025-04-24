import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from '../../contexts/LanguageContext';
import DepartmentModel from '../../models/Department';
import EmployeeModel from '../../models/Employee';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: '',
    code: '',
    description: '',
    managerId: '',
    budget: {
      amount: 0,
      currency: 'USD',
      fiscalYear: new Date().getFullYear()
    },
    goals: []
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(translations.required_field),
    code: Yup.string().required(translations.required_field),
    description: Yup.string(),
    managerId: Yup.string(),
    budget: Yup.object().shape({
      amount: Yup.number().min(0),
      currency: Yup.string().required(),
      fiscalYear: Yup.number().required()
    }),
    goals: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string(),
        targetDate: Yup.date(),
        status: Yup.string()
      })
    )
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load potential managers
        const managersData = await EmployeeModel.getByRole('manager');
        setManagers(managersData);

        // If editing, load department data
        if (id) {
          const departmentData = await DepartmentModel.getById(id);
          if (!departmentData) {
            throw new Error('Department not found');
          }
          setInitialValues(departmentData);
        }
      } catch (err) {
        console.error('Error loading department data:', err);
        setError(translations.error_loading_department);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, translations]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await DepartmentModel.update(id, values);
        
        // Update manager if changed
        if (values.managerId !== initialValues.managerId) {
          await DepartmentModel.setManager(id, values.managerId);
        }
      } else {
        const departmentId = await DepartmentModel.create(values);
        if (values.managerId) {
          await DepartmentModel.setManager(departmentId, values.managerId);
        }
      }

      navigate('/departments');
    } catch (err) {
      console.error('Error saving department:', err);
      setError(translations.error_saving_department);
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {id ? translations.edit_department : translations.add_department}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Field
                      name="name"
                      as={TextField}
                      fullWidth
                      label={translations.department_name}
                      error={touched.name && errors.name}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      name="code"
                      as={TextField}
                      fullWidth
                      label={translations.department_code}
                      error={touched.code && errors.code}
                      helperText={touched.code && errors.code}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      name="description"
                      as={TextField}
                      fullWidth
                      multiline
                      rows={3}
                      label={translations.description}
                      error={touched.description && errors.description}
                      helperText={touched.description && errors.description}
                    />
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

                  <Grid item xs={12} md={6}>
                    <Field
                      name="budget.amount"
                      as={TextField}
                      fullWidth
                      type="number"
                      label={translations.budget_amount}
                      error={touched.budget?.amount && errors.budget?.amount}
                      helperText={touched.budget?.amount && errors.budget?.amount}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{translations.currency}</InputLabel>
                      <Field
                        name="budget.currency"
                        as={Select}
                        label={translations.currency}
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      name="budget.fiscalYear"
                      as={TextField}
                      fullWidth
                      type="number"
                      label={translations.fiscal_year}
                      error={touched.budget?.fiscalYear && errors.budget?.fiscalYear}
                      helperText={touched.budget?.fiscalYear && errors.budget?.fiscalYear}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {translations.department_goals}
                    </Typography>
                    {values.goals.map((goal, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Field
                              name={`goals.${index}.title`}
                              as={TextField}
                              fullWidth
                              label={translations.goal_title}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field
                              name={`goals.${index}.description`}
                              as={TextField}
                              fullWidth
                              multiline
                              rows={2}
                              label={translations.goal_description}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        const goals = [...values.goals];
                        goals.push({
                          title: '',
                          description: '',
                          targetDate: null,
                          status: 'pending'
                        });
                        setFieldValue('goals', goals);
                      }}
                    >
                      {translations.add_goal}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate('/departments')}
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepartmentForm; 