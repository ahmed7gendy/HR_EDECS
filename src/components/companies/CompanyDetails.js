import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      // Fetch company details
      const companyDoc = await getDoc(doc(db, 'companies', id));
      if (!companyDoc.exists()) {
        showSnackbar('error', 'Company not found');
        navigate('/companies');
        return;
      }
      setCompany({ id: companyDoc.id, ...companyDoc.data() });

      // Fetch employees associated with this company
      const employeesQuery = query(
        collection(db, 'employees'),
        where('companyId', '==', id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeesList = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching company data:', error);
      showSnackbar('error', t('companies.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate('/companies')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
            {company.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/companies/edit/${id}`)}
          >
            {t('common.edit')}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('companies.details')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="subtitle1">
                        {t('companies.industry')}: {company.industry}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="primary" />
                      <Typography variant="subtitle1">
                        {t('companies.email')}: {company.email}
                      </Typography>
                    </Box>
                  </Grid>
                  {company.phone && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="primary" />
                        <Typography variant="subtitle1">
                          {t('companies.phone')}: {company.phone}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {company.website && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WebsiteIcon color="primary" />
                        <Typography variant="subtitle1">
                          {t('companies.website')}:{' '}
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            {company.website}
                          </a>
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {company.address && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon color="primary" />
                        <Typography variant="subtitle1">
                          {t('companies.address')}: {company.address}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {company.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {t('companies.description')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <DescriptionIcon color="primary" sx={{ mt: 0.5 }} />
                      <Typography variant="body1">
                        {company.description}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {t('companies.status.title')}
                  </Typography>
                  <Chip
                    label={t(`companies.status.${company.status}`)}
                    color={company.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('companies.employees')}: {company.employeeCount || 0}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('companies.recentEmployees')}
                </Typography>
                <List>
                  {employees.slice(0, 5).map((employee) => (
                    <ListItem
                      key={employee.id}
                      button
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={employee.name}
                        secondary={employee.position}
                      />
                    </ListItem>
                  ))}
                  {employees.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary={t('companies.noEmployees')}
                        sx={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
                {employees.length > 5 && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/employees', { state: { companyId: id } })}
                  >
                    {t('common.viewAll')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default CompanyDetails; 