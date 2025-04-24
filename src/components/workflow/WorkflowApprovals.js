import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { WorkflowManager } from '../../utils/workflowManager';

const WorkflowApprovals = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: 'pending',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    loadApprovals();
  }, [filters]);

  const loadApprovals = async () => {
    try {
      const approvalsData = await WorkflowManager.getWorkflowApprovals(filters);
      setApprovals(approvalsData);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [name]: value
      }
    }));
  };

  const handleApplyFilters = () => {
    setFilterDialogOpen(false);
    loadApprovals();
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: 'pending',
      dateRange: {
        start: '',
        end: ''
      }
    });
    loadApprovals();
  };

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setApprovalDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await WorkflowManager.updateWorkflowApproval(selectedApproval.requestId, selectedApproval.stepId, {
        status: 'approved',
        comments: comments
      });
      setApprovalDialogOpen(false);
      loadApprovals();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async () => {
    try {
      await WorkflowManager.updateWorkflowApproval(selectedApproval.requestId, selectedApproval.stepId, {
        status: 'rejected',
        comments: comments
      });
      setApprovalDialogOpen(false);
      loadApprovals();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilters(prev => ({
      ...prev,
      status: newValue === 0 ? 'pending' : newValue === 1 ? 'approved' : 'rejected'
    }));
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
                startIcon={<FilterIcon />}
                onClick={() => setFilterDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>

          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ mb: 3 }}
          >
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Requested At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>{approval.requestTitle}</TableCell>
                    <TableCell>{approval.type}</TableCell>
                    <TableCell>{approval.workflowName}</TableCell>
                    <TableCell>{approval.stepName}</TableCell>
                    <TableCell>{approval.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(approval.createdAt?.seconds * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={approval.status}
                        color={getStatusColor(approval.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewApproval(approval)}
                      >
                        <PendingIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Approvals</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="leave">Leave</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start"
                type="date"
                value={filters.dateRange.start}
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
                value={filters.dateRange.end}
                onChange={handleDateRangeChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Request Approval</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {selectedApproval.requestTitle}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {selectedApproval.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={selectedApproval.type}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={selectedApproval.status}
                    color={getStatusColor(selectedApproval.status)}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Request Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Workflow:</strong> {selectedApproval.workflowName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Step:</strong> {selectedApproval.stepName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Requested By:</strong> {selectedApproval.requestedBy}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Requested At:</strong> {new Date(selectedApproval.createdAt?.seconds * 1000).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {selectedApproval.type === 'leave' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Start Date</Typography>
                    <Typography>
                      {new Date(selectedApproval.startDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">End Date</Typography>
                    <Typography>
                      {new Date(selectedApproval.endDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </>
              )}

              {selectedApproval.type === 'expense' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Amount</Typography>
                    <Typography>
                      {selectedApproval.amount} {selectedApproval.currency}
                    </Typography>
                  </Grid>
                </>
              )}

              {selectedApproval.attachments?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments
                  </Typography>
                  {selectedApproval.attachments.map((attachment, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {attachment.name}
                      </Typography>
                      <Button
                        size="small"
                        href={attachment.url}
                        target="_blank"
                      >
                        Download
                      </Button>
                    </Box>
                  ))}
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowApprovals; 