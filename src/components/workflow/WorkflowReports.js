import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [workflowType, setWorkflowType] = useState('');
  const [reportData, setReportData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadReport();
  }, [reportType, dateRange, workflowType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await WorkflowManager.getWorkflowReport({
        type: reportType,
        dateRange,
        workflowType
      });
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
      setSnackbar({
        open: true,
        message: 'Error loading report',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkflowTypeChange = (e) => {
    setWorkflowType(e.target.value);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await WorkflowManager.generateWorkflowReport({
        type: reportType,
        dateRange,
        workflowType
      });
      setSnackbar({
        open: true,
        message: 'Report generated successfully',
        severity: 'success'
      });
      loadReport();
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message: 'Error generating report',
        severity: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await WorkflowManager.downloadWorkflowReport({
        type: reportType,
        dateRange,
        workflowType
      });
      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading report',
        severity: 'error'
      });
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'summary':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4">
                  {reportData.totalRequests}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Average Processing Time
                </Typography>
                <Typography variant="h4">
                  {reportData.averageProcessingTime} days
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Approval Rate
                </Typography>
                <Typography variant="h4">
                  {reportData.approvalRate}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );

      case 'detailed':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Requested At</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell>Processing Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt?.seconds * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {request.completedAt ? new Date(request.completedAt?.seconds * 1000).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {request.processingTime} days
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'analytics':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Request Distribution
                </Typography>
                {/* Add chart component here */}
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChartIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Status Distribution
                </Typography>
                {/* Add chart component here */}
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChartIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Processing Time Trend
                </Typography>
                {/* Add chart component here */}
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TimelineIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBack}
            >
              Back to Workflows
            </Button>
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadReport}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReport}
                variant="contained"
              >
                Download Report
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={handleReportTypeChange}
                  label="Report Type"
                >
                  <MenuItem value="summary">Summary</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Workflow Type</InputLabel>
                <Select
                  value={workflowType}
                  onChange={handleWorkflowTypeChange}
                  label="Workflow Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="leave">Leave</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={generating}
              >
                Generate Report
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start"
                type="date"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end"
                type="date"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              {renderReportContent()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowReports; 