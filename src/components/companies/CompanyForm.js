import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    status: 'active',
    employeeCount: 0,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', id));
      if (companyDoc.exists()) {
        setFormData(companyDoc.data());
      } else {
        showSnackbar('error', 'Company not found');
        navigate('/companies');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      showSnackbar('error', t('companies.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (event) => {
    setFormData(prev => ({
      ...prev,
      status: event.target.checked ? 'active' : 'inactive'
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'industry', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      showSnackbar('error', t('validation.required'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await setDoc(doc(db, 'companies', id), formData);
      } else {
        await addDoc(collection(db, 'companies'), formData);
      }
      showSnackbar('success', t('companies.saveSuccess'));
      navigate('/companies');
    } catch (error) {
      console.error('Error saving company:', error);
      showSnackbar('error', t('companies.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? t('companies.edit') : t('companies.addNew')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    label={t('companies.name')}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="industry"
                    label={t('companies.industry')}
                    value={formData.industry}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    name="email"
                    label={t('companies.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label={t('companies.phone')}
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="website"
                    label={t('companies.website')}
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="employeeCount"
                    label={t('companies.employees')}
                    value={formData.employeeCount}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="address"
                    label={t('companies.address')}
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label={t('companies.description')}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status === 'active'}
                        onChange={handleStatusChange}
                        color="primary"
                      />
                    }
                    label={t('companies.status.active')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={24} />
              ) : (
                t('common.save')
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/companies')}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </form>
      </Box>
    </motion.div>
  );
};

export default CompanyForm; 