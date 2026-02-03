"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"
import "./EditRequestModal.css"

const EditRequestModal = ({ isOpen, onClose, patientId, patientName, onSubmitRequest }) => {
    const [reason, setReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!reason.trim()) return

        setIsSubmitting(true)

        try {
            await onSubmitRequest({
                patientId,
                patientName,
                reason,
                requestDate: new Date().toISOString(),
                status: "pending",
            })

            setSubmitted(true)
        } catch (error) {
            console.error("Error submitting edit request:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setReason("")
        setSubmitted(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="edit-request-modal-overlay">
            <div className="edit-request-modal">
                <div className="edit-request-modal-header">
                    <h3>{submitted ? "Request Submitted" : "Request Edit Permission"}</h3>
                    <button className="close-button" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {submitted ? (
                    <div className="edit-request-success">
                        <CheckCircle2 size={48} className="success-icon" />
                        <p>Your edit request has been submitted successfully.</p>
                        <p className="success-note">You will be notified when an administrator approves your request.</p>
                        <button className="primary-button" onClick={handleClose}>
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="edit-request-info">
                            <AlertCircle size={20} className="info-icon" />
                            <p>You are requesting permission to edit a submitted form. Please provide a reason for this request.</p>
                        </div>

                        <div className="edit-request-patient-info">
                            <p>
                                <strong>Patient ID:</strong> {patientId}
                            </p>
                            <p>
                                <strong>Patient Name:</strong> {patientName}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="edit-reason">Reason for edit request:</label>
                                <textarea
                                    id="edit-reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please explain why you need to edit this form..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="edit-request-actions">
                                <button type="button" className="secondary-button" onClick={handleClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-button" disabled={isSubmitting || !reason.trim()}>
                                    {isSubmitting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

export default EditRequestModal
