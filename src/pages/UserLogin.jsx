import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setCredentials, selectIsAuthenticated, selectCurrentRole } from "../features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiDownload, FiUpload, FiFileText } from "react-icons/fi";
import { apiPost } from "../services/api-helper";
import "./UserLogin.css";
import doctor from "../assets/images/undraw_doctors_djoj.svg";
import { toast } from "react-toastify";
import { apiRequest } from "../services/api-helper"; // Adjust path if needed

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectCurrentRole);
    const from = location.state?.from?.pathname || "/user/rssdi-save-the-feet-2.0";

    useEffect(() => {
        if (isAuthenticated && userRole === "doctor") {
            navigate(from, { replace: true });
        }
    }, [navigate, isAuthenticated, userRole, from]);

    // Check if user is already logged in
    // useEffect(() => {
    //     const isLoggedIn = sessionStorage.getItem("userLoggedIn") || localStorage.getItem("userLoggedIn");
    //     const userInfo = sessionStorage.getItem("userInfo") || localStorage.getItem("userInfo");

    //     if (isLoggedIn && userInfo && isAuthenticated && userRole === "doctor") {
    //         try {
    //             const parsedUser = JSON.parse(userInfo);
    //             if (parsedUser?.email) {
    //                 console.log("Already logged in, redirecting to dashboard");
    //                 navigate("/user/rssdi-save-the-feet-2.0", { replace: true });
    //             }
    //         } catch (err) {
    //             console.error("Invalid userInfo in storage:", err);

    //             sessionStorage.clear();
    //             localStorage.clear();
    //         }
    //     }
    // }, [navigate, isAuthenticated, userRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await apiPost("/auth/login-verify", {
                email,
                password,
            });

            if (!response?.success) {
                throw new Error(response?.message || "Login failed. Please check your credentials.");
            }

            const userInfo = {
                name: response.doctor.name || "Doctor User",
                email: response.doctor.email,
                picture: response.doctor.picture || "",
                role: "doctor",
                id: response.doctor.id,
                phone: response.doctor.phone,
                status: response.doctor.status,
            };

        
            dispatch(setCredentials({
                user: userInfo,
                token: response.token || "session-auth",
                role: "doctor",
                rememberMe,
            }));

            toast.success("Login successful!");
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
           setIsLoading(true); // Show loader
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const googleEmail = decoded.email;

            // Step 1: Check if doctor email exists
            const existResponse = await apiPost("/auth/doctor-email-exist", { email: googleEmail });

            if (!existResponse.exists) {
                // Not found → redirect to signup
                sessionStorage.setItem(
                    "googleDoctorInfo",
                    JSON.stringify({
                        name: decoded.name,
                        email: decoded.email,
                        picture: decoded.picture,
                    })
                );
                toast.info("Doctor account not found. Please sign up.");
                navigate("/user/signup", {
                    state: {
                        googleData: { name: decoded.name, email: decoded.email, picture: decoded.picture },
                    },
                    replace: true,
                });
                return;
            }

            // Step 2: Email exists - fetch all doctors
            const doctorsResponse = await apiRequest("/doctors", { method: "GET" });
            if (!Array.isArray(doctorsResponse)) throw new Error("Failed to fetch doctors list");

            // Step 3: Find doctor by email
            const doctor = doctorsResponse.find((d) => d.email === googleEmail);
            if (!doctor) throw new Error("Doctor data not found for the email");

            // Step 4: Prepare userInfo
            const userInfo = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                role: "doctor",
                id: doctor.id,
                phone: doctor.phone || null,
                status: doctor.status || null,
            };

            // Step 5: Store session data & redux
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem("userInfo", JSON.stringify(userInfo));
            storage.setItem("userLoggedIn", "true");
            storage.setItem("authToken", credentialResponse.credential);
            storage.setItem("lastActivity", Date.now().toString());

            dispatch(
                setCredentials({
                    user: userInfo,
                    token: credentialResponse.credential,
                    role: "doctor",
                })
            );

            toast.success("Login successful!");
            navigate(from || "/", { replace: true });
        } catch (err) {
            console.error("Google login error:", err);
            toast.error(err.message || "Google login failed. Please try again.");
        } finally {
        setIsLoading(false); // Hide loader
    }
    };
      

    const handleGoogleError = () => {
        setIsLoading(false);
        toast.error("Google login failed. Please try again.");
    };

    return (
        <div className="login-container">
            <div className="info-panel">
                <div className="info-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2zM12 15a3 3 0 110-6 3 3 0 010 6z" />
                        </svg>
                        <h1>RSSDI Save the Feet 2.0</h1>
                        <p className="doctor-subtitle">[ Doctor Login ]</p>
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
            <div className="login-panel">
                <div className="login-card">
                    <div className="doctor-login">
                        <div className="login-text">
                            <h2>Doctor Login</h2>
                            <p>Sign in to access your patient dashboard</p>
                        </div>
                        <img src={doctor} alt="Doctor" />
                    </div>
                    {error && (
                        <div className="error-message">
                            <div className="error-icon">!</div>
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="google-login-container">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            size="large"
                            width="300"
                            shape="rectangular"
                            text="continue_with"
                        />
                    </div>
                    <div className="divider">
                        <span>or</span>
                    </div>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="doctor@clinic.com"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <FiLogIn className="button-icon" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                   
                </div>
            </div>
        </div>
    );
};

export default UserLogin;