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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);

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
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleEdit = () => {
    navigate(`/workflows/edit/${id}`);
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
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Workflow
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

            {/* Approval History */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Approval History
                </Typography>
                <List>
                  {approvals.map((approval, index) => (
                    <React.Fragment key={approval.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(approval.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${approval.approverName} - ${approval.status}`}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {new Date(approval.updatedAt?.seconds * 1000).toLocaleString()}
                              </Typography>
                              {approval.comments && (
                                <Typography variant="body2" color="textSecondary">
                                  Comments: {approval.comments}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < approvals.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkflowView; 