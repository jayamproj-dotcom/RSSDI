"use client"

import { useState, useEffect } from "react"
import { FilePenLine, Clock, AlertCircle } from "lucide-react"
import { hasApprovedEditRequest, getPatientEditRequests } from "../utils/editRequestService"
import EditRequestModal from "./EditRequestModal"
import "./EditRequestButton.css"

const EditRequestButton = ({ patientId, patientName, onEditClick }) => {
    const [showModal, setShowModal] = useState(false)
    const [editStatus, setEditStatus] = useState("none") // none, pending, approved, rejected
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkEditStatus = async () => {
            try {
                // Check if there's an approved edit request
                const isApproved = hasApprovedEditRequest(patientId)

                if (isApproved) {
                    setEditStatus("approved")
                } else {
                    // Check if there are any pending requests
                    const requests = await getPatientEditRequests(patientId)
                    const pendingRequest = requests.find((req) => req.status === "pending")
                    const rejectedRequest = requests.find((req) => req.status === "rejected")

                    if (pendingRequest) {
                        setEditStatus("pending")
                    } else if (rejectedRequest) {
                        setEditStatus("rejected")
                    } else {
                        setEditStatus("none")
                    }
                }
            } catch (error) {
                console.error("Error checking edit status:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkEditStatus()
    }, [patientId])

    const handleEditRequest = () => {
        setShowModal(true)
    }

    const handleSubmitRequest = async (requestData) => {
        try {
            // This will be handled by the parent component
            if (onEditClick) {
                await onEditClick(requestData)
            }

            // Update local state
            setEditStatus("pending")
            setShowModal(false)
        } catch (error) {
            console.error("Error submitting edit request:", error)
        }
    }

    if (isLoading) {
        return (
            <button className="edit-request-button loading" disabled>
                Loading...
            </button>
        )
    }

    // If edit is approved, show regular edit button
    if (editStatus === "approved") {
        return (
            <button className="edit-request-button approved" onClick={() => onEditClick({ type: "direct-edit" })}>
                <FilePenLine size={16} />
                <span>Edit</span>
            </button>
        )
    }

    // If edit request is pending
    if (editStatus === "pending") {
        return (
            <button className="edit-request-button pending" disabled>
                <Clock size={16} />
                <span>Edit Request Pending</span>
            </button>
        )
    }

    // If edit request was rejected
    if (editStatus === "rejected") {
        return (
            <button
                className="edit-request-button rejected"
                onClick={handleEditRequest}
                title="Previous request was rejected. You can submit a new request."
            >
                <AlertCircle size={16} />
                <span>Request Edit Access</span>
            </button>
        )
    }

    // Default state - no request yet
    return (
        <>
            <button className="edit-request-button request" onClick={handleEditRequest}>
                <FilePenLine size={16} />
                <span>Request Edit Access</span>
            </button>

            <EditRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                patientId={patientId}
                patientName={patientName}
                onSubmitRequest={handleSubmitRequest}
            />
        </>
    )
}

export default EditRequestButton
