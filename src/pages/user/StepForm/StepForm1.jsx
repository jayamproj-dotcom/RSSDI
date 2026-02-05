"use client"

import { useState, useEffect, useRef } from "react"
import { FiUser, FiDownloadCloud, FiUploadCloud, FiFile, FiX, FiAlertCircle } from "react-icons/fi"
import { Country, State, City } from 'country-state-city';
import { apiRequest } from "../../../services/api-helper"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"; // Add this import
import { selectCurrentUser } from "../../../features/auth/authSlice"; // Add this import
import { apiGet } from "../../../services/api-helper"; // adjust path if needed
import { FiAlertTriangle, FiRefreshCw, FiInfo } from "react-icons/fi";

import "./StepForm.css"

const StepForm1 = ({ formData, handleChange, errors, setErrors }) => {
    console.log("formData", formData.section1)
    const [facilities, setFacilities] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isReadOnly, setIsReadOnly] = useState(false);

    const [hasHistory, setHasHistory] = useState({
        ulcer: false,
        amputation: false,
        angioplasty: false,
    })
    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processConsentUpload(file);
        }
    };
    const fileInputRef = useRef(null) // Add ref for file input
    // Get current doctor from Redux store
    const currentDoctor = useSelector(selectCurrentUser)
    const fetchDoctorDetails = async () => {
        if (!currentDoctor?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiGet(`/doctors/${currentDoctor.id}`);
            console.log("Doctor API facility_type:", response.data); // Add this log

            if (response.data) {
                setIsReadOnly(true);

                // Convert facility_type to lowercase to match option values
                const facilityType = response.data.facility_type?.toLowerCase() || "";

                handleChange({
                    target: { name: "facilityName", value: response.data.facility_name || "" }
                }, "section1");

                handleChange({
                    target: { name: "facilityLocation", value: response.data.facility_address || "" }
                }, "section1");
                handleChange({
                    target: { name: "facilityState", value: response.data.facility_state || "" }
                }, "section1");

                handleChange({
                    target: { name: "facilityType", value: facilityType }
                }, "section1");

                handleChange({
                    target: { name: "facilityEmail", value: response.data.email || "" }
                }, "section1");
            }
        } catch (err) {
            console.error("Failed to fetch doctor:", err);
            setIsReadOnly(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch doctor details on load
    useEffect(() => {
        fetchDoctorDetails();
    }, [currentDoctor?.id]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (formData.section1.consentFormPreview && formData.section1.consentFormPreview.startsWith('blob:')) {
                URL.revokeObjectURL(formData.section1.consentFormPreview)
            }
        }
    }, [formData.section1.consentFormPreview])

    // const handleDownloadConsentForm = () => {
    //     const pdfPath = "/consent_form_registry.pdf"; // served from public/


    //     fetch(pdfPath)
    //         .then((res) => {
    //             if (!res.ok) {
    //                 throw new Error('PDF file not found');
    //             }

    //             const link = document.createElement('a');
    //             link.href = pdfPath; // Optional: cache busting
    //             link.download = 'consent_form_registry.pdf';
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);

    //             handleChange(
    //                 { target: { name: "consentDownloaded", value: true } },
    //                 "section1"
    //             );
    //         })
    //         .catch((err) => {
    //             console.error("File not found:", err);
    //             setErrors((prev) => ({
    //                 ...prev,
    //                 consentForm: 'Consent form template not found',
    //             }));
    //             toast.error("Failed to download consent form. File not found.");
    //         });
    // };


    const handleDownloadConsentForm = () => {
        const pdfPath = "/consent_form_registry.pdf"; // served from public/

        // Open PDF in a new tab
        window.open(pdfPath, "_blank");

        // Trigger download with a nice file name
        const link = document.createElement("a");
        link.href = pdfPath;
        link.download = "Consent_form_registry.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        handleChange(
            { target: { name: "consentDownloaded", value: true } },
            "section1"
        );

        toast.success("Consent form downloaded successfully!");
    };


    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processConsentUpload(file);
        }
    };

    const processConsentUpload = (file) => {
        // Clear previous error
        setErrors(prev => ({ ...prev, consentForm: null }));

        let error = null;
        if (file.size > 2 * 1024 * 1024) {
            error = 'File exceeds 2MB limit';
        } else if (file.type !== 'application/pdf') {
            error = 'Only PDF files are allowed';
        }

        if (error) {
            setErrors(prev => ({ ...prev, consentForm: error }));
            return;
        }

        const previewUrl = '/pdf-icon.png';

        handleChange({ target: { name: "consentForm", value: file } }, "section1");
        handleChange({ target: { name: "consentFormPreview", value: previewUrl } }, "section1");
        handleChange({ target: { name: "consentFormName", value: file.name } }, "section1");
        handleChange({ target: { name: "consentUploaded", value: true } }, "section1");
        handleChange({ target: { name: "consentVerified", value: false } }, "section1");

        console.log("After Upload Consent:", {
            consentForm: file,
            consentFormName: file.name,
            consentFormPreview: previewUrl
        });
    };

    const handleRemoveConsent = () => {
        if (formData.section1.consentFormPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(formData.section1.consentFormPreview);
        }

        handleChange({ target: { name: "consentForm", value: null } }, "section1");
        handleChange({ target: { name: "consentFormPreview", value: null } }, "section1");
        handleChange({ target: { name: "consentFormName", value: null } }, "section1");
        handleChange({ target: { name: "consentUploaded", value: false } }, "section1");
        handleChange({ target: { name: "consentVerified", value: false } }, "section1");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        console.log("After Remove Consent:", formData.section1);
    };



    //  console.log("hasUlcer value:", formData.section1.hasUlcer);

    //  console.log("wearFootWear value:", formData.section1.wearFootWear);

    const normalize = (val) =>
        val?.toString().trim().toLowerCase()


    return (
        <div className="medical-add-container">
            {/* <div className="medical-add-header">
                <h1>Participant Information (baseline)</h1>
                <p className="medical-add-subtitle">Proforma - Patient Information</p>
            </div> */}

            <form className="medical-add-form">

                {/* Section 1: Consent Form - Side by Side Layout */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Consent Form</h2>
                    <div className="medical-add-row" style={{ display: 'flex', gap: '20px' }}>
                        {/* Download Column */}
                        <div className="medical-add-group medical-add-uplaod-column" style={{ flex: 1 }}>
                            <div className="consent-download-box">
                                <h3 className="consent-subtitle">Download Consent Form</h3>
                                <div className="download-content">
                                    <FiDownloadCloud className="download-icon" />
                                    <p className="download-description">
                                        Please download, print, sign, and upload the completed form
                                    </p>
                                    <button
                                        type="button"
                                        className="download-btn"
                                        onClick={handleDownloadConsentForm}
                                    >
                                        {formData.section1.consentDownloaded ? 'Downloaded' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upload Column */}
                        <div className="medical-add-group medical-add-uplaod-column" style={{ flex: 1 }}>
                            <div className={`consent-upload-box ${errors.consentForm ? 'upload-error' : ''} ${isDragging ? 'drag-over' : ''} ${formData.section1.consentForm ? 'active' : ''}`} >


                                <h3 className="consent-subtitle">Upload Signed Consent</h3>

                                <div
                                    className={`upload-content ${isDragging ? 'drag-over' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleClickUpload}
                                >
                                    <input
                                        type="file"
                                        id="consentUpload"
                                        accept=".pdf"
                                        ref={fileInputRef}
                                        onChange={handleFileInputChange}
                                        className="upload-input"
                                        style={{ display: 'none' }}
                                    />

                                    <label htmlFor="consentUpload" className="upload-label">
                                        <FiUploadCloud className="upload-icon" />
                                        <p className="upload-instructions">
                                            {formData.section1.consentForm
                                                ? `File uploaded: ${formData.section1.consentFormName || 'consent_form.pdf'}`
                                                : 'Drag & drop or click to upload signed PDF (Max 2MB)'}
                                        </p>

                                        {formData.section1.consentForm && (
                                            <div className="file-preview">
                                                <FiFile className="file-icon" />
                                                <span>{formData.section1.consentFormName || 'consent_form.pdf'}</span>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={handleRemoveConsent}
                                                    aria-label="Remove consent form"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {errors.consentForm && (
                                    <div className="upload-error-message">
                                        <FiAlertCircle className="error-icon" />
                                        <span>{errors.consentForm}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Verification Checkbox */}

                    <div className="medical-add-group medical-add-uplaod-column">
                        <div className="consent-verification required">
                            <label className="verification-label">
                                <input
                                    type="checkbox"
                                    name="consentVerified"

                                    checked={formData.section1.consentVerified || false}
                                    onChange={(e) => handleChange(
                                        { target: { name: "consentVerified", value: e.target.checked } },
                                        "section1"
                                    )}

                                // disabled={!formData.section1.consentUploaded}
                                />
                                <span className="checkmark"></span>
                                I verify that the participant has signed the consent and it will be shared with MV Hospital.
                            </label>
                            {errors.consentVerified && (
                                <span className="medical-add-error-message">{errors.consentVerified}</span>
                            )}
                        </div>
                    </div>

                </div>


                {/* Section 3: Socio-Demographic Information */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title"> Socio-Demographic Information</h2>
                    <div className="medical-add-row3">
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Full Name</label>
                            <div className="input-with-icon">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="patient_name"
                                    value={formData.section1.patient_name}
                                    onChange={(e) => handleChange(e, "section1")}
                                    placeholder="Patient Name"
                                    required
                                    className={`medical-add-input ${errors.patient_name ? "medical-add-error-field" : ""}`}
                                />
                            </div>
                            {errors.patient_name && <span className="medical-add-error-message">{errors.patient_name}</span>}
                        </div>
                        {/* Age Field */}
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.section1.age || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-input ${errors.age ? "medical-add-error-group" : ""}`}
                                placeholder="Enter patient's age"
                                required
                            />
                            {errors.age && <span className="medical-add-error-message">{errors.age}</span>}
                        </div>

                        {/* Gender Field */}
                        <div className="medical-add-group  ">
                            <label className="medical-add-label required">Gender</label>
                            <div className={`medical-add-radio-group ${errors.gender ? "medical-add-error-group" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.section1.gender === "male"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                        required
                                    />
                                    <span className="medical-add-radio-button-label">Male</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.section1.gender === "female"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Female</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        checked={formData.section1.gender === "other"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Other</span>
                                </label>
                            </div>
                            {errors.gender && <span className="medical-add-error-message">{errors.gender}</span>}
                        </div>

                        <div className="medical-add-group locality-group ">
                            <label className="medical-add-label ">Locality</label>
                            <div className={`medical-add-radio-group ${errors.locality ? "medical-add-error-group" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="locality"
                                        value="urban"
                                        checked={formData.section1.locality === "urban"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"

                                    />
                                    <span className="medical-add-radio-button-label">Urban</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="locality"
                                        value="rural"
                                        checked={formData.section1.locality === "rural"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Rural</span>
                                </label>
                            </div>
                            {errors.locality && <span className="medical-add-error-message">{errors.locality}</span>}
                        </div>
                    </div>
                    <div className="medical-add-row">
                        {/* Village/Town/City */}
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Village / Town / City</label>
                            <input
                                type="text"
                                name="villageOrCity"
                                value={formData.section1.villageOrCity || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="Enter location"
                                className={`medical-add-input ${errors.villageOrCity ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.villageOrCity && <span className="medical-add-error-message">{errors.villageOrCity}</span>}
                        </div>

                        {/* State Dropdown */}
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">State</label>
                            <select
                                name="state"
                                value={formData.section1.state || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-input ${errors.state ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="">Select</option>
                                {State.getStatesOfCountry("IN").map((state) => (
                                    <option key={state.isoCode} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <span className="medical-add-error-message">{errors.state}</span>}
                        </div>

                        {/* PIN Code */}
                        <div className="medical-add-group ">
                            <label className="medical-add-label ">PIN Code</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.section1.pincode || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="6-digit PIN"
                                maxLength="6"
                                className={`medical-add-input ${errors.pincode ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.pincode && <span className="medical-add-error-message">{errors.pincode}</span>}
                        </div>
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Education</label>
                            <select
                                name="education"
                                value={formData.section1.education}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-select ${errors.education ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="">Select education level</option>
                                <option value="illiterate">Illiterate</option>
                                <option value="primary">Primary School</option>
                                <option value="secondary">Secondary School</option>
                                <option value="higher">Higher Secondary</option>
                                <option value="graduate">Graduate</option>
                                <option value="postgraduate">Post Graduate</option>
                            </select>
                            {errors.education && <span className="medical-add-error-message">{errors.education}</span>}
                        </div>
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Occupation</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.section1.occupation}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="Occupation"
                                className={`medical-add-input ${errors.occupation ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.occupation && <span className="medical-add-error-message">{errors.occupation}</span>}
                        </div>
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Marital Status</label>
                            <select
                                name="maritalStatus"
                                value={formData.section1.maritalStatus}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-select ${errors.maritalStatus ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="">Select marital status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="separated">Separated</option>
                                <option value="widow">Widow/Widower</option>
                            </select>
                            {errors.maritalStatus && <span className="medical-add-error-message">{errors.maritalStatus}</span>}
                        </div>
                        <div className="medical-add-group ">
                            <label className="medical-add-label required mb-0">Subjective Socio-economic status (SES)</label>
                            <p className="ses-instruction">Rate yourself and give a score in the SES ladder from 1 - 10 (low to high)</p>

                            <div className="ses-rating-container">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        name="sesRating"
                                        value={num}
                                        className={`ses-rating-option ${Number(formData?.section1?.sesRating) === num ? "ses-rating-selected" : ""
                                            }`}
                                        onClick={(e) => handleChange(e, "section1")}
                                    >
                                        {num} {/* ✅ This displays the number inside the button */}
                                    </button>
                                ))}
                            </div>

                            {errors.sesRating && (
                                <span className="medical-add-error-message">{errors.sesRating}</span>
                            )}
                        </div>


                        <div className="medical-add-group ">
                            <label className="medical-add-label required">Total Family Members</label>
                            <input
                                type="number"
                                name="familyMembers"
                                value={formData.section1.familyMembers}
                                onChange={(e) => handleChange(e, "section1")}
                                min="1"
                                className={`medical-add-input ${errors.familyMembers ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.familyMembers && <span className="medical-add-error-message">{errors.familyMembers}</span>}
                        </div>
                        <div className="medical-add-group ">
                            <label className="medical-add-label required">No. of dependent family members</label>
                            <input
                                type="number"
                                name="dependents"
                                value={formData.section1.dependents}
                                onChange={(e) => handleChange(e, "section1")}
                                min="0"
                                className={`medical-add-input ${errors.dependents ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.dependents && <span className="medical-add-error-message">{errors.dependents}</span>}
                        </div>
                    </div>





                </div>
                {/* Health Facility Information Section */}
                {/* Health Facility Information Section */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Health Facility Details</h2>

                    {isLoading ? (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            <span>Loading facility information...</span>
                        </div>
                    ) : (
                        <>
                            <div className="medical-add-row3 medical-add-row4">
                                <div className="medical-add-group">
                                    <label className="medical-add-label required">Name of the Facility</label>
                                    <input
                                        type="text"
                                        name="facilityName"
                                        value={formData.section1.facilityName || ""}
                                        onChange={(e) => handleChange(e, "section1")}
                                        readOnly={isReadOnly}
                                        className={`medical-add-input ${isReadOnly ? "readonly-field" : ""}`}
                                        placeholder="Enter facility name"
                                        required
                                    />
                                </div>

                                <div className="medical-add-group">
                                    <label className="medical-add-label required">Location of Health Facility</label>
                                    <input
                                        type="text"
                                        name="facilityLocation"
                                        value={formData.section1.facilityLocation || ""}
                                        onChange={(e) => handleChange(e, "section1")}
                                        readOnly={isReadOnly}
                                        className={`medical-add-input ${isReadOnly ? "readonly-field" : ""}`}
                                        placeholder="Enter facility address"
                                        required
                                    />
                                </div>
                                <div className="medical-add-group">
                                    <label className="medical-add-label required">State of Health Facility</label>
                                    <input
                                        type="text"
                                        name="facilityState"
                                        value={formData.section1.facilityState || ""}
                                        onChange={(e) => handleChange(e, "section1")}
                                        readOnly={isReadOnly}
                                        className={`medical-add-input ${isReadOnly ? "readonly-field" : ""}`}
                                        placeholder="Enter facility state"
                                        required
                                    />
                                </div>
                                <div className="medical-add-group">
                                    <label className="medical-add-label required">Type of Facility</label>
                                    <select
                                        name="facilityType"
                                        value={formData.section1.facilityType || ""}
                                        onChange={(e) => handleChange(e, "section1")}
                                        disabled={isReadOnly && formData.section1.facilityType} // Only disable if we have a value
                                        className={`medical-add-select ${isReadOnly && formData.section1.facilityType ? "readonly-field" : ""}`}
                                        required
                                    >
                                        <option value="">Select facility type</option>
                                        <option value="primary">Primary</option>
                                        <option value="secondary">Secondary</option>
                                        <option value="tertiary">Tertiary</option>
                                    </select>
                                    {!formData.section1.facilityType && isReadOnly && (
                                        <div className="field-warning">
                                            <FiAlertTriangle /> Facility type not available in your profile
                                        </div>
                                    )}
                                </div>

                                <div className="medical-add-group">
                                    <label className="medical-add-label required">Email Address</label>
                                    <input
                                        type="email"
                                        name="facilityEmail"
                                        value={formData.section1.facilityEmail || ""}
                                        onChange={(e) => handleChange(e, "section1")}
                                        readOnly={isReadOnly}
                                        className={`medical-add-input ${isReadOnly ? "readonly-field" : ""}`}
                                        placeholder="Enter facility email"
                                        required
                                    />
                                </div>
                            </div>

                            {isReadOnly ? (
                                <div className="facility-info-note">
                                    <FiInfo className="info-icon" />
                                    <p>
                                        {formData.section1.facilityType
                                            ? "Prefilled with registered facility information."
                                            : "Partially prefilled - some information requires manual entry."}
                                    </p>
                                </div>
                            ) : (
                                <div className="facility-info-note">
                                    <FiInfo className="info-icon" />
                                    <p>Please enter your facility information manually.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>




                {/* Section 4: Medical History */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title"> Medical History</h2>

                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Type of Diabetes</label>
                            <div className={`medical-add-radio-group ${errors.diabetesType ? "medical-add-error-group" : ""}`}>
                                {["type1", "type2", "other"].map((type) => (
                                    <label className="medical-add-radio-label" key={type}>
                                        <input
                                            type="radio"
                                            name="diabetesType"
                                            value={type}
                                            checked={formData.section1.diabetesType === type}
                                            onChange={(e) => handleChange(e, "section1")}
                                            className="medical-add-radio-button"
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">
                                            {type === "type1" ? "Type 1" : type === "type2" ? "Type 2" : "Other"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.diabetesType && <span className="medical-add-error-message">{errors.diabetesType}</span>}
                        </div>

                        <div className="medical-add-group">
                            <label className="medical-add-label required">Duration of Diabetes( in years )</label>
                            <input
                                type="number"
                                name="diabetesDuration"
                                value={formData.section1.diabetesDuration}
                                onChange={(e) => handleChange(e, "section1")}
                                min="0"
                                className={`medical-add-input ${errors.diabetesDuration ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.diabetesDuration && <span className="medical-add-error-message">{errors.diabetesDuration}</span>}
                        </div>
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Treatment</label>
                            <select
                                name="treatmentType"
                                value={formData.section1.treatmentType || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-input ${errors.treatmentType ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="" disabled>Select treatment type</option>
                                <option value="Oral_Hypoglycaemic_agents ">Oral Hypoglycaemic agents</option>
                                <option value="Oral_Hypoglycaemic_agents_Insulin">Oral Hypoglycaemic agents + Insulin</option>
                                <option value="Only_Insulin">Only Insulin</option>
                            </select>
                            {errors.treatmentType && (
                                <span className="medical-add-error-message">{errors.treatmentType}</span>
                            )}
                        </div>

                    </div>

                    <div className="">
                        <label className="medical-add-label">History of:</label>
                        <div className="medical-add-row">
                            <div className="medical-add-group">
                                <label className="medical-add-label required">Leg/Foot Ulcer</label>

                                <div className={`medical-add-radio-group ${errors.hasUlcer ? "medical-add-error-group" : ""}`}>
                                    {["yes", "no"].map((val) => (
                                        <label className="medical-add-radio-label" key={`ulcer-${val}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasUlcer"
                                                value={val}
                                                checked={formData?.section1?.hasUlcer === val}
                                                onChange={() => {
                                                    handleChange(
                                                        { target: { name: "hasUlcer", value: val } },
                                                        "section1"
                                                    );
                                                    setHasHistory((prev) => ({ ...prev, ulcer: val === "yes" }));
                                                }}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">
                                                {val === "yes" ? "Yes" : "No"}
                                            </span>
                                        </label>
                                    ))}
                                </div>


                                {errors.hasUlcer && (
                                    <span className="medical-add-error-message">{errors.hasUlcer}</span>
                                )}
                            </div>


                            <div className="medical-add-group">
                                <label className="medical-add-label required">Amputation</label>
                                <div className={`medical-add-radio-group ${errors.hasAmputation ? "medical-add-error-group" : ""}`}>
                                    {[
                                        { value: "No", label: "No" },
                                        { value: "Minor", label: "Minor" },
                                        { value: "Major", label: "Major" },
                                    ].map((option) => (
                                        <label className="medical-add-radio-label" key={`hasAmputation-${option.value}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasAmputation"
                                                value={option.value}
                                                checked={
                                                    normalize(formData.section1.hasAmputation) ===
                                                    normalize(option.value)
                                                }
                                                onChange={(e) => handleChange(e, "section1")}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.hasAmputation && (
                                    <span className="medical-add-error-message">{errors.hasAmputation}</span>
                                )}
                            </div>


                            <div className="medical-add-group">
                                <label className="medical-add-label required">Lower Limb Angioplasty/Stent/Byepass</label>
                                <div className={`medical-add-radio-group ${errors.hasAngioplasty ? "medical-add-error-group" : ""}`}>
                                    {["yes", "no"].map((val) => (
                                        <label className="medical-add-radio-label" key={`angioplasty-${val}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasAngioplasty"
                                                value={val}
                                                checked={formData?.section1?.hasAngioplasty === val}
                                                onChange={() => {
                                                    handleChange(
                                                        { target: { name: "hasAngioplasty", value: val } },
                                                        "section1"
                                                    );
                                                    setHasHistory((prev) => ({
                                                        ...prev,
                                                        angioplasty: val === "yes",
                                                    }));
                                                }}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">
                                                {val === "yes" ? "Yes" : "No"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {errors.hasAngioplasty && <span className="medical-add-error-message">{errors.hasAngioplasty}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Other Complications */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Other Diabetic Complications / Comorbidities</h2>
                    <div className="medical-add-row3">
                        {[
                            {
                                name: "renal",
                                label: "Renal (dialysis/transplant) :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "retinal",
                                label: "Retinal (visual impairment) :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "cardiovascular",
                                label: "Cardiovascular disease :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "heartFailure",
                                label: "Heart Failure :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "cerebrovascular",
                                label: "Cerebrovascular disease :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "limbIschemia",
                                label: "Lower Limb Ischaemia :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "hypertension",
                                label: "Hypertension :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                                verticalRadio: true,
                            },
                        ].map((item) => {
                            const field = item.name;
                            const duration = `${item.name}Duration`;

                            return (
                                <div className="medical-add-group" key={field}>
                                    {item.verticalRadio ? (
                                        // Vertical layout for fields like Hypertension
                                        <div className="medical-add-column-layout">
                                            <label className="medical-add-label required">{item.label}</label>
                                            <div className={`medical-add-radio-group ${errors[field] ? "medical-add-error-group" : ""}`}>
                                                {["yes", "no"].map((val) => (
                                                    <label className="medical-add-radio-label " key={`${field}-${val}`}>
                                                        <input
                                                            type="radio"
                                                            className="medical-add-radio-button"
                                                            name={field}
                                                            value={val}
                                                            checked={formData?.section1?.[field] === val}
                                                            onChange={() => {
                                                                handleChange(
                                                                    { target: { name: field, value: val } },
                                                                    "section1"
                                                                );
                                                                setHasHistory((prev) => ({
                                                                    ...prev,
                                                                    [field]: val === "yes",
                                                                }));
                                                            }}
                                                            required
                                                        />
                                                        <span className="medical-add-radio-button-label">{val === "yes" ? "Yes" : "No"}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[field] && <span className="medical-add-error-message">{errors[field]}</span>}

                                            {formData?.section1?.[field] === "yes" && (
                                                <div className="medical-add-duration-input">
                                                    <label className="medical-add-radio-label">{item.inputLabel}</label>
                                                    <input
                                                        type={item.inputType}
                                                        name={duration}
                                                        value={formData?.section1?.[duration] || ""}
                                                        onChange={(e) => handleChange(e, "section1")}
                                                        min={item.inputType === "number" ? "0" : undefined}
                                                        className={`medical-add-input ${errors[duration] ? "medical-add-error-field" : ""}`}
                                                        required
                                                    />
                                                    {errors[duration] && <span className="medical-add-error-message">{errors[duration]}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Horizontal layout for all other fields
                                        <div className="medical-add-column-layout">
                                            <label className="medical-add-label required">{item.label}</label>
                                            <div className={`medical-add-radio-group ${errors[field] ? "medical-add-error-group" : ""}`}>
                                                {["yes", "no"].map((val) => (
                                                    <label className="medical-add-radio-label" key={`${field}-${val}`}>
                                                        <input
                                                            type="radio"
                                                            className="medical-add-radio-button"
                                                            name={field}
                                                            value={val}
                                                            checked={formData?.section1?.[field] === val}
                                                            onChange={() => {
                                                                handleChange(
                                                                    { target: { name: field, value: val } },
                                                                    "section1"
                                                                );
                                                                setHasHistory((prev) => ({
                                                                    ...prev,
                                                                    [field]: val === "yes",
                                                                }));
                                                            }}
                                                            required
                                                        />
                                                        <span className="medical-add-radio-button-label">{val === "yes" ? "Yes" : "No"}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[field] && <span className="medical-add-error-message">{errors[field]}</span>}

                                            {formData?.section1?.[field] === "yes" && (
                                                <div className="medical-add-duration-input">
                                                    <label className="medical-add-radio-label required">{item.inputLabel}</label>
                                                    <input
                                                        type={item.inputType}
                                                        name={duration}
                                                        value={formData?.section1?.[duration] || ""}
                                                        onChange={(e) => handleChange(e, "section1")}
                                                        min={item.inputType === "number" ? "0" : undefined}
                                                        className={`medical-add-input ${errors[duration] ? "medical-add-error-field" : ""}`}
                                                        required
                                                    />
                                                    {errors[duration] && <span className="medical-add-error-message">{errors[duration]}</span>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Section 6: Lifestyle Factors */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Lifestyle Factors</h2>

                    <div className="medical-add-row2">
                        {/* Smoking Habit */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Smoking Habit</label>
                            <div className={`medical-add-radio-group ${errors.smoking ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    { value: "current", label: "Yes, Current Smoker" },
                                    { value: "former", label: "Ex-Smoker" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`smoking-${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="smoking"
                                            value={option.value}
                                            checked={formData.section1.smoking === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.smoking && <span className="medical-add-error-message">{errors.smoking}</span>}
                        </div>

                        {/* Alcohol Consumption */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Alcohol Consumption</label>
                            <div className={`medical-add-radio-group ${errors.alcohol ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    { value: "current", label: "Yes, Current Consumer" },
                                    { value: "former", label: "Ex-Consumer" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`alcohol-${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="alcohol"
                                            value={option.value}
                                            checked={formData.section1.alcohol === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.alcohol && <span className="medical-add-error-message">{errors.alcohol}</span>}
                        </div>

                        {/* Tobacco Chewing */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Tobacco Chewing</label>
                            <div className={`medical-add-radio-group ${errors.tobacco ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    { value: "current", label: "Yes, Current Consumer" },
                                    { value: "former", label: "Ex-Consumer" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`tobacco-${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="tobacco"
                                            value={option.value}
                                            checked={formData.section1.tobacco === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.tobacco && <span className="medical-add-error-message">{errors.tobacco}</span>}
                        </div>
                    </div>
                </div>


                {/* Section 7: Foot Care Habits */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Foot Care Habits</h2>

                    <div className="medical-add-row">
                        {[
                            {
                                name: "wearFootWear",
                                label: "Do you wear footwear?",
                                options: [
                                    { value: "indoor", label: "Indoor" },
                                    { value: "outdoor", label: "Outdoor" },
                                    { value: "both", label: "Both" },
                                    { value: "No", label: "No" }
                                ]
                            },
                            {
                                name: "regularfootExamination",
                                label: "Do you examine your feet at home regularly?",
                                options: [
                                    { value: "true", label: "Yes" },
                                    { value: "false", label: "No" }
                                ]
                            },
                            {
                                name: "walkOnSand",
                                label: "Do you walk on sand/mud/clay for work?",
                                options: [
                                    { value: "true", label: "Yes" },
                                    { value: "false", label: "No" }
                                ]
                            },
                            {
                                name: "washFeet",
                                label: "Do you wash your feet when you come back home from outside?",
                                options: [
                                    { value: "true", label: "Yes" },
                                    { value: "false", label: "No" }
                                ]
                            }
                        ].map((item) => (
                            <div className="medical-add-group" key={item.name}>
                                <label className="medical-add-label required">{item.label}</label>
                                <div className={`medical-add-radio-group ${errors[item.name] ? "medical-add-error-group" : ""}`}>
                                    {item.options.map((option) => (
                                        <label className="medical-add-radio-label" key={`${item.name}-${option.value}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name={item.name}
                                                value={option.value}
                                                checked={formData.section1[item.name] === option.value}
                                                onChange={(e) => handleChange(e, "section1")}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors[item.name] && (
                                    <span className="medical-add-error-message">{errors[item.name]}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 8: Biochemical Investigation */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">
                        Biochemical Investigation (reports within 4 months )
                    </h2>
                    <div className="medical-add-row3">
                        {[
                            { name: "fastingGlucose", label: "Fasting Glucose (mg/dl)", required: true },
                            { name: "postPrandialGlucose", label: "Post Prandial Glucose (mg/dl)", required: true },
                            { name: "hba1c", label: "HbA1c %", required: true },
                            { name: "totalCholesterol", label: "T. Cholesterol (mg/dl)" },
                            { name: "triglycerides", label: "Triglycerides (mg/dl)" },
                            { name: "hdl", label: "HDL (mg/dl)" },
                            { name: "ldl", label: "LDL (mg/dl)" },
                            { name: "vldl", label: "VLDL (mg/dl)" },
                            { name: "serumCreatinine", label: "Serum Creatinine (mg/dl)", required: true }, // removed required
                        ].map((item) => (
                            <div className="medical-add-group bordernone" key={item.name}>
                                <label
                                    className={`medical-add-label ${item.required ? "required" : ""}`}
                                >
                                    {item.label}
                                </label>
                                <input
                                    type="number"
                                    name={item.name}
                                    value={formData.section1[item.name] || ""}
                                    onChange={(e) => handleChange(e, "section1")}
                                    min="0"
                                    className={`medical-add-input ${errors[item.name] ? "medical-add-error-field" : ""
                                        }`}
                                    required={item.required || false}
                                />
                                {errors[item.name] && (
                                    <span className="medical-add-error-message">{errors[item.name]}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    )
}

export default StepForm1
