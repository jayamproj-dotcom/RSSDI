"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FormLayout from "../../../layouts/FormLayout";
import "./StepForm.css";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { formatToDDMMYYYY } from "../../../utils/dateUtils";
import { apiGet, apiPost, apiPut } from "../../../services/api-helper";

const SixMonthFollowUpForm = () => {
    const { patientId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isUpdate, initialData } = location.state || {};

    const [formData, setFormData] = useState({
        section4: {
            woundHealed: "",             // "yes" or "no"
            healingTime: "",             // number (only if woundHealed === "yes")
            nonHealingReason: "",        // string (only if woundHealed === "no")
            surgicalIntervention: "",    // string (only if woundHealed === "no")
            amputationPerformed: "",     // "No", "Minor", "Major" (only if woundHealed === "no")
            hospitalVisits: "",          // number (shown always if woundHealed is selected)
            hospitalized: "",            // "yes" or "no"
            hospitalStayLength: "",      // number (only if hospitalized === "yes")
            amputationType: "",          // "minor" or "major" (only if amputation === "yes")
            amputationLevel: "",         // "below_knee" or "above_knee" (only if amputation === "yes")
            survivalStatus: "",
            deathDate: "",
            deathReason: "",
            activeUlcer: '',             // 'yes' or 'no'
        },
    });

    const [errors, setErrors] = useState({
        woundHealed: false,
        healingTime: false,
        nonHealingReason: false,
        surgicalIntervention: false,
        amputationPerformed: false,
        hospitalVisits: false,
        hospitalized: false,
        hospitalStayLength: false,
        amputationType: false,
        amputationLevel: false,
        survivalStatus: false,
        deathDate: false,
        deathReason: false,
        activeUlcer: false,
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!initialData?.patientId) {
            console.error("Missing initialData for FollowUpForm:", initialData);
            toast.error("Invalid patient data. Please try again.");
            navigate("/user/rssdi-save-the-feet-2.0");
            return;
        }

        const loadFollowUpData = async () => {
            if (isUpdate && patientId) {
                try {
                    console.log("Fetching follow-up data for patientId:", patientId);
                    const response = await apiGet(`follow-up/${patientId}`);
                    console.log("Follow-up API Response:", response);
                    if (response.success && response.data) {
                        const data = response.data;
                        setFormData({
                            section4: {
                                amputationPerformed: data.amputation_performed || "",
                                amputationType: data.amputation_type_specified?.toLowerCase() || "",
                                amputationLevel: data.amputation_level?.toLowerCase().replace(" ", "_") || "",
                                woundHealed: data.has_wound_healed?.toLowerCase() || "",
                                healingTime: data.time_of_healing_days || "",
                                survivalStatus: data.survival_status?.toLowerCase() || "alive",
                                deathDate: data.date_of_death || "",
                                deathReason: data.reason_for_death || "",
                                hospitalVisits: data.hospital_visits || "",
                                hospitalized: data.hospitalized?.toLowerCase() || "",
                                hospitalStayLength: data.hospital_stay_length || "",
                                activeUlcer: data.active_ulcer?.toLowerCase() || "",
                            },
                        });
                    } else if (initialData?.followUpData) {
                        setFormData({
                            section4: {
                                amputationPerformed: initialData.followUpData.amputationPerformed || "",
                                amputationType: initialData.followUpData.amputationType || "",
                                amputationLevel: initialData.followUpData.amputationLevel || "",
                                woundHealed: initialData.followUpData.woundHealed || "",
                                healingTime: initialData.followUpData.healingTime || "",
                                survivalStatus: initialData.followUpData.survivalStatus || "alive",
                                deathDate: initialData.followUpData.deathDate || "",
                                deathReason: initialData.followUpData.deathReason || "",
                                hospitalVisits: initialData.followUpData.hospitalVisits || "",
                                hospitalized: initialData.followUpData.hospitalized || "",
                                hospitalStayLength: initialData.followUpData.hospitalStayLength || "",
                                activeUlcer: initialData.followUpData.activeUlcer || "",
                            },
                        });
                    }
                } catch (error) {
                    console.error("Error fetching follow-up data:", error);
                    toast.error("Failed to load follow-up data");
                }
            }
        };
        loadFollowUpData();
    }, [isUpdate, patientId, initialData, navigate]);

    const handleChange = (e, section) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value,
            },
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: false,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            woundHealed: !formData.section4.woundHealed,
            healingTime: formData.section4.woundHealed === "yes" && !formData.section4.healingTime,
            nonHealingReason: formData.section4.woundHealed === "no" && !formData.section4.nonHealingReason,
            surgicalIntervention: formData.section4.woundHealed === "no" && !formData.section4.surgicalIntervention,
            amputationPerformed: formData.section4.woundHealed === "no" && !formData.section4.amputationPerformed,
            amputationType: ["Minor", "Major"].includes(formData.section4.amputationPerformed) && !formData.section4.amputationType,
            amputationLevel: ["Minor", "Major"].includes(formData.section4.amputationPerformed) && !formData.section4.amputationLevel,
            survivalStatus: !formData.section4.survivalStatus,
            deathDate: formData.section4.survivalStatus === "death" && !formData.section4.deathDate,
            deathReason: formData.section4.survivalStatus === "death" && !formData.section4.deathReason,
            hospitalized: !formData.section4.hospitalized,
            hospitalStayLength: formData.section4.hospitalized === "yes" && !formData.section4.hospitalStayLength,
            hospitalVisits: !formData.section4.hospitalVisits,
            activeUlcer: !formData.section4.activeUlcer,
        };

        const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
            if (key === "healingTime" && formData.section4.woundHealed !== "yes") return acc;
            if (["nonHealingReason", "surgicalIntervention", "amputationPerformed"].includes(key) && formData.section4.woundHealed !== "no") return acc;
            if (["amputationType", "amputationLevel"].includes(key) && !["Minor", "Major"].includes(formData.section4.amputationPerformed)) return acc;
            if (["deathDate", "deathReason"].includes(key) && formData.section4.survivalStatus !== "death") return acc;
            if (key === "hospitalStayLength" && formData.section4.hospitalized !== "yes") return acc;

            acc[key] = newErrors[key];
            return acc;
        }, {});

        setErrors(filteredErrors);
        return !Object.values(filteredErrors).some((error) => error);
    };

    const scrollToFirstError = () => {
        const firstErrorField = Object.keys(errors).find((key) => errors[key]);
        if (firstErrorField) {
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                errorElement.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            scrollToFirstError();
            toast.error("Please fill in all required fields");
            return;
        }

        if (isSaving) return;

        setIsSaving(true);
        try {
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
            const now = new Date();
            const payload = {
                patient_id: patientId,
                doctor_id: currentUser?.id || initialData?.doctor_id || "",
                // Wound healing related fields
                has_wound_healed: formData.section4.woundHealed === "yes" ? "Yes" : "No",
                time_of_healing_days: formData.section4.healingTime ? Number.parseInt(formData.section4.healingTime) : null,
                reason_for_non_healing: formData.section4.nonHealingReason || null,
                surgical_intervention: formData.section4.surgicalIntervention || null,
                // Amputation related fields
                amputation_performed: formData.section4.amputationPerformed || "No",
                amputation_type_specified: formData.section4.amputationType
                    ? formData.section4.amputationType.charAt(0).toUpperCase() + formData.section4.amputationType.slice(1)
                    : null,
                amputation_level: formData.section4.amputationLevel
                    ? formData.section4.amputationLevel.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : null,
                // Hospitalization related fields
                number_of_hospital_visits: formData.section4.hospitalVisits ? Number.parseInt(formData.section4.hospitalVisits) : null,
                was_hospitalized: formData.section4.hospitalized === "yes" ? "Yes" : "No",
                length_of_hospital_stay_days: formData.section4.hospitalStayLength ? Number.parseInt(formData.section4.hospitalStayLength) : null,
                // Survival status fields
                survival_status: formData.section4.survivalStatus
                    ? formData.section4.survivalStatus.charAt(0).toUpperCase() + formData.section4.survivalStatus.slice(1)
                    : null,
                date_of_death: formData.section4.deathDate || null,
                reason_for_death: formData.section4.deathReason || null,
                // Other fields
                active_ulcer: formData.section4.activeUlcer === "yes" ? "Yes" : "No",
                wound_debridement_performed: formData.section4.woundDebridement === "yes" ? "Yes" : "No",
                presence_of_recurrent_ulcer: formData.section4.recurrentUlcer === "yes" ? "Yes" : "No",
                follow_up_date: now.toISOString(),
                followup_duration: "6month", // Add the 6-month follow-up duration
            };

            console.log("Submitting follow-up payload:", JSON.stringify(payload, null, 2));
            const response = isUpdate ? await apiPut(`follow-up/${patientId}`, payload) : await apiPost("follow-up", payload);
            console.log("Follow-up API Response:", JSON.stringify(response, null, 2));

            if (!response.success) {
                throw new Error(response.message || (response.errors ? JSON.stringify(response.errors) : "Failed to submit follow-up"));
            }

            const patientRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]");
            const nextFollowUpDate = new Date();
            nextFollowUpDate.setMinutes(nextFollowUpDate.getMinutes() + 5);

            const updatedRecords = patientRecords.map((record) => {
                if (record.patientId === patientId) {
                    return {
                        ...record,
                        follow_up_status: response.data.follow_up_status || "Completed",
                        last_follow_up_date: response.data.last_follow_up_date || now.toISOString(),
                        follow_up_date: nextFollowUpDate.toISOString(),
                        followUpData: {
                            ...formData.section4,
                            follow_up_date: now.toISOString(),
                        },
                        ...(location.state?.isInitialFollowUp && {
                            initialFollowUpCompleted: now.toISOString(),
                        }),
                    };
                }
                return record;
            });
            localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));

            toast.success(location.state?.isInitialFollowUp ? "Initial follow-up completed!" : "Follow-up updated successfully!");
            navigate("/user/rssdi-save-the-feet-2.0", {
                state: {
                    showToast: true,
                    toastMessage: "Follow-up data saved successfully",
                    refresh: true,
                },
                replace: true,
            });
        } catch (error) {
            console.error("Error saving follow-up:", error);
            toast.error(`Failed to save follow-up: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <FormLayout>
            <div className="medical-add-container">
                <div className="form-header">
                    <h2 className="medical-add-section-title">{isUpdate ? "Update" : "Add"}  Follow-up Assessment</h2>
                    <div>
                        {initialData?.lastFollowUpDate && (
                            <small className="last-followup">Last follow-up: {formatToDDMMYYYY(initialData.lastFollowUpDate)}</small>
                        )}
                        <button type="button" onClick={() => navigate(-1)} className="dashboard-btn">
                            <ArrowLeftToLine size={18} />
                            <span>Back</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="medical-add-form">
                    <div className="medical-add-section step-form-4">
                        <h2 className="medical-add-section-title">Final Treatment Outcomes (after 6 months)</h2>

                        <div className="medical-add-row3">



                            <div className="col-md-4 medical-add-group">
                                <label className="medical-add-label required">Has the wound healed?</label>
                                <div className="medical-add-radio-group">
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="woundHealed"
                                            value="yes"
                                            checked={formData.section4.woundHealed === 'yes'}
                                            onChange={(e) => handleChange(e, 'section4')}
                                            className="medical-add-radio-button"
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">Yes</span>
                                    </label>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="woundHealed"
                                            value="no"
                                            checked={formData.section4.woundHealed === 'no'}
                                            onChange={(e) => handleChange(e, 'section4')}
                                            className="medical-add-radio-button"
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">No</span>
                                    </label>
                                </div>
                                {errors.woundHealed && <span className="error-message">This field is required</span>}
                            </div>

                            {/* Show fields for both YES and NO selections */}
                            {['yes', 'no'].includes(formData.section4.woundHealed) && (
                                <>
                                    {/* Healing Time (ONLY if wound healed = yes) */}
                                    {formData.section4.woundHealed === 'yes' && (
                                        <div className="col-md-4 medical-add-group">
                                            <label className="medical-add-label required">Healing Time (in days)</label>
                                            <input
                                                type="number"
                                                name="healingTime"
                                                className="form-control"
                                                value={formData.section4.healingTime || ''}
                                                onChange={(e) => handleChange(e, 'section4')}
                                                required
                                            />
                                        </div>
                                    )}




                                    {/* Show extra 3 fields ONLY IF "no" selected */}
                                    {formData.section4.woundHealed === 'no' && (
                                        <>
                                            {/* Reason */}
                                            <div className="col-md-4 medical-add-group">
                                                <label className="medical-add-label required">Reason</label>
                                                <div className="medical-add-radio-group">
                                                    {['Loss of follow up', 'Non compliance', 'Healed and reoccurrence'].map((reason) => (
                                                        <label key={reason} className="medical-add-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="nonHealingReason"
                                                                value={reason}
                                                                checked={formData.section4.nonHealingReason === reason}
                                                                onChange={(e) => handleChange(e, 'section4')}
                                                                className="medical-add-radio-button"
                                                                required
                                                            />
                                                            <span className="medical-add-radio-button-label">{reason}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Surgical Intervention */}
                                            <div className="col-md-4 medical-add-group">
                                                <label className="medical-add-label required">Surgical intervention performed</label>
                                                <div className="medical-add-radio-group">
                                                    {['Callus excision', 'Sequestectomy', 'Incision and drainage', 'Wound debridement', 'Others'].map((option) => (
                                                        <label key={option} className="medical-add-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="surgicalIntervention"
                                                                value={option}
                                                                checked={formData.section4.surgicalIntervention === option}
                                                                onChange={(e) => handleChange(e, 'section4')}
                                                                className="medical-add-radio-button"
                                                                required
                                                            />
                                                            <span className="medical-add-radio-button-label">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Amputation */}
                                            <div className="col-md-4 medical-add-group">
                                                <label className="medical-add-label required">Amputation performed?</label>
                                                <div className="medical-add-radio-group">
                                                    {['No', 'Minor', 'Major'].map((type) => (
                                                        <label key={type} className="medical-add-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="amputationPerformed"
                                                                value={type}
                                                                checked={formData.section4.amputationPerformed === type}
                                                                onChange={(e) => handleChange(e, 'section4')}
                                                                className="medical-add-radio-button"
                                                                required
                                                            />
                                                            <span className="medical-add-radio-button-label">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}


                                    {/* No. of hospital visits */}
                                    <div className="col-md-4 medical-add-group">
                                        <label className="medical-add-label required">No. of hospital visits</label>
                                        <input
                                            type="number"
                                            name="hospitalVisits"
                                            className="form-control"
                                            value={formData.section4.hospitalVisits || ''}
                                            onChange={(e) => handleChange(e, 'section4')}
                                            required
                                        />
                                    </div>

                                    {/* Hospitalization */}
                                    <div className="col-md-4 medical-add-group">
                                        <label className="medical-add-label required">Hospitalization?</label>
                                        <div className="medical-add-radio-group">
                                            {['yes', 'no'].map((value) => (
                                                <label key={value} className="medical-add-radio-label">
                                                    <input
                                                        type="radio"
                                                        name="hospitalized"
                                                        value={value}
                                                        checked={formData.section4.hospitalized === value}
                                                        onChange={(e) => handleChange(e, 'section4')}
                                                        className="medical-add-radio-button"
                                                        required
                                                    />
                                                    <span className="medical-add-radio-button-label">
                                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.hospitalized && <span className="error-message">This field is required</span>}
                                    </div>

                                    {/* Length of stay — only if hospitalized = yes */}
                                    {formData.section4.hospitalized === 'yes' && (
                                        <div className="col-md-4 medical-add-group">
                                            <label className="medical-add-label required">Length of hospital stay (in days)</label>
                                            <input
                                                type="number"
                                                name="hospitalStayLength"
                                                className="form-control"
                                                value={formData.section4.hospitalStayLength || ''}
                                                onChange={(e) => handleChange(e, 'section4')}
                                                required={formData.section4.hospitalized === 'yes'}
                                            />

                                        </div>
                                    )}
                                </>
                            )}


                        </div>

                        {['Minor', 'Major'].includes(formData.section4.amputationPerformed) && (
                            <div className="medical-add-row3 ">
                                <div className="col-md-6 medical-add-group">
                                    <label className="medical-add-label required">Amputation type</label>
                                    <div className={`medical-add-radio-group ${errors.amputationType ? "error" : ""}`}>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationType"
                                                value="minor"
                                                checked={formData.section4.amputationType === "minor"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Minor</span>
                                        </label>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationType"
                                                value="major"
                                                checked={formData.section4.amputationType === "major"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Major</span>
                                        </label>
                                    </div>
                                    {errors.amputationType && <span className="error-message">This field is required</span>}
                                </div>

                                <div className="col-md-6 medical-add-group">
                                    <label className="medical-add-label required">Amputation level</label>
                                    <div className={`medical-add-radio-group ${errors.amputationLevel ? "error" : ""}`}>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationLevel"
                                                value="below_knee"
                                                checked={formData.section4.amputationLevel === "below_knee"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Below knee</span>
                                        </label>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationLevel"
                                                value="above_knee"
                                                checked={formData.section4.amputationLevel === "above_knee"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Above knee</span>
                                        </label>
                                    </div>
                                    {errors.amputationLevel && <span className="error-message">This field is required</span>}
                                </div>
                            </div>
                        )}

                        <div className="col-md-6 medical-add-group">
                            <label className="required" style={{ minWidth: "350px" }}>
                                Survival status
                            </label>
                            <div className={`medical-add-radio-group ${errors.survivalStatus ? "error" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="survivalStatus"
                                        value="alive"
                                        checked={formData.section4.survivalStatus === "alive"}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Alive</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="survivalStatus"
                                        value="death"
                                        checked={formData.section4.survivalStatus === "death"}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Death</span>
                                </label>
                            </div>
                            {errors.survivalStatus && <span className="error-message">This field is required</span>}



                            {formData.section4.survivalStatus === "death" && (
                                <div className="medical-add-row">
                                    <div className="col-md-6 medical-add-group">
                                        <label className="required" style={{ minWidth: "350px" }}>
                                            Date of death
                                        </label>
                                        <input
                                            type="date"
                                            name="deathDate"
                                            value={formData.section4.deathDate}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className={`medical-add-input ${errors.deathDate ? "error" : ""}`}
                                            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                        />
                                        {errors.deathDate && <span className="error-message">This field is required</span>}
                                    </div>
                                    <div className="col-md-6 medical-add-group">
                                        <label className="required" style={{ minWidth: "350px" }}>
                                            Reason for death
                                        </label>
                                        <textarea
                                            name="deathReason"
                                            value={formData.section4.deathReason}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className={`medical-add-input ${errors.deathReason ? "error" : ""}`}
                                            placeholder="Enter reason for death"
                                        />
                                        {errors.deathReason && <span className="error-message">This field is required</span>}
                                    </div>
                                </div>
                            )}
                        </div>



                        <div className="col-md-4 medical-add-group mt">
                            <label className="medical-add-label required">Is there any new/active ulcer?</label>
                            <div className="medical-add-radio-group">
                                {['yes', 'no'].map((value) => (
                                    <label key={value} className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="activeUlcer"
                                            value={value}
                                            checked={formData.section4.activeUlcer === value}
                                            onChange={(e) => handleChange(e, 'section4')}
                                            className="medical-add-radio-button"
                                            required
                                        />
                                        <span className="medical-add-radio-button-label"> {value.charAt(0).toUpperCase() + value.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.activeUlcer && <span className="error-message">This field is required</span>}
                        </div>
                    </div>


                    <div className="step-form-actions followupformaction">
                        <div className="action-buttons followup-submit">
                            <button type="submit" className="submit-btn" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <LoadingOutlined style={{ marginRight: 8 }} />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightToLine size={18} />
                                        <span>Submit Follow-up</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </FormLayout>
    );
}

export default SixMonthFollowUpForm
