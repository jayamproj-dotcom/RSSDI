import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaUserMd,
    FaClipboardList,
    FaSignOutAlt,
    FaUserCog,
    FaLock,
} from 'react-icons/fa';
import {
    TbLayoutSidebarLeftCollapse,
    TbLayoutSidebarLeftExpand,
    TbMenu2
} from 'react-icons/tb';
import {
    FileText,
    UserCog,
    Lock,
    Users,
    Database,
    UserLock ,
    UserRoundPlus,
    Download,
    BarChart3
} from "lucide-react";
import logo from '../assets/images/logo.png'
import logo2 from '../assets/images/RSSDI_Trans.png'
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showTooltips, setShowTooltips] = useState(false);

    // Detect mobile and handle resize
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Show tooltips when sidebar is collapsed (except on mobile)
    useEffect(() => {
        if (!isMobile) {
            setShowTooltips(!isOpen);
        }
    }, [isOpen, isMobile]);
    // Get role from sessionStorage
    // Get role from sessionStorage and normalize
    const role = (sessionStorage.getItem('adminRole') || 'admin').toLowerCase();
    console.log('Admin Role:', role); // Debug role value

    // Prevent rendering if not logged in
    if (!sessionStorage.getItem('adminLoggedIn')) {
        return null; // Or redirect to login
    }
    const menuItems = [
        { path: '/admin/foot-exam', icon: <FileText />, label: 'Foot Exam' },
        { path: '/admin/doctor-list', icon: <Users />, label: 'Doctor List' },
       
      
      
        ...(role !== 'subadmin' ? [
         
            { path: '/admin/profile', icon: <UserCog />, label: 'Profile' },
            { path: '/admin/change-password', icon: <Lock />, label: 'Change Password' },
            { path: '/admin/SubadminForm', icon: <UserRoundPlus />, label: 'Add Subadmin' },
            { path: '/admin/SubAdminList', icon: <UserLock />, label: 'Sub-Admins List' }

        ] : []),
         { path: '/admin/analytics', icon: <BarChart3 />, label: 'Visual Analytics (demo)' },
    ];

    return (
        <>
            {/* Mobile overlay when sidebar is open */}
            {isMobile && isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}

            {/* Always visible mobile toggle button */}
            {isMobile && (
                <button
                    className="mobile-toggle-button"
                    onClick={toggleSidebar}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    <TbMenu2 className="toggle-icon" />
                </button>
            )}

            <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
                <div className="sidebar-container">
                    {/* Header with logo and desktop toggle */}
                    {!isMobile && (
                        <div className="sidebar-header">
                            <button
                                className="sidebar-toggle"
                                onClick={toggleSidebar}
                                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            >
                                {isOpen ? (
                                    <TbLayoutSidebarLeftCollapse className="toggle-icon" />
                                ) : (
                                    <TbLayoutSidebarLeftExpand className="toggle-icon" />
                                )}
                            </button>

                            <div className="logo-container">
                                <div className="logo-placeholder">
                                    <img src={logo} alt="" srcSet="" />
                                </div>
                                <div className="logo-placeholder">
                                    <img src={logo2} alt="" srcSet="" />
                                </div>
                                {/* {isOpen && <h3 className="panel-title">DFRI</h3>} */}
                            </div>
                        </div>
                    )}

                    {/* Main navigation */}
                    <nav className="sidebar-content">
                        <ul className="sidebar-menu">
                            <span className='sidebar-title'>Manage Data</span>
                            {menuItems.map((item) => (
                                <li
                                    key={item.path}
                                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                                    onMouseEnter={() => setHoveredItem(item.path)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div className="menu-link-wrapper">
                                        <Link to={item.path} className="menu-link">
                                            <span className="icon-wrapper">
                                                <span className="icon">{item.icon}</span>
                                            </span>
                                            {isOpen && <span className="label">{item.label}</span>}
                                        </Link>

                                        {showTooltips && hoveredItem === item.path && (
                                            <div className="tooltip fixed-tooltip">
                                                <span>{item.label}</span>
                                                <div className="tooltip-arrow"></div>
                                            </div>
                                        )}
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer with logout */}
                    <div className="sidebar-footer">
                        <div
                            className="logout-container"
                            onMouseEnter={() => setHoveredItem('logout')}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <Link to="/admin" className="logout-link">
                                <span className="icon-wrapper">
                                    <FaSignOutAlt className="logout-icon" />
                                </span>
                                {isOpen && <span className="label">Logout</span>}

                                {showTooltips && hoveredItem === 'logout' && (
                                    <div className="tooltip">
                                        <span>Logout</span>
                                        <div className="tooltip-arrow"></div>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;