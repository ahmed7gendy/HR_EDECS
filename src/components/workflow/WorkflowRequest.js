import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowRequest = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [request, setRequest] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: '',
    currency: 'USD',
    attachments: []
  });
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const workflowsData = await WorkflowManager.getWorkflowsByType('leave');
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleWorkflowSelect = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow);
    setCurrentStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setRequest(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleRemoveFile = (index) => {
    setRequest(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await WorkflowManager.createWorkflowRequest(selectedWorkflow.id, request);
      navigate('/workflows/history');
    } catch (error) {
      console.error('Error creating workflow request:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
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
          </Box>

          <Stepper activeStep={currentStep} orientation="vertical">
            <Step>
              <StepLabel>Select Workflow</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  {workflows.map((workflow) => (
                    <Grid item xs={12} md={6} key={workflow.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                        onClick={() => handleWorkflowSelect(workflow.id)}
                      >
                        <Typography variant="h6">
                          {workflow.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {workflow.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={workflow.type} 
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={workflow.status} 
                            color={workflow.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Request Details</StepLabel>
              <StepContent>
                {selectedWorkflow && (
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          {selectedWorkflow.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {selectedWorkflow.description}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Request Title"
                          name="title"
                          value={request.title}
                          onChange={handleInputChange}
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name="description"
                          value={request.description}
                          onChange={handleInputChange}
                          multiline
                          rows={3}
                          required
                        />
                      </Grid>

                      {selectedWorkflow.type === 'leave' && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Start Date"
                              name="startDate"
                              type="date"
                              value={request.startDate}
                              onChange={handleInputChange}
                              InputLabelProps={{ shrink: true }}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="End Date"
                              name="endDate"
                              type="date"
                              value={request.endDate}
                              onChange={handleInputChange}
                              InputLabelProps={{ shrink: true }}
                              required
                            />
                          </Grid>
                        </>
                      )}

                      {selectedWorkflow.type === 'expense' && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Amount"
                              name="amount"
                              type="number"
                              value={request.amount}
                              onChange={handleInputChange}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Currency</InputLabel>
                              <Select
                                name="currency"
                                value={request.currency}
                                onChange={handleInputChange}
                                label="Currency"
                              >
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="GBP">GBP</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}

                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                        >
                          Upload Attachments
                          <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileChange}
                          />
                        </Button>
                      </Grid>

                      {request.attachments.length > 0 && (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Attachments
                            </Typography>
                            {request.attachments.map((file, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 1
                                }}
                              >
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {file.name}
                                </Typography>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  Remove
                                </Button>
                              </Box>
                            ))}
                          </Paper>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setCurrentStep(0)}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                          >
                            Submit Request
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkflowRequest; 