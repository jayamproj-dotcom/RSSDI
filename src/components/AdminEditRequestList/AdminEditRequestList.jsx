"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import "./AdminEditRequestList.css"

const AdminEditRequestList = ({ onApprove, onReject }) => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load edit requests from localStorage
        const loadRequests = () => {
            try {
                const storedRequests = localStorage.getItem("editRequests")
                const parsedRequests = storedRequests ? JSON.parse(storedRequests) : []
                setRequests(parsedRequests)
            } catch (error) {
                console.error("Error loading edit requests:", error)
                setRequests([])
            } finally {
                setLoading(false)
            }
        }

        loadRequests()

        // Set up a listener for changes to localStorage
        const handleStorageChange = (e) => {
            if (e.key === "editRequests") {
                loadRequests()
            }
        }

        window.addEventListener("storage", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [])

    const handleApprove = async (requestId) => {
        try {
            await onApprove(requestId)

            // Update local state
            setRequests((prevRequests) =>
                prevRequests.map((req) => (req.id === requestId ? { ...req, status: "approved" } : req)),
            )
        } catch (error) {
            console.error("Error approving request:", error)
        }
    }

    const handleReject = async (requestId) => {
        try {
            await onReject(requestId)

            // Update local state
            setRequests((prevRequests) =>
                prevRequests.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)),
            )
        } catch (error) {
            console.error("Error rejecting request:", error)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    if (loading) {
        return <div className="loading-container">Loading edit requests...</div>
    }

    if (requests.length === 0) {
        return (
            <div className="no-requests">
                <AlertCircle size={24} />
                <p>No edit requests found.</p>
            </div>
        )
    }

    return (
        <div className="edit-requests-container">
            <h2>Edit Requests</h2>

            <div className="edit-requests-list">
                {requests.map((request) => (
                    <div key={request.id} className={`edit-request-item ${request.status}`}>
                        <div className="request-header">
                            <div className="patient-info">
                                <h3>{request.patientName}</h3>
                                <span className="patient-id">{request.patientId}</span>
                            </div>

                            <div className="request-status">
                                {request.status === "pending" && (
                                    <span className="status pending">
                                        <Clock size={16} />
                                        Pending
                                    </span>
                                )}
                                {request.status === "approved" && (
                                    <span className="status approved">
                                        <CheckCircle size={16} />
                                        Approved
                                    </span>
                                )}
                                {request.status === "rejected" && (
                                    <span className="status rejected">
                                        <XCircle size={16} />
                                        Rejected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="request-details">
                            <div className="request-date">
                                <strong>Requested:</strong> {formatDate(request.requestDate)}
                            </div>

                            <div className="request-reason">
                                <strong>Reason:</strong>
                                <p>{request.reason}</p>
                            </div>
                        </div>

                        {request.status === "pending" && (
                            <div className="request-actions">
                                <button className="reject-button" onClick={() => handleReject(request.id)}>
                                    Reject
                                </button>
                                <button className="approve-button" onClick={() => handleApprove(request.id)}>
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminEditRequestList
