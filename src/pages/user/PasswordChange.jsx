import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { apiRequest } from '../../services/api-helper'; // Adjust path as needed
import { apiPatch, getAuthToken } from "../../services/api-helper";
import UserLayout from '../../layouts/UserLayout';
import changepwd from '../../assets/images/change-password.avif'
import '../admin/Profile.css'
const PasswordChange = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === 'confirmPassword' && passwordError) {
            setPasswordError('');
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validatePassword = () => {
        if (!formData.currentPassword) {
            setPasswordError('Current password is required');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }
        if (!/[A-Z]/.test(formData.newPassword) || !/[0-9]/.test(formData.newPassword)) {
            setPasswordError('Password must contain at least one uppercase letter and one number');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPasswordError('');

        if (!validatePassword()) {
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');

        // 🔍 Debug logs
        console.log("🔐 Submitting password change with:");
        console.log("Token:", token);
        console.log("User ID:", user?.id);
        console.log("Email:", user?.email);

        try {
            await apiRequest('/auth/update-doctor-password', {
                method: 'PATCH',
                body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword,
                    new_password_confirmation: formData.confirmPassword,
                }),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success('Password changed successfully!', {
                position: 'top-right',
                autoClose: 2000,
                onClose: () => {
                    navigate('/user/rssdi-save-the-feet-2.0');
                },
            });

            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Password update error:', error);

            let errorMessage = 'Failed to change password. Please try again.';

            if (error.errors) {
                errorMessage = Object.values(error.errors).flat().join(', ');
            } else if (error.message === 'Current password is incorrect') {
                errorMessage = 'Current password is incorrect';
            } else if (error.message === 'Google-authenticated users cannot change passwords') {
                errorMessage = 'Google-authenticated users cannot change passwords';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setPasswordError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <UserLayout>
            <div className="profile-settings-wrapper doctor-column-layout">
                {/* Left Column - Image */}
                <div className="doctor-image-column">
                    <img src={changepwd} alt="Security Illustration" />
                </div>

                {/* Right Column - Form */}
                <div className="profile-settings-container user-pwd">
                    <div className="profile-header">
                        <h1>Change Password</h1>
                        <p>Update your account password</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="security-form">
                        <div className="form-group form-group2">
                            <label>Current Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    required
                                    className={passwordError.includes('Current password') ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('current')}
                                    aria-label={showPassword.current ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.current ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group form-group2">
                            <label>New Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    required
                                    className={passwordError.includes('New password') ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('new')}
                                    aria-label={showPassword.new ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.new ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            <div className="password-strength">
                                <div className={`strength-bar ${formData.newPassword.length > 0 ? 'active' : ''}`}></div>
                                <div className={`strength-bar ${formData.newPassword.length >= 4 ? 'active' : ''}`}></div>
                                <div className={`strength-bar ${formData.newPassword.length >= 8 &&
                                    /[A-Z]/.test(formData.newPassword) &&
                                    /[0-9]/.test(formData.newPassword)
                                    ? 'active' : ''}`}></div>
                            </div>
                            <p className="password-hint">
                                Password must be at least 8 characters with uppercase and number
                            </p>
                        </div>

                        <div className="form-group form-group2">
                            <label>Confirm New Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    required
                                    className={passwordError.includes('Passwords do not match') ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    aria-label={showPassword.confirm ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>

                        <button type="submit" className="save-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <FiCheck className="btn-icon" />
                                    Set New Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </UserLayout>
    
    );
};

export default PasswordChange;