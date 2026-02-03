import React from 'react';
import UserHeader from '../components/UserHeader';

const UserLayout = ({ children }) => {
    return (
        <div className="user-layout">
            <UserHeader />
            <div className="user-content">
                {children}
            </div>
        </div>
    );
};

export default UserLayout;
