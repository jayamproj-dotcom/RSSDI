import React from 'react';
import { Navigate ,Link} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentRole } from '../features/auth/authSlice';
import {
    FiUser,
    FiDownload,
    FiUpload,
    FiFileText,
    FiSettings,
} from 'react-icons/fi';
  import './HomePage.css';
const HomePage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectCurrentRole);

    if (isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        if (role === 'admin') {
            return <Navigate to="/admin/foot-exam" replace />;
        } else if (role === 'user') {
            return <Navigate to="/user/rssdi-save-the-feet-2.0" replace />;
        }
    }

    // Default redirect for unauthenticated users
    return (
        <div className="login-container">
            <div className="info-panel2">
                <div className="info-content2">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2zM12 15a3 3 0 110-6 3 3 0 010 6z" />
                        </svg>
                        <h1>RSSDI Save the Feet 2.0</h1>
                       
                       <Link to="/admin" className='access-button'> <p className="admin-subtitle">Admin Login</p></Link>
                        
                        
                    </div>

                    <div className="features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiUser />
                            </div>
                            <div>
                                <h3>Doctor Management</h3>
                                <p>Onboard, update, and manage doctor profiles seamlessly</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiDownload />
                            </div>
                            <div>
                                <h3>Download Reports</h3>
                                <p>Export doctor data and reports with one click</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiSettings />
                            </div>
                            <div>
                                <h3>Profile Management</h3>
                                <p>Control admin settings and manage your own profile securely</p>
                            </div>
                        </div>
                        {/* <div className="feature-item">
                            <div className="feature-icon">
                                <FiSettings />
                            </div>
                            <div>
                                <h3>Manage SubAdmins </h3>
                                <p>Control SubAdmins settings and manage </p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
                    <div className="info-panel2">
                        <div className="info-content2">
                            <div className="logo">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2zM12 15a3 3 0 110-6 3 3 0 010 6z" />
                                </svg>
                                <h1>RSSDI Save the Feet 2.0</h1>
                        <Link to="/user-login" className='access-button'><p className="doctor-subtitle"> Doctor Login </p></Link>
                            </div>
                             
                            <div className="features">
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FiUser />
                                    </div>
                                    <div>
                                        <h3>Patient Management</h3>
                                        <p>Easily add, edit, and track patient details in one place.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FiDownload />
                                    </div>
                                    <div>
                                        <h3>Export to Excel</h3>
                                        <p>Download your patient data for reports and analysis.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FiUpload />
                                    </div>
                                    <div>
                                        <h3>Bulk Import</h3>
                                        <p>Import multiple patient records at once using Excel files.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FiFileText />
                                    </div>
                                    <div>
                                        <h3>Sample Excel Template</h3>
                                        <p>Download a ready-to-use Excel format to simplify bulk uploads.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
                </div>
    );
};

export default HomePage;