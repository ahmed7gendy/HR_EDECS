import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import {
  ArrowForward as ForwardIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, approvalsData, requestsData] = await Promise.all([
        WorkflowManager.getWorkflowStats(),
        WorkflowManager.getPendingApprovals(),
        WorkflowManager.getRecentRequests()
      ]);

      setStats(statsData);
      setPendingApprovals(approvalsData);
      setRecentRequests(requestsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (requestId) => {
    navigate(`/workflows/request/${requestId}`);
  };

  const handleViewApproval = (requestId) => {
    navigate(`/workflows/approval/${requestId}`);
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
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Requests</Typography>
              </Box>
              <Typography variant="h4">{stats.totalRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Approvals</Typography>
              </Box>
              <Typography variant="h4">{stats.pendingApprovals}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h4">{stats.approvedRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Rejected</Typography>
              </Box>
              <Typography variant="h4">{stats.rejectedRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Pending Approvals</Typography>
                <Button
                  endIcon={<ForwardIcon />}
                  onClick={() => navigate('/workflows/approvals')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {pendingApprovals.map((approval, index) => (
                  <React.Fragment key={approval.id}>
                    <ListItem
                      button
                      onClick={() => handleViewApproval(approval.requestId)}
                    >
                      <ListItemIcon>
                        {getStatusIcon(approval.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={approval.requestTitle}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {approval.workflowName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(approval.createdAt?.seconds * 1000).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < pendingApprovals.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {pendingApprovals.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No pending approvals"
                      secondary="You have no workflow approvals waiting for your action"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Requests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Requests</Typography>
                <Button
                  endIcon={<ForwardIcon />}
                  onClick={() => navigate('/workflows/history')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentRequests.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <ListItem
                      button
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <ListItemIcon>
                        {getStatusIcon(request.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={request.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {request.type}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(request.createdAt?.seconds * 1000).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </ListItem>
                    {index < recentRequests.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {recentRequests.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No recent requests"
                      secondary="You haven't submitted any workflow requests yet"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/workflows/request')}
                  >
                    New Request
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<TimelineIcon />}
                    onClick={() => navigate('/workflows/history')}
                  >
                    View History
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/workflows/approvals')}
                  >
                    Pending Approvals
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowDashboard; 