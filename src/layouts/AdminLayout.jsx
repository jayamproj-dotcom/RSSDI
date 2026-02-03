import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../layouts/AdminLayout.css';
import Header from '../components/Header';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if screen is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
            />
            <div className={`admin-main ${sidebarOpen ? '' : 'collapsed'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <div className="admin-content">{children}</div>
            </div>
        </div>
    );
};

export default AdminLayout;