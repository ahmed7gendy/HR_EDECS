import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LeaveModel from '../../models/Leave';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { differenceInDays, addDays } from 'date-fns';

const LeaveRequestForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { translations } = useLanguage();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validationSchema = Yup.object().shape({
    type: Yup.string().required(translations.required_field),
    startDate: Yup.date()
      .required(translations.required_field)
      .min(new Date(), translations.future_date_required),
    endDate: Yup.date()
      .required(translations.required_field)
      .min(Yup.ref('startDate'), translations.end_date_after_start),
    reason: Yup.string().required(translations.required_field),
    attachments: Yup.array()
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load leave types
        const types = await LeaveModel.getLeaveTypes();
        setLeaveTypes(types);

        // Load leave balances for each type
        const balances = {};
        const currentYear = new Date().getFullYear().toString();
        
        for (const type of types) {
          const balance = await LeaveModel.getLeaveBalance(
            currentUser.uid,
            type.id,
            currentYear
          );
          balances[type.id] = balance;
        }
        setLeaveBalances(balances);
      } catch (err) {
        console.error('Error loading leave data:', err);
        setError(translations.error_loading_leave_data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser.uid, translations]);

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const duration = calculateDuration(values.startDate, values.endDate);
      
      // Check leave balance
      const balance = leaveBalances[values.type];
      if (!balance || balance.remaining < duration) {
        setError(translations.insufficient_leave_balance);
        return;
      }

      // Create leave request
      await LeaveModel.requestLeave({
        employeeId: currentUser.uid,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        duration,
        reason: values.reason,
        attachments: values.attachments || []
      });

      navigate('/leaves');
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(translations.error_submitting_leave);
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
        {translations.request_leave}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Formik
            initialValues={{
              type: '',
              startDate: null,
              endDate: null,
              reason: '',
              attachments: []
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.type && errors.type}>
                      <InputLabel>{translations.leave_type}</InputLabel>
                      <Field
                        name="type"
                        as={Select}
                        label={translations.leave_type}
                      >
                        {leaveTypes.map(type => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name} ({leaveBalances[type.id]?.remaining || 0} {translations.days_remaining})
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label={translations.start_date}
                      value={values.startDate}
                      onChange={(date) => setFieldValue('startDate', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={touched.startDate && errors.startDate}
                          helperText={touched.startDate && errors.startDate}
                        />
                      )}
                      minDate={addDays(new Date(), 1)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label={translations.end_date}
                      value={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={touched.endDate && errors.endDate}
                          helperText={touched.endDate && errors.endDate}
                        />
                      )}
                      minDate={values.startDate || addDays(new Date(), 1)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      name="reason"
                      as={TextField}
                      fullWidth
                      multiline
                      rows={4}
                      label={translations.reason}
                      error={touched.reason && errors.reason}
                      helperText={touched.reason && errors.reason}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <input
                      type="file"
                      multiple
                      onChange={(event) => {
                        setFieldValue('attachments', Array.from(event.target.files));
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate('/leaves')}
                      >
                        {translations.cancel}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      >
                        {isSubmitting ? translations.submitting : translations.submit}
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

export default LeaveRequestForm; 