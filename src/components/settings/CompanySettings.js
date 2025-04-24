import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { CompanyManager } from '../../utils/companyManager';

const CompanySettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [company, setCompany] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });

  const [settings, setSettings] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '' });
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '' });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const [companyData, settingsData, languagesData, currenciesData] = await Promise.all([
        CompanyManager.getCompany('current'),
        CompanyManager.getCompanySettings('current'),
        CompanyManager.getCompanyLanguages('current'),
        CompanyManager.getCompanyCurrencies('current')
      ]);

      setCompany(companyData);
      setSettings(settingsData);
      setLanguages(languagesData);
      setCurrencies(currenciesData);
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkingHoursChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  const handleAddLanguage = async () => {
    try {
      await CompanyManager.addCompanyLanguage({
        ...newLanguage,
        companyId: 'current'
      });
      setNewLanguage({ code: '', name: '' });
      loadCompanyData();
    } catch (error) {
      console.error('Error adding language:', error);
    }
  };

  const handleAddCurrency = async () => {
    try {
      await CompanyManager.addCompanyCurrency({
        ...newCurrency,
        companyId: 'current'
      });
      setNewCurrency({ code: '', name: '', symbol: '' });
      loadCompanyData();
    } catch (error) {
      console.error('Error adding currency:', error);
    }
  };

  const handleDeleteLanguage = async (languageId) => {
    try {
      await CompanyManager.deleteCompanyLanguage(languageId);
      loadCompanyData();
    } catch (error) {
      console.error('Error deleting language:', error);
    }
  };

  const handleDeleteCurrency = async (currencyId) => {
    try {
      await CompanyManager.deleteCompanyCurrency(currencyId);
      loadCompanyData();
    } catch (error) {
      console.error('Error deleting currency:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await Promise.all([
        CompanyManager.updateCompany('current', company),
        CompanyManager.updateCompanySettings('current', settings)
      ]);
      // Show success message
    } catch (error) {
      console.error('Error updating company settings:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Company Settings
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="General" />
            <Tab label="Languages" />
            <Tab label="Currencies" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                {/* Company Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="name"
                    value={company.name}
                    onChange={handleCompanyChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Code"
                    name="code"
                    value={company.code}
                    onChange={handleCompanyChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={company.address}
                    onChange={handleCompanyChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={company.phone}
                    onChange={handleCompanyChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={company.email}
                    onChange={handleCompanyChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={company.website}
                    onChange={handleCompanyChange}
                  />
                </Grid>

                {/* General Settings */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    General Settings
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Language</InputLabel>
                    <Select
                      name="language"
                      value={settings.language}
                      onChange={handleSettingsChange}
                      label="Default Language"
                    >
                      {languages.map(lang => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Currency</InputLabel>
                    <Select
                      name="currency"
                      value={settings.currency}
                      onChange={handleSettingsChange}
                      label="Default Currency"
                    >
                      {currencies.map(curr => (
                        <MenuItem key={curr.code} value={curr.code}>
                          {curr.name} ({curr.symbol})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleSettingsChange}
                      label="Timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="GMT">GMT</MenuItem>
                      <MenuItem value="EST">EST</MenuItem>
                      <MenuItem value="PST">PST</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      name="dateFormat"
                      value={settings.dateFormat}
                      onChange={handleSettingsChange}
                      label="Date Format"
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      name="timeFormat"
                      value={settings.timeFormat}
                      onChange={handleSettingsChange}
                      label="Time Format"
                    >
                      <MenuItem value="12h">12-hour</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Working Days</InputLabel>
                    <Select
                      multiple
                      name="workingDays"
                      value={settings.workingDays}
                      onChange={handleSettingsChange}
                      label="Working Days"
                    >
                      <MenuItem value="Monday">Monday</MenuItem>
                      <MenuItem value="Tuesday">Tuesday</MenuItem>
                      <MenuItem value="Wednesday">Wednesday</MenuItem>
                      <MenuItem value="Thursday">Thursday</MenuItem>
                      <MenuItem value="Friday">Friday</MenuItem>
                      <MenuItem value="Saturday">Saturday</MenuItem>
                      <MenuItem value="Sunday">Sunday</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Working Hours Start"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Working Hours End"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Languages
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Language Code"
                    value={newLanguage.code}
                    onChange={(e) => setNewLanguage(prev => ({ ...prev, code: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Language Name"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddLanguage}
                    variant="contained"
                  >
                    Add Language
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <List>
                    {languages.map(language => (
                      <ListItem key={language.id}>
                        <ListItemText
                          primary={language.name}
                          secondary={language.code}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteLanguage(language.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Currencies
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Currency Code"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, code: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Currency Name"
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Currency Symbol"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddCurrency}
                    variant="contained"
                  >
                    Add Currency
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <List>
                    {currencies.map(currency => (
                      <ListItem key={currency.id}>
                        <ListItemText
                          primary={currency.name}
                          secondary={`${currency.code} (${currency.symbol})`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCurrency(currency.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Save Settings
                </Button>
              </Box>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanySettings; 