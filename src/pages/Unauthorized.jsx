import { useNavigate } from "react-router-dom"
import { LockKeyhole, ShieldAlert, ArrowLeft } from "lucide-react"
import "./unauthorized.css"

export default function Unauthorized() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token") // Clear token
        navigate("/user-login")         // Navigate to login page
    }

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-card">
                <div className="card-indicator"></div>

                <div className="unauthorized-card-header">
                    <div className="unauthorized-header-content">
                        <div className="unauthorized-icon-container">
                            <ShieldAlert className="unauthorized-alert-icon" />
                        </div>
                        <h1 className="unauthorized-page-title">Access Denied</h1>
                    </div>
                </div>

                <div className="unauthorized-card-content">
                    <div className="unauthorized-content-wrapper">
                        <div className="unauthorized-message-box">
                            <p className="unauthorized-message-text">
                                You don't have permission to access this resource. Please contact your administrator if you believe this
                                is an error.
                            </p>
                        </div>

                        <div className="unauthorized-lock-container">
                            <LockKeyhole className="unauthorized-lock-icon" />
                        </div>
                    </div>
                </div>

                <div className="unauthorized-card-footer">
                    <button className="unauthorized-back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft className="unauthorized-back-icon" />
                        Go Back
                    </button>

                    <button className="unauthorized-logout-button" onClick={handleLogout}>
                        Logout & Return Home
                    </button>
                </div>
            </div>
        </div>
    )
}
