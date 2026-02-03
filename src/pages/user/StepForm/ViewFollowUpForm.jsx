import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { formatToDDMMYYYY } from "../../../utils/dateUtils";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ViewFollowUpForm.css";

const ViewFollowUpForm = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        const fetchPatientData = () => {
            setLoading(true);
            try {
                const patientRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]");
                const foundPatient = patientRecords.find(record => record.patientId === patientId);

                if (foundPatient) {
                    setPatient(foundPatient);
                } else {
                    console.error("Patient not found");
                    toast.error("Patient not found");
                    setRedirected(true);
                    navigate("/user/dashboard", { replace: true });
                    return;
                }
            } catch (error) {
                console.error("Error fetching patient data:", error);
                toast.error("Error loading patient data");
                setRedirected(true);
                navigate("/user/dashboard", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, navigate]);


    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        try {
            if (!patient || !patient.followUpData) {
                toast.error("No patient data available for PDF generation");
                return;
            }

            const doc = new jsPDF();
            const { followUpData } = patient;

            // Modern color palette
            const primaryColor = [30, 100, 220]; // Deep blue
            const secondaryColor = [100, 116, 139]; // Cool gray
            const accentColor = [0, 179, 164]; // Teal
            const successColor = [16, 185, 129]; // Emerald
            const warningColor = [245, 158, 11]; // Amber
            const dangerColor = [239, 68, 68]; // Red
            const lightBg = [248, 250, 252]; // Lightest gray
            const darkText = [15, 23, 42]; // Almost black

            // Document setup
            doc.setFont("helvetica", "normal");
            doc.setLineHeightFactor(1.2);

            // ===== HEADER SECTION =====
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');

            // Logo placeholder (replace with actual logo if available)
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.text("HEALTHCARE", 20, 25);
            doc.setFontSize(16);
            doc.text("Follow-Up Report", 20, 32);

            // Report title
            doc.setFontSize(18);
            doc.text("PATIENT FOLLOW-UP REPORT", 105, 25, { align: "center" });

            // Report date
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 15, { align: "right" });

            // ===== PATIENT INFORMATION SECTION =====
            let yPosition = 50;

            // Section header
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text("Patient Information", 15, yPosition);
            yPosition += 8;

            // Decorative line
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(15, yPosition, 195, yPosition);
            yPosition += 10;

            // Patient info box
            doc.setFillColor(...lightBg);
            doc.roundedRect(15, yPosition, 180, 30, 3, 3, 'F');
            doc.setFontSize(12);
            doc.setTextColor(...darkText);

            // Patient details in 2 columns
            doc.text(`Name: ${patient.patientName}`, 20, yPosition + 10);
            doc.text(`Patient ID: ${patientId}`, 110, yPosition + 10);
            doc.text(`Date of Birth: ${patient.dob || 'N/A'}`, 20, yPosition + 20);
            doc.text(`Follow-Up Date: ${formatToDDMMYYYY(patient.lastFollowUpDate)}`, 110, yPosition + 20);
            yPosition += 35;

            // ===== TREATMENT OUTCOMES SECTION =====
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text("Treatment Outcomes", 15, yPosition);
            yPosition += 8;
            doc.line(15, yPosition, 195, yPosition);
            yPosition += 15;

            // Modern outcome item function with icon placeholders
            const addOutcomeItem = (label, value, importance = 'normal', icon = null) => {
                // Label
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
                doc.text(`${label.toUpperCase()}:`, 20, yPosition);

                // Value with conditional styling
                doc.setFontSize(12);
                switch (importance) {
                    case 'high':
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(...darkText);
                        break;
                    case 'success':
                        doc.setTextColor(...successColor);
                        break;
                    case 'warning':
                        doc.setTextColor(...warningColor);
                        break;
                    case 'danger':
                        doc.setTextColor(...dangerColor);
                        break;
                    default:
                        doc.setTextColor(...darkText);
                }

                // Value text with icon placeholder
                const iconOffset = icon ? 10 : 0;
                doc.text(value, 60 + iconOffset, yPosition);

                // Placeholder for icons (would use actual icons in production)
                if (icon) {
                    doc.setFillColor(...accentColor);
                    doc.circle(55, yPosition - 2, 3, 'F');
                }

                yPosition += 8;

                // Reset styles
                doc.setFont("helvetica", "normal");
            };

            // Treatment outcomes with visual hierarchy
            addOutcomeItem(
                "Wound Status",
                followUpData.woundHealed === 'yes' ? 'Healed' : 'Not Healed',
                followUpData.woundHealed === 'yes' ? 'success' : 'danger',
                true
            );

            if (followUpData.woundHealed === 'yes') {
                addOutcomeItem("Healing Time", `${followUpData.healingTime} days`);
            } else {
                addOutcomeItem("Current Treatment", followUpData.currentTreatment || 'Not specified');
            }

            addOutcomeItem(
                "Debridement Performed",
                followUpData.woundDebridement === 'yes' ? 'Yes' : 'No',
                'normal',
                true
            );

            addOutcomeItem(
                "Amputation Required",
                followUpData.amputation === 'yes' ? 'Yes' : 'No',
                'high',
                true
            );

            if (followUpData.amputation === 'yes') {
                addOutcomeItem("Amputation Type",
                    followUpData.amputationType === 'minor' ? 'Minor' : 'Major');
                addOutcomeItem("Amputation Level",
                    followUpData.amputationLevel === 'below_knee' ? 'Below Knee' : 'Above Knee');
            }

            addOutcomeItem(
                "Recurrent Ulcer",
                followUpData.recurrentUlcer === 'yes' ? 'Present' : 'None',
                followUpData.recurrentUlcer === 'yes' ? 'warning' : 'success',
                true
            );

            // ===== VITAL STATUS SECTION =====
            yPosition += 10;
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text("Vital Status", 15, yPosition);
            yPosition += 8;
            doc.line(15, yPosition, 195, yPosition);
            yPosition += 15;

            addOutcomeItem(
                "Patient Status",
                followUpData.survivalStatus === 'alive' ? 'Alive' : 'Deceased',
                'high',
                true
            );

            if (followUpData.survivalStatus === 'death') {
                addOutcomeItem("Date of Death", formatToDDMMYYYY(followUpData.deathDate));
                addOutcomeItem("Cause of Death", followUpData.deathReason || 'Not specified');
            }

            // ===== SUMMARY SECTION =====
            yPosition += 15;
            doc.setFillColor(...lightBg);
            doc.roundedRect(15, yPosition, 180, 30, 5, 5, 'F');
            doc.setDrawColor(...primaryColor);
            doc.roundedRect(15, yPosition, 180, 30, 5, 5, 'S');

            doc.setFontSize(12);
            doc.setTextColor(...primaryColor);
            doc.text("CLINICAL SUMMARY", 25, yPosition + 10);

            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            const summaryText = followUpData.survivalStatus === 'alive'
                ? `Patient ${patient.patientName} is currently ${followUpData.woundHealed === 'yes' ?
                    'with healed wounds' : 'undergoing treatment for persistent wounds'}. ${followUpData.recurrentUlcer === 'yes' ?
                        'Recurrent ulcers have been observed.' : 'No recurrent ulcers reported.'}`
                : `Patient ${patient.patientName} deceased on ${formatToDDMMYYYY(followUpData.deathDate)}. ` +
                `Cause of death: ${followUpData.deathReason || 'not specified'}.`;

            doc.text(summaryText, 25, yPosition + 18, { maxWidth: 160 });

            // ===== FOOTER SECTION =====
            doc.setFontSize(8);
            doc.setTextColor(...secondaryColor);

            // Page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: "right" });
            }

            // Confidential notice
            doc.text("CONFIDENTIAL - For authorized medical use only", 105, 287, { align: "center" });

            // Signature line
            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            doc.text("Attending Physician:", 30, 270);
            doc.line(50, 271, 120, 271);
            doc.text("Signature:", 130, 270);
            doc.line(150, 271, 190, 271);

            // QR code placeholder (would use actual QR code in production)
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(160, 255, 30, 30, 3, 3, 'F');
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(6);
            doc.text("SCAN TO VERIFY", 160, 250, { align: "center" });

            // Save the PDF
            const fileName = `FollowUp_${patient.patientName.replace(/\s+/g, '_')}_${patientId}.pdf`;
            doc.save(fileName);

            toast.success("Professional report generated successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate professional report");
        }
    };
    if (redirected) {
        return null; // Don't render anything if we're redirecting
    }

    if (loading) {
        return (
            <div className="followup-loading">
                <div className="loading-spinner"></div>
                <p>Loading patient data...</p>
            </div>
        );
    }

    if (!patient || !patient.followUpData) {
        return (
            <div className="followup-error">
                <div className="error-card">
                    <h2>No follow-up data found</h2>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/user/dashboard", { replace: true })}
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>
        );
    }

    const { followUpData, patientName, lastFollowUpDate } = patient;


    return (
        <div className="followup-container">
            <div className="followup-header">
                <div className="header-info">
                    <h1>Follow-up Assessment Details</h1>
                    <div className="patient-meta">
                        <div className="meta-item">
                            <span className="meta-label">Patient:</span>
                            <span className="meta-value">{patientName}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">ID:</span>
                            <span className="meta-value">{patientId}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Completed:</span>
                            <span className="meta-value">{formatToDDMMYYYY(lastFollowUpDate)}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <a
                        className="btn-secondary action-btn"
                        onClick={() => navigate("/user/dashboard")}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </a>
                    <a
                        className="btn-secondary action-btn"
                        onClick={handlePrint}
                    >
                        <Printer size={18} />
                        <span>Print</span>
                    </a>
                    <a
                        className="download-excel action-btn"
                        onClick={handleDownloadPDF}
                    >
                        <Download size={18} />
                        <span>Download PDF</span>
                    </a>
                </div>
            </div>

            <div className="followup-content">
                <div className="outcomes-section">
                    <h2>Treatment Outcomes</h2>
                    <div className="outcomes-grid">
                        <div className="outcome-card">
                            <label>Wound debridement performed</label>
                            <div className={`outcome-value ${followUpData.woundDebridement === 'yes' ? 'yes' : 'no'}`}>
                                {followUpData.woundDebridement === 'yes' ? 'Yes' : 'No'}
                            </div>
                        </div>

                        <div className="outcome-card">
                            <label>Amputation performed</label>
                            <div className={`outcome-value ${followUpData.amputation === 'yes' ? 'yes' : 'no'}`}>
                                {followUpData.amputation === 'yes' ? 'Yes' : 'No'}
                            </div>
                        </div>

                        <div className="outcome-card">
                            <label>Wound healed</label>
                            <div className={`outcome-value ${followUpData.woundHealed === 'yes' ? 'yes' : 'no'}`}>
                                {followUpData.woundHealed === 'yes' ? 'Yes' : 'No'}
                            </div>
                        </div>

                        {followUpData.amputation === 'yes' && (
                            <>
                                <div className="outcome-card">
                                    <label>Amputation type</label>
                                    <div className="outcome-value">
                                        {followUpData.amputationType === 'minor' ? 'Minor' : 'Major'}
                                    </div>
                                </div>

                                <div className="outcome-card">
                                    <label>Amputation level</label>
                                    <div className="outcome-value">
                                        {followUpData.amputationLevel === 'below_knee' ? 'Below knee' : 'Above knee'}
                                    </div>
                                </div>
                            </>
                        )}

                        {followUpData.woundHealed === 'yes' && (
                            <div className="outcome-card">
                                <label>Healing time (days)</label>
                                <div className="outcome-value">
                                    {followUpData.healingTime}
                                </div>
                            </div>
                        )}

                        <div className="outcome-card">
                            <label>Recurrent ulcer</label>
                            <div className={`outcome-value ${followUpData.recurrentUlcer === 'yes' ? 'yes' : 'no'}`}>
                                {followUpData.recurrentUlcer === 'yes' ? 'Yes' : 'No'}
                            </div>
                        </div>

                        <div className="outcome-card">
                            <label>Survival status</label>
                            <div className={`outcome-value ${followUpData.survivalStatus === 'alive' ? 'alive' : 'deceased'}`}>
                                {followUpData.survivalStatus === 'alive' ? 'Alive' : 'Deceased'}
                            </div>
                        </div>

                        {followUpData.survivalStatus === 'death' && (
                            <>
                                <div className="outcome-card">
                                    <label>Date of death</label>
                                    <div className="outcome-value">
                                        {formatToDDMMYYYY(followUpData.deathDate)}
                                    </div>
                                </div>

                                <div className="outcome-card full-width">
                                    <label>Reason for death</label>
                                    <div className="outcome-value">
                                        {followUpData.deathReason}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFollowUpForm;