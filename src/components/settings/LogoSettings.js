import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import Logo from '../common/Logo';
import { useLanguage } from '../../contexts/LanguageContext';

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const MotionCard = motion(Card);

const LogoSettings = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('settings.logoInvalidType'));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('settings.logoTooLarge'));
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess(false);

      // Upload to Firebase Storage
      const storageRef = ref(storage, 'logo/logo.png');
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update logo URL in your app's settings or context
      // You might want to store this in Firestore or another storage solution
      
      setSuccess(true);
      
      // Force reload the logo by updating the src
      const logoElements = document.querySelectorAll('img[alt="EDECS Business"]');
      logoElements.forEach(img => {
        img.src = downloadURL + '?t=' + new Date().getTime();
      });
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(t('settings.logoUploadError'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('settings.logoSettings')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('settings.currentLogo')}
          </Typography>
          <Logo size="large" />
        </Box>

        <input
          type="file"
          accept="image/*"
          id="logo-upload"
          style={{ display: 'none' }}
          onChange={handleLogoUpload}
        />
        
        <label htmlFor="logo-upload">
          <UploadArea
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography variant="body1" gutterBottom>
                  {t('settings.dragDropLogo')}
                </Typography>
                <Button variant="contained" component="span">
                  {t('settings.chooseLogo')}
                </Button>
              </>
            )}
          </UploadArea>
        </label>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('settings.logoUpdateSuccess')}
          </Alert>
        )}

        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
          {t('settings.logoRequirements')}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

export default LogoSettings; 