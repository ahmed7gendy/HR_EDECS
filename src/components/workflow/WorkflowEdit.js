import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    type: 'leave',
    status: 'active',
    steps: []
  });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState({
    name: '',
    approver: '',
    order: 0
  });

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const workflowData = await WorkflowManager.getWorkflow(id);
      setWorkflow(workflowData);
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkflow(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStep = () => {
    setCurrentStep({
      name: '',
      approver: '',
      order: workflow.steps.length
    });
    setStepDialogOpen(true);
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
    setStepDialogOpen(true);
  };

  const handleDeleteStep = (stepId) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const handleStepDialogClose = () => {
    setStepDialogOpen(false);
    setCurrentStep({
      name: '',
      approver: '',
      order: 0
    });
  };

  const handleStepSave = () => {
    if (currentStep.id) {
      // Edit existing step
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === currentStep.id ? currentStep : step
        )
      }));
    } else {
      // Add new step
      setWorkflow(prev => ({
        ...prev,
        steps: [...prev.steps, { ...currentStep, id: Date.now().toString() }]
      }));
    }
    handleStepDialogClose();
  };

  const handleDelete = async () => {
    try {
      await WorkflowManager.deleteWorkflow(id);
      navigate('/workflows');
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await WorkflowManager.updateWorkflow(id, workflow);
      navigate('/workflows');
    } catch (error) {
      console.error('Error updating workflow:', error);
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
            <Button
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Workflow
            </Button>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Edit Workflow
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Workflow Name"
                  name="name"
                  value={workflow.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={workflow.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="leave">Leave</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="purchase">Purchase</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={workflow.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      Workflow Steps
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddStep}
                    >
                      Add Step
                    </Button>
                  </Box>

                  {workflow.steps.map((step, index) => (
                    <Box
                      key={step.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">
                          {step.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Approver: {step.approver}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleEditStep(step)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteStep(step.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Step Dialog */}
      <Dialog
        open={stepDialogOpen}
        onClose={handleStepDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentStep.id ? 'Edit Step' : 'Add Step'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Step Name"
              value={currentStep.name}
              onChange={(e) => setCurrentStep(prev => ({
                ...prev,
                name: e.target.value
              }))}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Approver"
              value={currentStep.approver}
              onChange={(e) => setCurrentStep(prev => ({
                ...prev,
                approver: e.target.value
              }))}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStepDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStepSave}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete Workflow
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this workflow? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowEdit; 