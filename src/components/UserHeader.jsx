import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle, FaChevronDown, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';
import './UserHeader.css';
import logo from '../assets/images/logo.png'
import logo2 from '../assets/images/RSSDI_Trans.png'
import { Link } from 'react-router-dom';
const UserHeader = () => {
    const dropdownRef = useRef(null);
    const profileButtonRef = useRef(null); // 🔹 Used to check if user clicked on the button itself
    const [profileOpen, setProfileOpen] = useState(false);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    const handleLogout = () => {
        dispatch(logout());
        setProfileOpen(false);
    };

    // 🔸 Close dropdown if clicking outside both dropdown and button
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="user-dashboard-header">
            <div className="user-header-content">
                <div className="user-logo-container">
                    <div className="user-logo-placeholder">
                        <Link to="/user/rssdi-save-the-feet-2.0">
                            <img src={logo} alt="Logo" />
                         
                        </Link>
                        <Link to="/user/rssdi-save-the-feet-2.0">
                           
                            <img src={logo2} alt="Logo" />
                        </Link>

                        
                        </div>
                </div>

                <div className="page-header">
                    <h1 className='user-dashboard-heading'>Registry of people with Diabetic Foot Ulcers in India</h1>
                    {/* <p className='user-dashboard-heading'>Proforma - Participant Information (baseline)</p> */}
                    
                </div>


                <div className="user-profile-section">
                    {loading ? (
                        <div className="user-profile-skeleton"></div>
                    ) : user ? (
                        <div className="user-profile-container">
                            <a
                                ref={profileButtonRef}
                                className="user-profile-button"
                                onClick={() => setProfileOpen(prev => !prev)}
                                aria-expanded={profileOpen}
                                aria-label="User profile"
                            >
                                    {user.picture ? (
                                        <img
                                            src={user.picture}
                                            alt="User profile"
                                            width={36}
                                            height={36}
                                            className="user-profile-image"
                                        />
                                    ) : (
                                        <FaUserCircle className="user-profile-icon" />
                                    )}

                                <span className="user-profile-name">{user.email}</span>
                                
                                <FaChevronDown className={`dropdown-icon ${profileOpen ? 'open' : ''}`} />
                            </a>

                            {profileOpen && (
                                <div className="user-profile-dropdown" ref={dropdownRef}>
                                    <div className="user-dropdown-header">
                                            {/* {user.picture ? (
                                                <img
                                                    src={user.picture}
                                                    alt="User profile"
                                                    width={36}
                                                    height={36}
                                                    className="user-profile-image"
                                                />
                                            ) : (
                                                <FaUserCircle className="user-profile-icon" />
                                            )} */}

                                        <div className="user-info">
                                            <h4>{user.name}</h4>
                                            <p>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="user-dropdown-divider"></div>
                                        <Link className="user-dropdown-item" to='/user/change-password'>
                                        <FaCog className="user-dropdown-item-icon" />
                                        Account Settings
                                    </Link>
                                    <a
                                        className="user-dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt className="user-dropdown-item-icon" />
                                        Sign Out
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>Please log in to continue.</div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default UserHeader;
