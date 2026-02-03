"use client"
import { AlertTriangle, X } from "lucide-react"
import "./ConfirmSubmitModal.css"

const ConfirmSubmitModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null

    return (
        <div className="confirm-submit-overlay">
            <div className="confirm-submit-modal">
                <div className="confirm-submit-header">
                    <h3>Confirm Submission</h3>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="confirm-submit-content">
                    <div className="warning-icon-container">
                        <AlertTriangle size={48} className="warning-icon" />
                    </div>

                    <div className="warning-message">
                        <p className="warning-title">Please review before final submission</p>
                        <p className="warning-description">
                            Once submitted, this form cannot be modified without administrator approval. Please ensure all information
                            is accurate and complete.
                        </p>
                    </div>
                </div>

                <div className="confirm-submit-actions">
                    <button className="secondary-button" onClick={onClose}>
                        Review Form
                    </button>
                    <button className="primary-button warning" onClick={onConfirm}>
                        Submit Form
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmSubmitModal
