"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { FaUserCircle, FaUserCog, FaLock, FaSignOutAlt, FaChevronDown } from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux"
import { setCredentials } from "../features/auth/authSlice"
import { apiRequest } from "../services/api-helper"
import "./Header.css"
import { IMAGE_BASE_URL } from "../config/api"

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const dispatch = useDispatch()
    const { user, token } = useSelector((state) => state.auth)
    const [avatarLoaded, setAvatarLoaded] = useState(false)
    const [lastFetchTime, setLastFetchTime] = useState(0)

    console.log("Current auth state:", { user, token })

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const fetchProfile = async () => {
        const now = Date.now()
        // Only fetch if it's been more than 1 minute since last fetch
        if (now - lastFetchTime < 60000 && lastFetchTime !== 0) return

        try {
            console.log("Fetching profile with token:", token)
            setLastFetchTime(now)

            const response = await apiRequest("/admin/profile", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            console.log("Full API response:", response)

            if (!response?.data) {
                console.error("No data in response")
                return
            }

            const profileData = response.data
            console.log("Profile data received:", profileData)

            // Construct avatar URL
            let avatarUrl = ""
            if (profileData.avatar) {
                avatarUrl = `${IMAGE_BASE_URL}${profileData.avatar.startsWith('/') ? '' : '/'}${profileData.avatar}`
                console.log("Constructed avatar URL:", avatarUrl)
            }

            // Update Redux store
            dispatch(setCredentials({
                user: {
                    ...user,
                    ...profileData,
                    avatar: avatarUrl,
                    picture: avatarUrl,
                    name: profileData.name || user?.name,
                    email: profileData.email || user?.email,
                },
                token: token,
                role: user?.role || "admin",
            }))

            // Verify avatar loads
            if (avatarUrl) {
                const img = new Image()
                img.src = avatarUrl
                img.onload = () => {
                    console.log("Avatar image loaded successfully")
                    setAvatarLoaded(true)
                }
                img.onerror = () => {
                    console.log("Failed to load avatar image")
                    setAvatarLoaded(false)
                }
            }
        } catch (error) {
            console.error("Profile fetch error:", error)
        }
    }

    useEffect(() => {
        // Fetch profile only for admin role, not subadmin
        if (user?.role === "admin" && token && (!user?.name || !user?.email || !avatarLoaded)) {
            fetchProfile()
        }
    }, [token, user?.role, user?.name, user?.email, avatarLoaded])

    // Get email from sessionStorage for subadmin
    // Get the most up-to-date email/username display
    const displayEmail = useMemo(() => {
        // Priority 1: Use Redux state if available
        if (user?.email) return user.email;
        if (user?.username) return user.username;

        // Priority 2: Fall back to session storage
        const sessionEmail = sessionStorage.getItem("adminEmail");
        if (sessionEmail) return sessionEmail;

        // Priority 3: Final fallback
        return "Admin";
    }, [user?.email, user?.username]); // Only recompute when these values change


    return (
        <header className="admin-header">
            <div className="header-content">
                <div className="header-title">{/* Optional header title/logo */}</div>
                <div className="header-actions">
                    <div className="profile-dropdown" ref={dropdownRef}>
                        <button
                            className={`profile-button ${isDropdownOpen ? "active" : ""}`}
                            onClick={toggleDropdown}
                            aria-expanded={isDropdownOpen}
                            aria-label="User profile menu"
                        >
                            <div className="profile-info">
                                {user?.role === "admin" && user?.picture && avatarLoaded ? (
                                    <img
                                        src={user.picture}
                                        alt="Profile"
                                        className="profile-picture"
                                        onError={() => setAvatarLoaded(false)}
                                    />
                                ) : (
                                    <FaUserCircle className="profile-icon" />
                                )}
                                <span className="profile-name">{displayEmail}</span>
                                <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? "rotate" : ""}`} />
                            </div>
                        </button>
                        <div className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                            <span className="dropdown-item admin-name-item">
                                {(user?.role === "admin" || user?.role === "subadmin") && (
                                    <div className="admin-name">
                                        {user?.role === "admin" ? user?.name : user?.username}
                                    </div>
                                )}

</span>
                            {user?.role === "admin" && (
                                <>
                                    <Link to="/admin/profile" className="dropdown-item">
                                        <FaUserCog className="dropdown-icon" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/admin/change-password" className="dropdown-item">
                                        <FaLock className="dropdown-icon" />
                                        <span>Change Password</span>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                </>
                            )}
                            {/* <div className="dropdown-divider"></div> */}
                            <Link to="/admin" className="dropdown-item logout">
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header