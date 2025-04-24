import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import PayrollModel from '../../models/Payroll';
import EmployeeModel from '../../models/Employee';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { ArrowBack, Print, GetApp } from '@mui/icons-material';

const PayrollView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const { theme } = useTheme();
  const [payroll, setPayroll] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load payroll record
        const payrollDoc = await PayrollModel.getById(id);
        if (!payrollDoc) {
          throw new Error('Payroll record not found');
        }
        setPayroll(payrollDoc);

        // Load employee details
        const employeeDoc = await EmployeeModel.getById(payrollDoc.employeeId);
        if (!employeeDoc) {
          throw new Error('Employee not found');
        }
        setEmployee(employeeDoc);
      } catch (err) {
        console.error('Error loading payroll data:', err);
        setError(translations.error_loading_payroll);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, translations]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/payroll')}
          sx={{ mt: 2 }}
        >
          {translations.back_to_payroll}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{translations.payroll_details}</Typography>
        <Box>
          <Button
            startIcon={<Print />}
            variant="outlined"
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            {translations.print}
          </Button>
          <Button
            startIcon={<GetApp />}
            variant="outlined"
            onClick={handleDownload}
          >
            {translations.download}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translations.employee_information}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.name}</Typography>
                  <Typography>{employee?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.employee_id}</Typography>
                  <Typography>{employee?.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.department}</Typography>
                  <Typography>{employee?.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.position}</Typography>
                  <Typography>{employee?.position}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translations.payroll_information}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.period}</Typography>
                  <Typography>{payroll?.period}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">{translations.payment_date}</Typography>
                  <Typography>
                    {payroll?.paymentDate?.toDate().toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{translations.description}</TableCell>
                      <TableCell align="right">{translations.amount}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{translations.base_salary}</TableCell>
                      <TableCell align="right">
                        {payroll?.baseSalary.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{translations.overtime}</TableCell>
                      <TableCell align="right">
                        {payroll?.overtime.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{translations.bonus}</TableCell>
                      <TableCell align="right">
                        {payroll?.bonus.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {translations.gross_pay}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {(payroll?.baseSalary + payroll?.overtime + payroll?.bonus).toLocaleString()}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                          {translations.deductions}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {payroll?.taxDetails && (
                      <>
                        <TableRow>
                          <TableCell>{translations.income_tax}</TableCell>
                          <TableCell align="right">
                            -{payroll.taxDetails.incomeTax.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{translations.social_security}</TableCell>
                          <TableCell align="right">
                            -{payroll.taxDetails.socialSecurity.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                    {Object.entries(payroll?.benefits || {}).map(([type, benefit]) => (
                      <TableRow key={type}>
                        <TableCell>{translations[type] || type}</TableCell>
                        <TableCell align="right">
                          -{benefit.employeeContribution.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {translations.total_deductions}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        -{payroll?.deductions.toLocaleString()}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {translations.net_pay}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {payroll?.netPay.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/payroll')}
        >
          {translations.back_to_payroll}
        </Button>
      </Box>
    </Box>
  );
};

export default PayrollView; 