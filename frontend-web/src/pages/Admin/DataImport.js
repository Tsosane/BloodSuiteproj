import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { CloudUpload, Download, CheckCircle, Error, Info } from '@mui/icons-material';
import api from '../../services/api';

const DataImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [template, setTemplate] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

  useEffect(() => {
    loadImportHistory();
    loadTemplate();
  }, []);

  const loadImportHistory = async () => {
    try {
      const response = await api.get('/data-import/history');
      setImportHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load import history:', error);
    }
  };

  const loadTemplate = async () => {
    try {
      const response = await api.get('/data-import/template');
      setTemplate(response.data || null);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setImportResult(null);
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setValidating(true);
    const formData = new FormData();
    formData.append('dataFile', selectedFile);

    try {
      const response = await api.post('/data-import/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValidationResult(response.data);
      setAlert({
        show: true,
        type: response.data.isValid ? 'success' : 'warning',
        message: response.data.isValid
          ? `File is valid. ${response.data.recordCount} records found.`
          : `Validation failed: ${response.data.errors.join(', ')}`
      });
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.error || error.message || 'Validation failed'
      });
    } finally {
      setValidating(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('dataFile', selectedFile);

    try {
      const response = await api.post('/data-import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || selectedFile.size || 1;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        }
      });

      setImportResult(response.data);
      setAlert({
        show: true,
        type: 'success',
        message: response.message
      });
      loadImportHistory(); // Refresh history
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.error || error.message || 'Upload failed'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    if (!template) return;

    // Create CSV content from sample data
    const headers = [...template.requiredColumns, ...(template.optionalColumns || [])].join(',');
    const rows = template.sampleData.map(row =>
      [...template.requiredColumns, ...(template.optionalColumns || [])].map(col => row[col] ?? '').join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blood_demand_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hideAlert = () => setAlert({ ...alert, show: false });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Import - Historical Blood Demand
      </Typography>

      {alert.show && (
        <Alert
          severity={alert.type}
          onClose={hideAlert}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Historical Data
            </Typography>

            <Box sx={{ mb: 2 }}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="data-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="data-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Select File (CSV or Excel)
                </Button>
              </label>
            </Box>

            {selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={validateFile}
                disabled={!selectedFile || validating}
                fullWidth
              >
                {validating ? 'Validating...' : 'Validate File'}
              </Button>
              <Button
                variant="contained"
                onClick={uploadFile}
                disabled={!selectedFile || !validationResult?.isValid || uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Import Data'}
              </Button>
            </Box>

            {uploading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}

            {importResult && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✓ {importResult.insertedRecords} records imported successfully
                  {importResult.skippedRecords > 0 && `, ${importResult.skippedRecords} skipped`}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Template and Info Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Format Requirements
            </Typography>

            {template && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Required Columns:</strong>
                  </Typography>
                  {template.requiredColumns.map(col => (
                    <Chip key={col} label={col} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Valid Blood Types:</strong>
                  </Typography>
                  {template.validBloodTypes.map(type => (
                    <Chip key={type} label={type} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Date Format:</strong> {template.dateFormat}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Demand:</strong> {template.demandFormat}
                  </Typography>
                  {template.optionalColumns?.length > 0 && (
                    <Typography variant="body2">
                      <strong>Optional Columns:</strong> {template.optionalColumns.join(', ')}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                  fullWidth
                >
                  Download Template
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Validation Results */}
        {validationResult && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Validation Results
                {validationResult.isValid ? (
                  <CheckCircle color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />
                ) : (
                  <Error color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
                )}
              </Typography>

              <Typography variant="body2" gutterBottom>
                Records found: {validationResult.recordCount}
              </Typography>

              {validationResult.errors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="error" gutterBottom>
                    Errors:
                  </Typography>
                  {validationResult.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}

              {validationResult.preview && validationResult.preview.length > 0 && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Preview (first 5 rows):
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {Object.keys(validationResult.preview[0]).map(col => (
                            <TableCell key={col}>{col}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {validationResult.preview.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, i) => (
                              <TableCell key={i}>{String(value)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Import History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import History
            </Typography>

            {importHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No import history available
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>File</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Inserted</TableCell>
                          <TableCell>Skipped</TableCell>
                          <TableCell>Records</TableCell>
                          <TableCell>Uploaded By</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importHistory.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.fileName}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                            <TableCell>{item.insertedRecords}</TableCell>
                            <TableCell>{item.skippedRecords}</TableCell>
                            <TableCell>{item.records}</TableCell>
                            <TableCell>{item.uploadedBy}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                color={item.status === 'success' ? 'success' : item.status === 'partial' ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataImport;
