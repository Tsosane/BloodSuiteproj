// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/Auth/PrivateRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import HospitalApproval from './pages/Admin/HospitalApproval';
import DataImport from './pages/Admin/DataImport';

// Hospital Pages
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import InventoryTable from './pages/Hospital/InventoryTable';
import AddInventory from './pages/Hospital/AddInventory';
import Requests from './pages/Hospital/Requests';
import RequestForm from './pages/Hospital/RequestForm';
import RequestTracker from './pages/Hospital/RequestTracker';
import NearbyDonors from './pages/Hospital/NearbyDonor';

// Donor Pages
import DonorDashboard from './pages/Donor/DonorDashboard';
import DonorProfile from './pages/Donor/DonorProfile';
import DonationHistory from './pages/Donor/DonationHistory';
import EligibilityStatus from './pages/Donor/EligibilityStatus';
import ScheduleDonation from './pages/Donor/ScheduleDonation';

// Manager Pages
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import AnalyticsDashboard from './pages/Manager/AnalyticsDashboard';
import ForecastReports from './pages/Manager/ForecastReports';
import ExportReports from './pages/Manager/ExportReports';
import RequestHistory from './pages/Hospital/RequestHistory';

// Common Pages
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Layout Components
import Layout from './components/Layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with Layout */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/hospitals/pending" element={<HospitalApproval />} />
                  <Route path="/admin/data-import" element={<DataImport />} />

                  {/* Hospital Routes */}
                  <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
                  <Route path="/inventory" element={<InventoryTable />} />
                  <Route path="/inventory/add" element={<AddInventory />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/requests/new" element={<RequestForm />} />
                  <Route path="/requests/track" element={<RequestTracker />} />
                  <Route path="/requests/history" element={<RequestHistory />} />
                  <Route path="/donors/nearby" element={<NearbyDonors />} />

                  {/* Donor Routes */}
                  <Route path="/donor/dashboard" element={<DonorDashboard />} />
                  <Route path="/profile" element={<DonorProfile />} />
                  <Route path="/donations" element={<DonationHistory />} />
                  <Route path="/eligibility" element={<EligibilityStatus />} />
                  <Route path="/schedule-donation" element={<ScheduleDonation />} />

                  {/* Manager Routes */}
                  <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                  <Route path="/manager/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/manager/forecast" element={<ForecastReports />} />
                  <Route path="/manager/export" element={<ExportReports />} />

                  {/* Common Routes - Available to all authenticated users */}
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/forecast" element={<ForecastReports />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />

                  {/* Default Redirect based on role */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Component to redirect based on user role
const DashboardRedirect = () => {
  const role = localStorage.getItem('bloodSuiteUserRole');
  
  switch(role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'hospital':
      return <Navigate to="/hospital/dashboard" />;
    case 'donor':
      return <Navigate to="/donor/dashboard" />;
    case 'blood_bank_manager':
      return <Navigate to="/manager/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;