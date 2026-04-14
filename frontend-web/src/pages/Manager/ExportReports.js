// src/pages/Manager/ExportReports.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import forecastService from '../../services/forecastService';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  TextSnippet as CsvIcon,
  CalendarToday as CalendarIcon,
  Bloodtype as BloodIcon,
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const ExportReports = () => {
  const [exportType, setExportType] = useState('pdf');
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReports, setSelectedReports] = useState({
    inventory: true,
    requests: true,
    donors: true,
    analytics: true,
    forecasts: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleReportToggle = (report) => {
    setSelectedReports({ ...selectedReports, [report]: !selectedReports[report] });
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await forecastService.exportForecastReport(exportType);
      if (response?.success) {
        setExportSuccess(true);
      }
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportSuccess(false), 3000);
    }
  };

  const reportOptions = [
    { key: 'inventory', label: 'Inventory Report', icon: <BloodIcon />, description: 'Current blood stock levels by type, expiry dates, and storage locations' },
    { key: 'requests', label: 'Request Report', icon: <AssessmentIcon />, description: 'Blood request history, fulfillment rates, and urgency distribution' },
    { key: 'donors', label: 'Donor Report', icon: <PeopleIcon />, description: 'Donor demographics, donation history, and eligibility status' },
    { key: 'analytics', label: 'Analytics Report', icon: <AssessmentIcon />, description: 'Key performance indicators, trends, and hospital performance' },
    { key: 'forecasts', label: 'Forecast Report', icon: <AssessmentIcon />, description: 'AI demand forecasts, shortage alerts, and recommendations' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 3 }}>Export Reports</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Select Reports to Export</Typography>
            <Grid container spacing={2}>
              {reportOptions.map((report) => (
                <Grid item xs={12} sm={6} key={report.key}>
                  <Card sx={{ cursor: 'pointer', border: selectedReports[report.key] ? '2px solid #d32f2f' : '1px solid #e0e0e0', bgcolor: selectedReports[report.key] ? '#fff5f5' : 'white' }} onClick={() => handleReportToggle(report.key)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: '#d32f2f' }}>{report.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{report.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{report.description}</Typography>
                      </Box>
                      <Checkbox checked={selectedReports[report.key]} onChange={() => handleReportToggle(report.key)} sx={{ color: '#d32f2f' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Date Range</Typography>
            <RadioGroup row value={dateRange} onChange={(e) => setDateRange(e.target.value)} sx={{ mb: 2 }}>
              <FormControlLabel value="last7days" control={<Radio sx={{ color: '#d32f2f' }} />} label="Last 7 Days" />
              <FormControlLabel value="last30days" control={<Radio sx={{ color: '#d32f2f' }} />} label="Last 30 Days" />
              <FormControlLabel value="last90days" control={<Radio sx={{ color: '#d32f2f' }} />} label="Last 90 Days" />
              <FormControlLabel value="custom" control={<Radio sx={{ color: '#d32f2f' }} />} label="Custom Range" />
            </RadioGroup>
            {dateRange === 'custom' && (
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Export Format</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}><Card sx={{ cursor: 'pointer', border: exportType === 'pdf' ? '2px solid #d32f2f' : '1px solid #e0e0e0', bgcolor: exportType === 'pdf' ? '#fff5f5' : 'white' }} onClick={() => setExportType('pdf')}><CardContent sx={{ textAlign: 'center' }}><PdfIcon sx={{ fontSize: 48, color: '#f44336' }} /><Typography variant="body2">PDF</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ cursor: 'pointer', border: exportType === 'excel' ? '2px solid #d32f2f' : '1px solid #e0e0e0', bgcolor: exportType === 'excel' ? '#fff5f5' : 'white' }} onClick={() => setExportType('excel')}><CardContent sx={{ textAlign: 'center' }}><ExcelIcon sx={{ fontSize: 48, color: '#2e7d32' }} /><Typography variant="body2">Excel</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ cursor: 'pointer', border: exportType === 'csv' ? '2px solid #d32f2f' : '1px solid #e0e0e0', bgcolor: exportType === 'csv' ? '#fff5f5' : 'white' }} onClick={() => setExportType('csv')}><CardContent sx={{ textAlign: 'center' }}><CsvIcon sx={{ fontSize: 48, color: '#2196f3' }} /><Typography variant="body2">CSV</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ cursor: 'pointer', border: exportType === 'print' ? '2px solid #d32f2f' : '1px solid #e0e0e0', bgcolor: exportType === 'print' ? '#fff5f5' : 'white' }} onClick={() => setExportType('print')}><CardContent sx={{ textAlign: 'center' }}><PrintIcon sx={{ fontSize: 48, color: '#9c27b0' }} /><Typography variant="body2">Print</Typography></CardContent></Card></Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Export Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Selected Reports:</Typography>
              {Object.entries(selectedReports).filter(([, v]) => v).map(([key]) => (<Chip key={key} label={reportOptions.find(r => r.key === key)?.label} size="small" sx={{ m: 0.5, bgcolor: '#fff5f5', color: '#d32f2f' }} />))}
            </Box>
            <Typography variant="body2" color="text.secondary">Date Range: {dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange.replace('last', 'Last ')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Format: {exportType.toUpperCase()}</Typography>
            <Button fullWidth variant="contained" onClick={handleExport} disabled={isLoading} sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, py: 1.5, mb: 2 }} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}>
              {isLoading ? 'Generating Report...' : 'Generate Report'}
            </Button>
            {exportSuccess && <Alert severity="success" sx={{ mt: 2 }}>Report generated successfully! Download will start shortly.</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon sx={{ fontSize: 16 }} /> Schedule recurring reports</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExportReports;