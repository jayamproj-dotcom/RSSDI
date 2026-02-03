import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Admin Components
import AdminLogin from '../pages/AdminLogin';
import ManageData from '../pages/admin/ManageData';
import FootExam from '../pages/admin/FootExam';
import DoctorList from '../pages/admin/DoctorList';
import Profile from '../pages/admin/Profile';
import ChangePassword from '../pages/admin/ChangePassword';
import SubAdminList from '../pages/admin/SubAdminList';
import SubadminForm from '../pages/admin/SubadminForm';

// User Components
import UserLogin from '../pages/UserLogin';
import UserDashboard from '../pages/user/UserDashboard';
import DoctorSignup from '../pages/user/DoctorSignup';
import SixMonthFollowUpForm from '../pages/user/StepForm/SixMonthFollowUpForm';

// Shared Components
import HomePage from '../pages/HomePage';
import Unauthorized from '../pages/Unauthorized';
import PasswordChange from '../pages/user/PasswordChange';
import StepForm from '../pages/user/StepForm/StepForm';
import FollowUpForm from '../pages/user/StepForm/FollowUpForm';
import ViewFollowUpForm from '../pages/user/StepForm/ViewFollowUpForm';
import PatientDetailsPage from '../pages/admin/PatientDetailsPage';
import Analytics from '../pages/admin/Analytics/Analytics';

// import Logout from '../components/Logout';
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/user/signup" element={<DoctorSignup />} />
            {/* <Route path="/logout" element={<Logout />} /> */}

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin','subadmin']} redirectPath="/admin" />}>
                <Route path="/admin/manage-data" element={<ManageData />} />
                <Route path="/admin/foot-exam" element={<FootExam />} />
                <Route path="/admin/doctor-list" element={<DoctorList />} />
                <Route path="/admin/profile" element={<Profile />} />
                <Route path="/admin/change-password" element={<ChangePassword />} />
                <Route path="/admin/patient/:patientId" element={<PatientDetailsPage />} />
                <Route path="/admin/subAdminList" element={<SubAdminList />} />
                <Route path="/admin/SubadminForm" element={<SubadminForm />} />
                <Route path="/admin/analytics" element={<Analytics />} />           
            </Route>
          

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} redirectPath="/user-login" /> } >
                <Route path="/user/rssdi-save-the-feet-2.0" element={<UserDashboard />} />
                <Route path="/user/profile" element={<Profile />} />
                <Route path="/user/change-password" element={<PasswordChange />} />
                <Route path="/user/survey/" element={<StepForm />} />
                <Route path="/user/survey/:patientId" element={<StepForm />} />
                <Route path="/user/followup/:patientId" element={<FollowUpForm />} />
                <Route path="/user/view-followup/:patientId" element={<ViewFollowUpForm />} />
                <Route path="/user/followup-6month/:patientId" element={<SixMonthFollowUpForm />} />
              
                {/* <Route
                    path="/user/view-assessment/:patientId"
                    element={<ViewAssessment />}
                /> */}
              
            </Route>    

            {/* Fallback Redirects */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;