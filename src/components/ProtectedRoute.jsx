// components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentRole, selectAuthLoading } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import { checkSessionActive } from "../utils/sessionManager";

const ProtectedRoute = ({ allowedRoles = ["doctor", "admin"], redirectPath = "/user-login" }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectCurrentRole);
    const authLoading = useSelector(selectAuthLoading);
    const location = useLocation();
    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            setSessionChecked(true);
        }
    }, [authLoading]);

    if (authLoading || !sessionChecked) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const isSessionActive = checkSessionActive();

    if (!isAuthenticated || !isSessionActive) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};






export default ProtectedRoute
