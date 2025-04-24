import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [comments, setComments] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    loadWorkflowData();
  }, [id]);

  const loadWorkflowData = async () => {
    try {
      const [workflowData, approvalsData] = await Promise.all([
        WorkflowManager.getWorkflow(id),
        WorkflowManager.getWorkflowApprovals(id)
      ]);

      setWorkflow(workflowData);
      setApprovals(approvalsData);

      // Find the current step that needs approval
      const currentStepIndex = workflowData.steps.findIndex(step => {
        const stepApprovals = approvalsData.filter(a => a.stepId === step.id);
        return stepApprovals.length === 0 || stepApprovals.some(a => a.status === 'pending');
      });

      if (currentStepIndex !== -1) {
        setCurrentStep(workflowData.steps[currentStepIndex]);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const getStepStatus = (step, approvals) => {
    const stepApprovals = approvals.filter(a => a.stepId === step.id);
    if (stepApprovals.some(a => a.status === 'rejected')) return 'rejected';
    if (stepApprovals.every(a => a.status === 'approved')) return 'approved';
    if (stepApprovals.some(a => a.status === 'pending')) return 'pending';
    return 'not_started';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleApprove = () => {
    setAction('approve');
    setConfirmDialogOpen(true);
  };

  const handleReject = () => {
    setAction('reject');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      await WorkflowManager.updateWorkflowApproval(id, currentStep.id, {
        status: action,
        comments: comments
      });
      setConfirmDialogOpen(false);
      loadWorkflowData();
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!workflow) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Workflow not found</Typography>
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

          <Grid container spacing={3}>
            {/* Workflow Details */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {workflow.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {workflow.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={workflow.type} 
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={workflow.status} 
                  color={getStatusColor(workflow.status)}
                  size="small"
                />
              </Box>
            </Grid>

            {/* Workflow Steps */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Workflow Steps
                </Typography>
                <Stepper orientation="vertical">
                  {workflow.steps.map((step, index) => {
                    const stepStatus = getStepStatus(step, approvals);
                    return (
                      <Step key={step.id} active={stepStatus !== 'not_started'}>
                        <StepLabel
                          icon={getStatusIcon(stepStatus)}
                          optional={
                            <Chip
                              label={stepStatus}
                              color={getStatusColor(stepStatus)}
                              size="small"
                            />
                          }
                        >
                          {step.name}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="textSecondary">
                            Approver: {step.approver}
                          </Typography>
                          {approvals
                            .filter(a => a.stepId === step.id)
                            .map(approval => (
                              <Box key={approval.id} sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  {approval.approverName} - {approval.status}
                                </Typography>
                                {approval.comments && (
                                  <Typography variant="body2" color="textSecondary">
                                    Comments: {approval.comments}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              </Paper>
            </Grid>

            {/* Current Step Approval */}
            {currentStep && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Step: {currentStep.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Approver: {currentStep.approver}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {action} this step? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowApproval; 