import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { apiPost } from '../../services/api-helper';
import './Profile.css';

const ChangePassword = () => {
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
        if (name === 'confirmPassword' || name === 'newPassword') {
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
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        if (!formData.currentPassword) {
            setPasswordError('Current password is required.');
            setIsLoading(false);
            return;
        }
    
        if (!validatePassword()) {
            setIsLoading(false);
            return;
        }
    
        try {
            const payload = {
                current_password: formData.currentPassword,
                new_password: formData.newPassword,
                new_password_confirmation: formData.confirmPassword,
            };
    
            const res = await apiPost('/auth/update-admin-password', payload);
    
            // ✅ Check status by response message (since success is not present)
            if (res?.message === 'Password updated successfully.') {
                toast.success(res.message);
    
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setPasswordError('');
    
                setTimeout(() => {
                    navigate('/admin/foot-exam');
                }, 2000);
            } else {
                throw new Error(res?.message || 'Failed to update password.');
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to update password.';
    
            toast.error(errorMessage);
    
            // ❌ Don't treat success message as a field error
            if (!errorMessage.toLowerCase().includes('updated successfully')) {
                setPasswordError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    
    
    

    return (
        <AdminLayout>
            <div className="profile-settings-container">
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
                            <div className={`strength-bar ${formData.newPassword.length >= 6 ? 'active' : ''}`}></div>
                            <div className={`strength-bar ${formData.newPassword.length >= 8 ? 'active' : ''}`}></div>
                            <div className={`strength-bar ${formData.newPassword.length >= 10 ? 'active' : ''}`}></div>
                        </div>
                        <p className="password-hint">
                            Password must be at least 6 characters
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
                                className={passwordError ? 'input-error' : ''}
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
                        {passwordError && (
                            <p className="error-message">{passwordError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="save-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <FiCheck className="btn-icon" />
                                Change Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default ChangePassword;