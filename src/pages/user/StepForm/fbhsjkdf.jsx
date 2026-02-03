import React, { useState, useEffect } from 'react';
import FormLayout from '../../../layouts/FormLayout';
import './StepForm.css';
import { useNavigate } from 'react-router-dom';
import StepForm1 from './StepForm1';
import StepForm2 from './StepForm2';
import StepForm3 from './StepForm3';
import StepForm4 from './StepForm4';
import {
    FaSave, FaPaperPlane, FaCheckCircle, FaTimes,
    FaArrowLeft, FaDownload, FaUpload
} from 'react-icons/fa';
import consentFormPdf from '../../../assets/consent-form.pdf';

const StepForm = () => {
    const [step, setStep] = useState(1);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [formData, setFormData] = useState({
        section1: {
            name: '',
            address: '',
            locality: '',
            age: '',
            gender: '',
            facilityName: '',
            facilityLocation: '',
            facilityType: '',
            education: '',
            occupation: '',
            maritalStatus: '',
            monthlyIncome: '',
            familyMembers: '',
            dependents: '',
            diabetesType: '',
            diabetesDuration: '',
            hasUlcer: false,
            ulcerDuration: '',
            hasAmputation: false,
            amputationDuration: '',
            hasAngioplasty: false,
            angioplastyDuration: '',
        },
        section2: {
            Assessment: '',
            attendedBefore: '',
            facilityVisited: '',
            intervalToAssessment: '',
            referredBy: '',
            treatedDays: '',
            referredInDays: '',
            visitedInDays: '',
            necrosis: '',
            necrosisPhoto: null,
            necrosisPhotoPreview: '',
            gangrene: '',
            gangreneType: '',
            probetobone: '',
            osteomyelitis: '',
            sepsis: '',
            arterialStenosis: '',
            infection: '',
            swelling: '',
            erythema: '',
            tenderness: '',
            warmth: '',

            cultureReport: '',
            woundSize: '',
            woundLocation: '',
            woundDuration: '',
            woundClassification: '',
            other_treatment: '',
            other_treatment_details: '',
            dressingMaterial: '',
            offloadingDevice: '',
            healingTime: '',
            hospitalization: '',
            debridement: '',
            amputation: '',
            amputationType: '',
            amputationLevel: '',
            debridementWithAmputation: '',
            survivalStatus: '',


        },
        section3: {
            burningSensation: '',
            painWhileWalking: '',
            skinChanges: '',
            sensationLoss: '',
            nailProblems: '',
            fungalInfection: '',
            skinLesions: '',
            openCrack: '',
            cellulitis: '',
            monofilamentA: '',
            monofilamentB: '',
            monofilamentC: '',
            footDeformities: '',
            deformityDuration: '',
            hairLoss: '',
            pulsesPalpable: '',
            skinTemperature: '',
        },
        section4: {
            woundDebridement: '',
            amputation: '',
            amputationType: '',
            amputationLevel: '',
            woundHealed: '',
            healingTime: '',
            recurrentUlcer: '',
            survivalStatus: 'alive',

        },
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Define required fields for each step
    const requiredFields = {
        1: [
            'name', 'address', 'locality', 'age', 'gender', 'facilityName',
            'facilityLocation', 'facilityType', 'education', 'occupation',
            'maritalStatus', 'monthlyIncome', 'familyMembers', 'dependents',
            'diabetesType', 'diabetesDuration'
        ],
        2: [
            'Assessment', 'attendedBefore',
            // Conditional fields only required when 'attendedBefore' is 'Yes'
            ...(formData.section2.attendedBefore === 'Yes' ? [
                'facilityVisited', 'intervalToAssessment', 'referredBy',
                'treatedDays', 'referredInDays', 'visitedInDays'
            ] : []),
            'necrosis',
            // Only required if necrosis is 'Yes'
            ...(formData.section2.necrosis === 'Yes' ? ['necrosisPhoto'] : []),
            'gangrene',
            // Only required if gangrene is 'Yes'
            ...(formData.section2.gangrene === 'Yes' ? ['gangreneType'] : []),
            'probetobone', 'osteomyelitis', 'sepsis', 'arterialStenosis',
            'infection', 'swelling', 'erythema', 'tenderness', 'warmth',
            'woundSize', 'woundLocation', 'woundDuration', 'woundClassification',
            'other_treatment',
            // Only required if other_treatment is 'Yes'
            ...(formData.section2.other_treatment === 'Yes' ? ['other_treatment_details'] : []),
            'dressingMaterial', 'offloadingDevice', 'healingTime',
            'hospitalization', 'debridement', 'amputation',
            // Conditional based on amputation type
            ...(formData.section2.amputation === 'Major' ? ['amputationLevel'] : []),
            'debridementWithAmputation', 'survivalStatus',
            // Only required if deceased

        ],
        3: [
            'burningSensation', 'painWhileWalking', 'skinChanges', 'sensationLoss',
            'nailProblems', 'fungalInfection', 'skinLesions', 'openCrack',
            'cellulitis',
            'monofilamentLeftA', 'monofilamentLeftB', 'monofilamentLeftC',
            'monofilamentRightA', 'monofilamentRightB', 'monofilamentRightC',
            'footDeformities',
            ...(formData.section3.footDeformities === 'yes' ? ['deformityDuration'] : []),
            'hairLoss', 'pulsesPalpable',
            'skinTemperature'
        ],
        4: [
            'woundDebridement',
            'amputation',
            // Only required if amputation is 'yes'
            ...(formData.section4.amputation === 'yes' ? [
                'amputationType',
                'amputationLevel'
            ] : []),
            'woundHealed',
            // Only required if woundHealed is 'yes'
            ...(formData.section4.woundHealed === 'yes' ? ['healingTime'] : []),
            'recurrentUlcer',
            'survivalStatus',
            // Only required if survivalStatus is 'death'
            // ...(formData.section4.survivalStatus === 'death' ? [
            //     'deathDate',
            //     'deathReason'
            // ] : [])
        ],
    };

    // Load saved data if exists
    useEffect(() => {
        const saved = localStorage.getItem('stepFormData');
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e, section) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: type === 'checkbox' ? checked : value,
            },
        }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateCurrentStep = () => {
        const currentStepFields = requiredFields[step];
        const newErrors = {};
        let isValid = true;

        currentStepFields.forEach(field => {
            let fieldValue = '';
            for (const section in formData) {
                if (formData[section][field] !== undefined) {
                    fieldValue = formData[section][field];
                    break;
                }
            }
            if (!fieldValue) {
                newErrors[field] = 'This field is required';
                isValid = false;
            }
        });

        //  Extra dynamic validation for Step 1
        if (step === 1) {
            const complications = [
                { field: 'hasRenal', duration: 'renalDuration' },
                { field: 'hasRetinal', duration: 'retinalDuration' },
                { field: 'hasCardiovascular', duration: 'cardiovascularDuration' },
                { field: 'hasHeartFailure', duration: 'heartFailureDuration' }, // if you have
                { field: 'hasCerebrovascular', duration: 'cerebrovascularDuration' },
                { field: 'hasLimbIschemia', duration: 'limbIschemiaDuration' },
                { field: 'hasHypertension', duration: 'hypertensionDuration' }
            ];

            complications.forEach(({ field, duration }) => {
                if (formData.section1[field] === true) {
                    if (!formData.section1[duration]) {
                        newErrors[duration] = 'This field is required';
                        isValid = false;
                    }
                }
            });
        }
        setErrors(newErrors);
        return isValid;
    };


    const nextStep = () => {
        if (validateCurrentStep()) {
            setStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all steps before submission
        let allValid = true;
        for (let i = 1; i <= 4; i++) {
            const stepFields = requiredFields[i];
            for (const field of stepFields) {
                let fieldValue = '';
                for (const section in formData) {
                    if (formData[section][field] !== undefined) {
                        fieldValue = formData[section][field];
                        break;
                    }
                }

                if (!fieldValue) {
                    allValid = false;
                    setErrors(prev => ({ ...prev, [field]: 'This field is required' }));
                }
            }
        }

        if (allValid) {
            console.log('Form submitted:', formData);
            localStorage.removeItem('stepFormData');
            setShowUploadPopup(true); // Show upload popup instead of alert
        } else {
            // Scroll to first error
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            alert('Please fill all required fields before submitting.');
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownloadForm = () => {
        const link = document.createElement('a');
        link.href = consentFormPdf;
        link.download = 'Diabetes_Foot_Ulcer_Consent_Form.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const handleUploadComplete = () => {
        setShowUploadPopup(false);
        navigate('/user/dashboard'); // Redirect after upload
        alert('Submission complete!');
    };

    const handleSave = () => {
        if (validateCurrentStep()) {
            localStorage.setItem('stepFormData', JSON.stringify(formData));
            console.log(localStorage.setItem('stepFormData', JSON.stringify(formData)))
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                nextStep();
            }, 1000);
        } else {
            // Scroll to first error
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveForLater = () => {
        setIsSaving(true);

        // Save the current state including uploaded files
        const pendingData = {
            formData,
            uploadedFiles,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('pendingFormSubmission', JSON.stringify(pendingData));

        // Show confirmation
        setShowSuccess(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(false);
            setShowUploadPopup(false);
            navigate('/user/dashboard');
        }, 1500);
    };

    useEffect(() => {
        const pendingData = localStorage.getItem('pendingFormSubmission');
        if (pendingData) {
            const { formData: savedData, uploadedFiles: savedFiles } = JSON.parse(pendingData);
            setFormData(savedData);
            setUploadedFiles(savedFiles || []);
        }
    }, []);



    const navigate = useNavigate();

    const handleAddNew = () => {
        navigate('/user/dashboard');
    };

    const handleStepClick = (stepNumber) => {
        if (stepNumber > step) {
            if (!validateCurrentStep()) {
                alert('Please complete the current step before moving forward.');
                return;
            }
        }
        setStep(stepNumber);
    };

    const renderStep = () => {
        const stepProps = {
            formData,
            handleChange,
            errors
        };

        switch (step) {
            case 1:
                return <StepForm1 {...stepProps} />;
            case 2:
                return <StepForm2 {...stepProps} />;
            case 3:
                return <StepForm3 {...stepProps} />;
            case 4:
                return <StepForm4 {...stepProps} />;
            default:
                return null;
        }
    };

    return (
        <FormLayout>
            <form onSubmit={handleSubmit}>
                {/* Back Button - Positioned at Top Right */}
                <button
                    type="button"
                    onClick={handleAddNew}
                    className="btn-back top-right"
                    aria-label="Go back to previous step"
                >
                    <FaArrowLeft />
                    <span>Go to Dashboard</span>
                </button>

                <div className="step-indicator-container">
                    <div className="step-indicator">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <React.Fragment key={stepNumber}>
                                {stepNumber > 1 && (
                                    <div
                                        className={`step-connector ${step >= stepNumber ? 'active' : ''}`}
                                    />
                                )}
                                <div
                                    className={`step-number ${step === stepNumber ? 'active' : ''} ${step > stepNumber ? 'completed' : ''}`}
                                    onClick={() => handleStepClick(stepNumber)}
                                >
                                    {step > stepNumber ? (
                                        <svg className="checkmark" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {renderStep()}

                <div className="form-actions">
                    {showSuccess && (
                        <div className="popup-overlay">
                            <div className="popup-card">
                                <button className="popup-close" onClick={() => setShowSuccess(false)}>
                                    <FaTimes />
                                </button>
                                <div className="popup-icon">
                                    <FaCheckCircle />
                                </div>
                                <h3 className="popup-title">Saved Successfully!</h3>
                            </div>
                        </div>
                    )}

                    <div className="action-buttons">
                        {step === 4 && (
                            <button type="submit" className="btn-submit" aria-label="Submit form">
                                <FaPaperPlane className="btn-icon" />
                                <span>Submit Form</span>
                            </button>
                        )}

                        {step < 4 && (
                            <button
                                type="button"
                                onClick={handleSave}
                                className="btn-save"
                                aria-label="Save and continue"
                            >
                                <FaSave className="btn-icon" />
                                <span>Save & Continue</span>
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {showUploadPopup && (
                <div className="popup-overlay">
                    <div className="upload-popup">
                        <button
                            className="popup-close"
                            onClick={() => setShowUploadPopup(false)}
                        >
                            <FaTimes />
                        </button>

                        <h3>Upload Required Documents</h3>
                        <p>Please upload the signed consent form and any supporting documents.</p>

                        <div className="upload-area">
                            <label className="upload-btn">
                                <FaUpload className="btn-icon" />
                                <span>Upload Form</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <button
                                className="download-btn"
                                onClick={handleDownloadForm}
                            >
                                <FaDownload className="btn-icon" />
                                <span>Download Consent Form</span>
                            </button>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files">
                                <h4>Uploaded Files:</h4>
                                <ul>
                                    {uploadedFiles.map((file, index) => (
                                        <li key={index}>
                                            {file.name}
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="remove-file"
                                            >
                                                <FaTimes />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="save-success-message">
                            <FaCheckCircle />
                            <span>Progress saved successfully!</span>
                        </div>

                        <div className="popup-actions">
                            <button
                                onClick={handleSaveForLater}
                                className="btn-later"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Later'}
                            </button>

                            <button
                                onClick={handleUploadComplete}
                                disabled={uploadedFiles.length === 0}
                                className="btn-submit"
                            >
                                Complete Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </FormLayout>
    );
};

export default StepForm;