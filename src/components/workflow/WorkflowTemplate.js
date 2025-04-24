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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowTemplate = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    description: '',
    type: 'leave',
    steps: []
  });
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState({
    name: '',
    approver: '',
    order: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await WorkflowManager.getWorkflowTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleAddTemplate = () => {
    setCurrentTemplate({
      name: '',
      description: '',
      type: 'leave',
      steps: []
    });
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await WorkflowManager.deleteWorkflowTemplate(templateId);
      setSnackbar({
        open: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting template',
        severity: 'error'
      });
    }
  };

  const handleCopyTemplate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined
      };
      await WorkflowManager.createWorkflowTemplate(newTemplate);
      setSnackbar({
        open: true,
        message: 'Template copied successfully',
        severity: 'success'
      });
      loadTemplates();
    } catch (error) {
      console.error('Error copying template:', error);
      setSnackbar({
        open: true,
        message: 'Error copying template',
        severity: 'error'
      });
    }
  };

  const handleTemplateDialogClose = () => {
    setTemplateDialogOpen(false);
    setCurrentTemplate({
      name: '',
      description: '',
      type: 'leave',
      steps: []
    });
  };

  const handleTemplateSave = async () => {
    try {
      if (currentTemplate.id) {
        await WorkflowManager.updateWorkflowTemplate(currentTemplate.id, currentTemplate);
      } else {
        await WorkflowManager.createWorkflowTemplate(currentTemplate);
      }
      setSnackbar({
        open: true,
        message: 'Template saved successfully',
        severity: 'success'
      });
      handleTemplateDialogClose();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({
        open: true,
        message: 'Error saving template',
        severity: 'error'
      });
    }
  };

  const handleAddStep = () => {
    setCurrentStep({
      name: '',
      approver: '',
      order: currentTemplate.steps.length
    });
    setStepDialogOpen(true);
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
    setStepDialogOpen(true);
  };

  const handleDeleteStep = (stepId) => {
    setCurrentTemplate(prev => ({
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
      setCurrentTemplate(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === currentStep.id ? currentStep : step
        )
      }));
    } else {
      // Add new step
      setCurrentTemplate(prev => ({
        ...prev,
        steps: [...prev.steps, { ...currentStep, id: Date.now().toString() }]
      }));
    }
    handleStepDialogClose();
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
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTemplate}
            >
              Add Template
            </Button>
          </Box>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {template.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyTemplate(template)}
                      >
                        <CopyIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Chip
                    label={template.type}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Steps:
                  </Typography>
                  <List dense>
                    {template.steps.map((step) => (
                      <ListItem key={step.id}>
                        <ListItemText
                          primary={step.name}
                          secondary={`Approver: ${step.approver}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={handleTemplateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentTemplate.id ? 'Edit Template' : 'Add Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={currentTemplate.description}
                onChange={(e) => setCurrentTemplate(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={currentTemplate.type}
                  onChange={(e) => setCurrentTemplate(prev => ({
                    ...prev,
                    type: e.target.value
                  }))}
                  label="Type"
                >
                  <MenuItem value="leave">Leave</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
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

              <List>
                {currentTemplate.steps.map((step, index) => (
                  <ListItem key={step.id}>
                    <ListItemText
                      primary={step.name}
                      secondary={`Approver: ${step.approver}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditStep(step)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteStep(step.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTemplateDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleTemplateSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

export default WorkflowTemplate; 