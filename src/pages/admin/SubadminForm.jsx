import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { apiPost } from '../../services/api-helper';
import './Profile.css';

const SubadminForm = () => {
    const navigate = useNavigate();

    const generatePassword = () => {
        const timestamp = Date.now();
        return `Sub@${timestamp}`;
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const autoPassword = generatePassword();
        setFormData((prev) => ({ ...prev, password: autoPassword }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const validate = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'subadmin', // default role
            };

            const res = await apiPost('/subadmin/store', payload);

            if (res?.message?.toLowerCase().includes('created')) {
                toast.success('Subadmin created successfully!');
                setFormData({
                    name: '',
                    email: '',
                    password: generatePassword(),
                });
                setTimeout(() => {
                    navigate('/admin/SubAdminList');
                }, 2000);
            } else {
                throw new Error(res?.message || 'Failed to create subadmin.');
            }
        } catch (err) {
            toast.error(err.message || 'An error occurred.');
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="profile-settings-container">
                <div className="profile-header">
                    <h1>Add Subadmin</h1>
                    <p>Create a new subadmin account</p>
                </div>

                <form onSubmit={handleSubmit} className="security-form">
                    <div className="form-group form-group2">
                        <label>Name</label>
                        <div className="input-with-icon">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group form-group2">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group form-group2 hiden-password-field">
                        <label>Password (Auto-generated)</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                readOnly
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </div>

                    <button type="submit" className="save-btn" disabled={isLoading}>
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <FiCheck className="btn-icon" />
                                Add Subadmin
                            </>
                        )}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default SubadminForm;
