import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  People,
  Business,
  Assignment,
  TrendingUp,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const StatCard = ({ icon, title, value, color, increase }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                p: 1,
                mr: 2,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" component="div" gutterBottom>
            {value}
          </Typography>
          {increase && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="body2" color="success.main">
                +{increase}% from last month
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: 0,
    companies: 0,
    workflows: 0,
    activeProjects: 0,
    pendingTasks: 0,
    attendance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch employees count
        const employeesSnapshot = await getDocs(collection(db, 'employees'));
        const employeesCount = employeesSnapshot.size;

        // Fetch companies count
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const companiesCount = companiesSnapshot.size;

        // Fetch active workflows
        const workflowsSnapshot = await getDocs(
          query(collection(db, 'workflows'), where('status', '==', 'active'))
        );
        const workflowsCount = workflowsSnapshot.size;

        setStats({
          employees: employeesCount,
          companies: companiesCount,
          workflows: workflowsCount,
          activeProjects: 12, // Mock data
          pendingTasks: 25, // Mock data
          attendance: 95, // Mock data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" gutterBottom>
            {t('dashboard.welcome')}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {t('dashboard.summary')}
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<People sx={{ color: 'primary.main' }} />}
            title={t('dashboard.totalEmployees')}
            value={stats.employees}
            color="primary.main"
            increase={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<Business sx={{ color: 'secondary.main' }} />}
            title={t('dashboard.totalCompanies')}
            value={stats.companies}
            color="secondary.main"
            increase={3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<Assignment sx={{ color: 'success.main' }} />}
            title={t('dashboard.activeWorkflows')}
            value={stats.workflows}
            color="success.main"
            increase={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<TrendingUp sx={{ color: 'info.main' }} />}
            title={t('dashboard.activeProjects')}
            value={stats.activeProjects}
            color="info.main"
            increase={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<CalendarToday sx={{ color: 'warning.main' }} />}
            title={t('dashboard.pendingTasks')}
            value={stats.pendingTasks}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<AccessTime sx={{ color: 'error.main' }} />}
            title={t('dashboard.attendanceRate')}
            value={`${stats.attendance}%`}
            color="error.main"
            increase={2}
          />
        </Grid>
      </Grid>

      {/* Add more dashboard sections here */}
      {/* Recent Activities */}
      {/* Charts and Graphs */}
      {/* Quick Actions */}
    </Container>
  );
};

export default Dashboard; 