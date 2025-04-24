import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import LogoSettings from './LogoSettings';
import { useLanguage } from '../../contexts/LanguageContext';

const Settings = () => {
  const { t } = useLanguage();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" gutterBottom>
            {t('settings.title')}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {t('settings.subtitle')}
          </Typography>
        </motion.div>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <LogoSettings />
            </motion.div>
          </Grid>
          
          {/* Add other settings sections here */}
          <Grid item xs={12} md={6}>
            {/* Theme Settings */}
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Language Settings */}
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Currency Settings */}
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Settings; 