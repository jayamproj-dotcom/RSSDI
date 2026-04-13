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

const FollowUpForm = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isUpdate, initialData } = location.state || {};
  console.log(initialData.follow_up_1);

 const [followup1, setFollowUp1] = useState(initialData.follow_up_1 || "");
 const [surgicalInterventionInput, setSurgicalInterventionInput] = useState("");
  const [surgicalInterventionInputOption, setSurgicalInterventionInputOption] = useState(false);

  const [formData, setFormData] = useState({
    section4: {
      survivalStatus: "",
      woundHealed: "",
      healingTime: "",
      nonHealingReason: "",
      surgicalIntervention: "",
      amputationPerformed: "",
      hospitalVisits: "",
      hospitalized: "",
      hospitalStayLength: "",
      deathDate: "",
      deathReason: "",
      activeUlcer: '',
    },
  });

  const [errors, setErrors] = useState({
    survivalStatus: false,
    woundHealed: false,
    healingTime: false,
    nonHealingReason: false,
    surgicalIntervention: false,
    amputationPerformed: false,
    hospitalVisits: false,
    hospitalized: false,
    hospitalStayLength: false,
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
                survivalStatus: data.survival_status?.toLowerCase() || "alive",
                woundHealed: data.has_wound_healed?.toLowerCase() || "",
                healingTime: data.time_of_healing_days || "",
                nonHealingReason: data.reason_for_non_healing || "",
                surgicalIntervention: data.surgical_intervention || "",
                amputationPerformed: data.amputation_performed || "",
                hospitalVisits: data.hospital_visits || "",
                hospitalized: data.hospitalized?.toLowerCase() || "",
                hospitalStayLength: data.hospital_stay_length || "",
                deathDate: data.date_of_death || "",
                deathReason: data.reason_for_death || "",
                activeUlcer: data.active_ulcer?.toLowerCase() || "",
              },
            });
          } else if (initialData?.followUpData) {
            setFormData({
              section4: {
                survivalStatus: initialData.followUpData.survivalStatus || "alive",
                woundHealed: initialData.followUpData.woundHealed || "",
                healingTime: initialData.followUpData.healingTime || "",
                nonHealingReason: initialData.followUpData.nonHealingReason || "",
                surgicalIntervention: initialData.followUpData.surgicalIntervention || "",
                amputationPerformed: initialData.followUpData.amputationPerformed || "",
                hospitalVisits: initialData.followUpData.hospitalVisits || "",
                hospitalized: initialData.followUpData.hospitalized || "",
                hospitalStayLength: initialData.followUpData.hospitalStayLength || "",
                deathDate: initialData.followUpData.deathDate || "",
                deathReason: initialData.followUpData.deathReason || "",
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

    if (value === "Others") {
      setSurgicalInterventionInputOption(true);
    } else if (
      value === "Callus excision" ||
      value === "Sequestectomy" ||
      value === "Incision and drainage" ||
      value === "Wound debridement"
    ) {
      setSurgicalInterventionInputOption(false);
    }

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



  const handleOthersChange = (e, section) => {
    const { value } = e.target;
    setSurgicalInterventionInput(value.trim());
  
    if (surgicalInterventionInput.length === 0) {
      setErrors((prev) => ({
        ...prev,
        surgicalIntervention: true, // ❌ empty input → error
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        surgicalIntervention: false, // ✅ valid input → no error
      }));
    }


    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        surgicalIntervention: value, // Store input text separately
      },
    }));

    if (errors.surgicalIntervention) {
      setErrors((prev) => ({
        ...prev,
        surgicalIntervention: false,
      }));
    }
  };

  const validateForm = () => {
    console.log(surgicalInterventionInput.trim().length);
    
    const newErrors = {
      survivalStatus: !formData.section4.survivalStatus,
      woundHealed: formData.section4.survivalStatus === "alive" && !formData.section4.woundHealed,
      healingTime: formData.section4.survivalStatus === "alive" && formData.section4.woundHealed === "yes" && !formData.section4.healingTime,
      nonHealingReason: formData.section4.survivalStatus === "alive" && formData.section4.woundHealed === "no" && !formData.section4.nonHealingReason,
      surgicalIntervention:
        formData.section4.survivalStatus === "alive" &&
        formData.section4.woundHealed === "no" &&
        (!formData.section4.surgicalIntervention ||
          (formData.section4.surgicalIntervention === "Others" &&
            surgicalInterventionInput.trim().length === 0)),
      amputationPerformed: formData.section4.survivalStatus === "alive" && formData.section4.woundHealed === "no" && !formData.section4.amputationPerformed,
      hospitalVisits: formData.section4.survivalStatus === "alive" && !formData.section4.hospitalVisits,
      hospitalized: formData.section4.survivalStatus === "alive" && !formData.section4.hospitalized,
      hospitalStayLength: formData.section4.survivalStatus === "alive" && formData.section4.hospitalized === "yes" && !formData.section4.hospitalStayLength,
      deathDate: formData.section4.survivalStatus === "death" && !formData.section4.deathDate,
      deathReason: formData.section4.survivalStatus === "death" && !formData.section4.deathReason,
      activeUlcer: formData.section4.survivalStatus === "alive" && !formData.section4.activeUlcer,
    };

    const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
      if (key === "healingTime" && formData.section4.woundHealed !== "yes") return acc;
      if (["nonHealingReason", "surgicalIntervention", "amputationPerformed"].includes(key) && formData.section4.woundHealed !== "no") return acc;
      if (["deathDate", "deathReason"].includes(key) && formData.section4.survivalStatus !== "death") return acc;
      if (key === "hospitalStayLength" && formData.section4.hospitalized !== "yes") return acc;

      // Only add to errors if the value is true (meaning there IS an error)
      if (newErrors[key] === true) {
        acc[key] = true;
      }
      return acc;
    }, {});

    console.log("Filtered errors:", filteredErrors);
    setErrors(filteredErrors);

    // Return true if no errors (form is valid)
    return Object.keys(filteredErrors).length === 0;
  };

  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(errors).find((key) => errors[key]);
    if (firstErrorField) {
      console.log("Scrolling to first error field:", firstErrorField);

      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        // For radio buttons, scroll to the container
        if (errorElement.type === 'radio') {
          const radioContainer = errorElement.closest('.medical-add-radio-group');
          if (radioContainer) {
            radioContainer.scrollIntoView({ behavior: "smooth", block: "center" });
            errorElement.focus();
          }
        } else {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔄 Form submission started");

    // Call validateForm once and store the result
    const isValid = validateForm();

    console.log("✅ Validation result:", isValid);
    console.log("❌ Current errors:", errors);

    if (!isValid) {
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
        survival_status: formData.section4.survivalStatus
          ? formData.section4.survivalStatus.charAt(0).toUpperCase() + formData.section4.survivalStatus.slice(1)
          : null,
        has_wound_healed: formData.section4.survivalStatus === "alive" && formData.section4.woundHealed ? (formData.section4.woundHealed === "yes" ? "Yes" : "No") : null,
        time_of_healing_days: formData.section4.healingTime ? Number.parseInt(formData.section4.healingTime) : null,
        reason_for_non_healing: formData.section4.nonHealingReason || null,
        surgical_intervention: formData.section4.surgicalIntervention || null,
        amputation_performed: formData.section4.amputationPerformed || null,
        number_of_hospital_visits: formData.section4.hospitalVisits ? Number.parseInt(formData.section4.hospitalVisits) : null,
        was_hospitalized: formData.section4.survivalStatus === "alive" && formData.section4.hospitalized ? (formData.section4.hospitalized === "yes" ? "Yes" : "No") : null,
        length_of_hospital_stay_days: formData.section4.hospitalStayLength ? Number.parseInt(formData.section4.hospitalStayLength) : null,
        date_of_death: formData.section4.deathDate || null,
        reason_for_death: formData.section4.deathReason || null,
        active_ulcer: formData.section4.survivalStatus === "alive" && formData.section4.activeUlcer ? (formData.section4.activeUlcer === "yes" ? "Yes" : "No") : null,
        follow_up_date: now.toISOString(),
      };

      console.log("Submitting follow-up payload:", JSON.stringify(payload, null, 2));

      let response;
      if (initialData.follow_up_1 === "pending") {
        response = isUpdate ? await apiPut(`follow-up/${patientId}`, payload) : await apiPost("follow-up", payload);
      } else if (initialData.follow_up_1 === "completed") {
        response = isUpdate ? await apiPut(`follow-up-update/${patientId}`, payload) : await apiPost(`follow-up-update/${patientId}`, payload);
      }

      console.log("Follow-up API Response:", JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.message || (response.errors ? JSON.stringify(response.errors) : "Failed to submit follow-up"));
      }

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
          <h2 className="medical-add-section-title">
            {isUpdate ? "Update" : "Add"} Follow-up Assessment
          </h2>
          <div>
            {initialData?.lastFollowUpDate && (
              <small className="last-followup">
                Last follow-up: {formatToDDMMYYYY(initialData.lastFollowUpDate)}
              </small>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="dashboard-btn"
            >
              <ArrowLeftToLine size={18} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="medical-add-form">
          <div className="medical-add-section step-form-4">
            <h2 className="medical-add-section-title">
              {followup1 === "pending"
                ? "First Treatment Outcomes (after 3 months)"
                : "Final Treatment Outcomes (after 6 months)"}
            </h2>

            <div className="col-md-6 medical-add-group">
              <label className="required" style={{ minWidth: "350px" }}>
                Survival status
              </label>
              <div
                className={`medical-add-radio-group ${errors.survivalStatus ? "error" : ""}`}
              >
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
              {errors.survivalStatus && (
                <span className="error-message">This field is required</span>
              )}

              {formData.section4.survivalStatus === "alive" && (
                <div className="medical-add-row3">
                  <div className="col-md-4 medical-add-group">
                    <label className="medical-add-label required">
                      Has the wound healed?
                    </label>
                    <div
                      className={`medical-add-radio-group ${errors.woundHealed ? "error" : ""}`}
                    >
                      <label className="medical-add-radio-label">
                        <input
                          type="radio"
                          name="woundHealed"
                          value="yes"
                          checked={formData.section4.woundHealed === "yes"}
                          onChange={(e) => handleChange(e, "section4")}
                          className="medical-add-radio-button"
                        />
                        <span className="medical-add-radio-button-label">
                          Yes
                        </span>
                      </label>
                      <label className="medical-add-radio-label">
                        <input
                          type="radio"
                          name="woundHealed"
                          value="no"
                          checked={formData.section4.woundHealed === "no"}
                          onChange={(e) => handleChange(e, "section4")}
                          className="medical-add-radio-button"
                        />
                        <span className="medical-add-radio-button-label">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.woundHealed && (
                      <span className="error-message">
                        This field is required
                      </span>
                    )}
                  </div>

                  {["yes", "no"].includes(formData.section4.woundHealed) && (
                    <>
                      {formData.section4.woundHealed === "yes" && (
                        <div className="col-md-4 medical-add-group">
                          <label className="medical-add-label required">
                            Healing Time (in days)
                          </label>
                          <input
                            type="number"
                            name="healingTime"
                            className={`form-control ${errors.healingTime ? "error" : ""}`}
                            value={formData.section4.healingTime || ""}
                            onChange={(e) => handleChange(e, "section4")}
                          />
                          {errors.healingTime && (
                            <span className="error-message">
                              This field is required
                            </span>
                          )}
                        </div>
                      )}

                      {formData.section4.woundHealed === "no" && (
                        <>
                          <div className="col-md-4 medical-add-group">
                            <label className="medical-add-label required">
                              Reason
                            </label>
                            <div
                              className={`medical-add-radio-group ${errors.nonHealingReason ? "error" : ""}`}
                            >
                              {[
                                "Loss of follow up",
                                "Non compliance",
                                "Healed and reoccurrence",
                              ].map((reason) => (
                                <label
                                  key={reason}
                                  className="medical-add-radio-label"
                                >
                                  <input
                                    type="radio"
                                    name="nonHealingReason"
                                    value={reason}
                                    checked={
                                      formData.section4.nonHealingReason ===
                                      reason
                                    }
                                    onChange={(e) =>
                                      handleChange(e, "section4")
                                    }
                                    className="medical-add-radio-button"
                                  />
                                  <span className="medical-add-radio-button-label">
                                    {reason}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {errors.nonHealingReason && (
                              <span className="error-message">
                                This field is required
                              </span>
                            )}
                          </div>

                          <div className="col-md-4 medical-add-group">
                            <label className="medical-add-label required">
                              Surgical intervention performed
                            </label>
                            <div
                              className={`medical-add-radio-group ${errors.surgicalIntervention ? "error" : ""}`}
                            >
                              {[
                                "Callus excision",
                                "Sequestectomy",
                                "Incision and drainage",
                                "Wound debridement",
                                "Others",
                              ].map((option) => (
                                <label
                                  key={option}
                                  className="medical-add-radio-label"
                                >
                                  <input
                                    type="radio"
                                    name="surgicalIntervention"
                                    value={option}
                                    checked={
                                      formData.section4.surgicalIntervention ===
                                      option
                                    }
                                    onChange={(e) =>
                                      handleChange(e, "section4")
                                    }
                                    className="medical-add-radio-button"
                                  />
                                  <span className="medical-add-radio-button-label">
                                    {option}
                                  </span>
                                </label>
                              ))}

                              {/* Show text input only when "Others" is selected */}
                              {surgicalInterventionInputOption && (
                                <input
                                  type="text"
                                  name="surgicalInterventionOther"
                                  value={surgicalInterventionInput}
                                  onChange={(e) =>
                                    handleOthersChange(e, "section4")
                                  }
                                  placeholder="Please specify"
                                  className="medical-add-text-input"
                                />
                              )}
                            </div>
                            {errors.surgicalIntervention && (
                              <span className="error-message">
                                This field is required
                              </span>
                            )}
                          </div>

                          <div className="col-md-4 medical-add-group">
                            <label className="medical-add-label required">
                              Amputation performed?
                            </label>
                            <div
                              className={`medical-add-radio-group ${errors.amputationPerformed ? "error" : ""}`}
                            >
                              {["No", "Minor", "Major"].map((type) => (
                                <label
                                  key={type}
                                  className="medical-add-radio-label"
                                >
                                  <input
                                    type="radio"
                                    name="amputationPerformed"
                                    value={type}
                                    checked={
                                      formData.section4.amputationPerformed ===
                                      type
                                    }
                                    onChange={(e) =>
                                      handleChange(e, "section4")
                                    }
                                    className="medical-add-radio-button"
                                  />
                                  <span className="medical-add-radio-button-label">
                                    {type}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {errors.amputationPerformed && (
                              <span className="error-message">
                                This field is required
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      <div className="col-md-4 medical-add-group">
                        <label className="medical-add-label required">
                          No. of hospital visits
                        </label>
                        <input
                          type="number"
                          name="hospitalVisits"
                          className={`form-control ${errors.hospitalVisits ? "error" : ""}`}
                          value={formData.section4.hospitalVisits || ""}
                          onChange={(e) => handleChange(e, "section4")}
                        />
                        {errors.hospitalVisits && (
                          <span className="error-message">
                            This field is required
                          </span>
                        )}
                      </div>

                      <div className="col-md-4 medical-add-group">
                        <label className="medical-add-label required">
                          Hospitalization?
                        </label>
                        <div
                          className={`medical-add-radio-group ${errors.hospitalized ? "error" : ""}`}
                        >
                          {["yes", "no"].map((value) => (
                            <label
                              key={value}
                              className="medical-add-radio-label"
                            >
                              <input
                                type="radio"
                                name="hospitalized"
                                value={value}
                                checked={
                                  formData.section4.hospitalized === value
                                }
                                onChange={(e) => handleChange(e, "section4")}
                                className="medical-add-radio-button"
                              />
                              <span className="medical-add-radio-button-label">
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.hospitalized && (
                          <span className="error-message">
                            This field is required
                          </span>
                        )}
                      </div>

                      {formData.section4.hospitalized === "yes" && (
                        <div className="col-md-4 medical-add-group">
                          <label className="medical-add-label required">
                            Length of stay in hospital: (in days)
                          </label>
                          <input
                            type="number"
                            name="hospitalStayLength"
                            className={`form-control ${errors.hospitalStayLength ? "error" : ""}`}
                            value={formData.section4.hospitalStayLength || ""}
                            onChange={(e) => handleChange(e, "section4")}
                          />
                          {errors.hospitalStayLength && (
                            <span className="error-message">
                              This field is required
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="col-md-4 medical-add-group">
                    <label className="medical-add-label required">Is there any new/active ulcer?</label>
                        <div className={`medical-add-radio-group ${errors.activeUlcer ? "error" : ""}`}>
                          {['yes', 'no'].map((value) => (
                            <label key={value} className="medical-add-radio-label">
                              <input
                                type="radio"
                                name="activeUlcer"
                                value={value}
                                checked={formData.section4.activeUlcer === value}
                                onChange={(e) => handleChange(e, 'section4')}
                                className="medical-add-radio-button"
                              />
                              <span className="medical-add-radio-button-label">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                        {errors.activeUlcer && <span className="error-message">This field is required</span>}
                      </div>
                    </div>
              )}

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
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                    />
                    {errors.deathDate && (
                      <span className="error-message">
                        This field is required
                      </span>
                    )}
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
                    {errors.deathReason && (
                      <span className="error-message">
                        This field is required
                      </span>
                    )}
                  </div>
                </div>
              )}
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

export default FollowUpForm;