"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import { selectCurrentUser, setCredentials } from "../../features/auth/authSlice"
import { FiUser, FiMail, FiPhone, FiUpload, FiCheck } from "react-icons/fi"
import { toast } from "react-toastify"
import { apiRequest } from "../../services/api-helper"
import "./Profile.css"
import { IMAGE_BASE_URL } from "../../config/api"

const Profile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(selectCurrentUser)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewImage, setPreviewImage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [apiDebug, setApiDebug] = useState(null)

    useEffect(() => {
        if (user) {
            console.log("User data from Redux:", user)
            setFormData({
                name: user.name || "",
                email: user.email || user.username || "",
                phone: user.phone || "",
            })
            // Only set previewImage if avatar is valid
            setPreviewImage(user.avatar && !user.avatar.includes("undefined") ? user.avatar : "")
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
        setErrors({
            ...errors,
            [name]: "",
        })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log("Selected file:", file.name, file.size, file.type)
            if (!file.type.startsWith("image/")) {
                setErrors({ ...errors, avatar: "Please upload an image file." })
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, avatar: "Image size must be less than 5MB." })
                return
            }
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                console.log("Preview image set:", reader.result.substring(0, 50) + "...")
                setPreviewImage(reader.result)
            }
            reader.readAsDataURL(file)
            setErrors({ ...errors, avatar: "" })
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required."
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required."
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address."
        }
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be 10 digits."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        if (!validateForm()) {
            setIsLoading(false)
            return
        }

        try {
            const formDataToSubmit = new FormData()
            formDataToSubmit.append("name", formData.name)
            formDataToSubmit.append("phone", formData.phone)
            formDataToSubmit.append("email", formData.email)
            if (selectedFile) {
                formDataToSubmit.append("avatar", selectedFile)
            }
            // ✅ Add these
            formDataToSubmit.append("role", user.role || "admin")
            formDataToSubmit.append("id", user.admin_id || user.id)

            console.log("Sending to API:", {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                hasAvatar: !!selectedFile,
                role: user.role || "admin",     // ✅ role added here
                id: user.admin_id || user.id    // ✅ id added here
            })
            

            const response = await apiRequest(
                "/admin/profile/update",
                {
                    method: "POST",
                    body: formDataToSubmit,
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                },
                2,
                user.token,
            )

            setApiDebug(response)
            console.log("Profile API response:", response)

            if (
                response?.success ||
                response?.status === 200 ||
                response?.message === "Profile updated successfully."
            ) {
                let avatarUrl = user.avatar && !user.avatar.includes("undefined") ? user.avatar : "";

                if (selectedFile) {
                    console.log("Processing avatar URL with admin_id:", user.admin_id, "response admin_id:", response.data?.admin_id);
                    if (response.data?.avatar) {
                        avatarUrl = `${IMAGE_BASE_URL}${response.data.avatar.startsWith("/") ? "" : "/"}${response.data.avatar}?t=${Date.now()}`;
                        console.log("Using API-provided avatar URL:", avatarUrl);
                    } else if (user.admin_id || response.data?.admin_id) {
                        const adminId = user.admin_id || response.data.admin_id;
                        avatarUrl = `${IMAGE_BASE_URL}/uploads/avatars/${adminId}.jpg?t=${Date.now()}`;
                        console.log("Using constructed avatar URL:", avatarUrl);
                    } else {
                        avatarUrl = previewImage;
                        console.log("Using Data URL for avatar:", avatarUrl);
                    }
                } else {
                    console.log("No new image uploaded, retaining existing avatar:", avatarUrl);
                }

                const updatedUser = {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    avatar: avatarUrl,
                    picture: avatarUrl,
                    admin_id: user.admin_id || response.data?.admin_id,
                    username: user.username || response.data?.username,
                };

                console.log("Updating Redux with updated user:", updatedUser);

                dispatch(setCredentials({ user: updatedUser, token: user.token, role: "admin" }));
                toast.success("Profile updated successfully!");

                setTimeout(() => {
                    navigate("/admin/foot-exam");
                }, 1500);
            } else {
                const errMsg = response?.message || "Profile update failed"
                toast.error(errMsg)
                setErrors({ general: errMsg })
            }
        } catch (error) {
            console.error("Profile update error:", error)
            let errorMessage = "Failed to update profile. Please try again."
            if (error.status === 404) {
                errorMessage = "User not found. Please log in again."
                navigate("/admin")
            } else if (error.message) {
                errorMessage = error.message
            }
            toast.error(errorMessage)
            setErrors({ general: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="profile-settings-container">
                <div className="profile-header">
                    <h1>Account Settings</h1>
                    <p>Manage your profile information</p>
                </div>
                <div className="settings-content">
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="avatar-upload">
                            <div className="avatar-preview">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile"
                                        onError={(e) => {
                                            console.error("Profile preview image load error:", e.target.src)
                                            e.target.style.display = "none"
                                            setPreviewImage("")
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">{formData.name.charAt(0).toUpperCase() || "A"}</div>
                                )}
                            </div>
                            <div className="upload-controls">
                                <label className="action-btn sample-excel-download">
                                    <FiUpload className="btn-icon" />
                                    {previewImage ? "Change Photo" : "Upload Photo"}
                                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                </label>
                                {previewImage && (
                                    <button
                                        type="button"
                                        className="remove-btn action-btn"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewImage("")
                                            setErrors({ ...errors, avatar: "" })
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {errors.avatar && <p className="error-message">{errors.avatar}</p>}
                        </div>
                        <div className="form-group form-group2">
                            <label className="pb-2">Full Name</label>
                            <div className="input-with-icon">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className={errors.name ? "input-error" : ""}
                                />
                            </div>
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>
                        <div className="form-group form-group2">
                            <label className="pb-2 pt-2">Email Address (Login Email)</label>
                            <div className="input-with-icon">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className={errors.email ? "input-error" : ""}
                                />
                            </div>
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                        <div className="form-group form-group2">
                            <label className="pb-2 pt-2">Phone Number</label>
                            <div className="input-with-icon">
                                <FiPhone className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    className={errors.phone ? "input-error" : ""}
                                />
                            </div>
                            {errors.phone && <p className="error-message">{errors.phone}</p>}
                        </div>
                        {errors.general && <p className="error-message">{errors.general}</p>}
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isLoading}
                            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                        >
                            {isLoading ? (
                                <>
                                    <FiCheck className="btn-icon" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiCheck className="btn-icon" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                    {/* {apiDebug && (
                        <div
                            className="debug-panel"
                            style={{
                                marginTop: "20px",
                                padding: "15px",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                background: "#f9f9f9",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>API Debug Info</h3>
                            <pre style={{ whiteSpace: "pre-wrap", overflow: "auto", maxHeight: "200px" }}>
                                {JSON.stringify(apiDebug, null, 2)}
                            </pre>
                        </div>
                    )} */}
                </div>
            </div>
        </AdminLayout>
    )
}

export default Profile