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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    defaultApprovers: [],
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notifyOnApproval: true,
      notifyOnRejection: true,
      notifyOnCompletion: true
    },
    approvalSettings: {
      requireComments: true,
      allowReassignment: true,
      autoApproveAfterDays: 0
    },
    workflowSettings: {
      allowDraft: true,
      requireAttachments: false,
      maxAttachments: 5,
      maxAttachmentSize: 10 // in MB
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await WorkflowManager.getWorkflowSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [name]: checked
      }
    }));
  };

  const handleApprovalChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      approvalSettings: {
        ...prev.approvalSettings,
        [name]: checked
      }
    }));
  };

  const handleWorkflowChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      workflowSettings: {
        ...prev.workflowSettings,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await WorkflowManager.updateWorkflowSettings(settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Error saving settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
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

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Workflow Settings
                </Typography>
              </Grid>

              {/* Notification Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          name="emailNotifications"
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.pushNotifications}
                          onChange={handleNotificationChange}
                          name="pushNotifications"
                        />
                      }
                      label="Push Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.notifyOnApproval}
                          onChange={handleNotificationChange}
                          name="notifyOnApproval"
                        />
                      }
                      label="Notify on Approval"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.notifyOnRejection}
                          onChange={handleNotificationChange}
                          name="notifyOnRejection"
                        />
                      }
                      label="Notify on Rejection"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.notifyOnCompletion}
                          onChange={handleNotificationChange}
                          name="notifyOnCompletion"
                        />
                      }
                      label="Notify on Completion"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Approval Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Approval Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.approvalSettings.requireComments}
                          onChange={handleApprovalChange}
                          name="requireComments"
                        />
                      }
                      label="Require Comments"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.approvalSettings.allowReassignment}
                          onChange={handleApprovalChange}
                          name="allowReassignment"
                        />
                      }
                      label="Allow Reassignment"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Auto Approve After (Days)"
                      type="number"
                      value={settings.approvalSettings.autoApproveAfterDays}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        approvalSettings: {
                          ...prev.approvalSettings,
                          autoApproveAfterDays: parseInt(e.target.value) || 0
                        }
                      }))}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Workflow Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Workflow Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.workflowSettings.allowDraft}
                          onChange={handleWorkflowChange}
                          name="allowDraft"
                        />
                      }
                      label="Allow Draft Requests"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.workflowSettings.requireAttachments}
                          onChange={handleWorkflowChange}
                          name="requireAttachments"
                        />
                      }
                      label="Require Attachments"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Attachments"
                      type="number"
                      value={settings.workflowSettings.maxAttachments}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        workflowSettings: {
                          ...prev.workflowSettings,
                          maxAttachments: parseInt(e.target.value) || 0
                        }
                      }))}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Attachment Size (MB)"
                      type="number"
                      value={settings.workflowSettings.maxAttachmentSize}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        workflowSettings: {
                          ...prev.workflowSettings,
                          maxAttachmentSize: parseInt(e.target.value) || 0
                        }
                      }))}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
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

export default WorkflowSettings; 