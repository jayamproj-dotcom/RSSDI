"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormLayout from "../../../layouts/FormLayout";
import "./StepForm.css";
import StepForm1 from "./StepForm1";
import StepForm2 from "./StepForm2";
import StepForm3 from "./StepForm3";
import { ArrowLeftToLine, Send, Save } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import UploadPopup from "../../../components/UploadPopup";
import SuccessPopup from "../../../components/SuccessPopup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiRequest, apiGet } from "../../../services/api-helper";

const StepForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [step, setStep] = useState(1);
  const initialFormState = {
    section1: {
      patient_name: "",
      consentForm: null,
      consentFormPreview: null,
      consentDownloaded: false,
      consentUploaded: false,
      consentVerified: false,
      address: "",
      locality: "",
      age: "",
      gender: "",
      facilityName: "",
      facilityLocation: "",
      state:"",
      facilityType: "",
      education: "",
      occupation: "",
      maritalStatus: "",
      monthlyIncome: "",
      familyMembers: "",
      dependents: "",
      diabetesType: "",
      diabetesDuration: "",
      hasUlcer: false,
      ulcerDuration: "",
      hasAmputation: false,
      amputationDuration: "",
      hasAngioplasty: false,
      angioplastyDuration: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
      Renal: "",
      retinal: "",
      cardiovascular: "",
      cerebrovascular: "",
      imbIschemia: "",
      hypertension: "",
    },
    section2: {
      Assessment: "",
      attendedBefore: "",
      facilityVisited: "",
      intervalToAssessment: "",
      referredBy: "",
      treatedDays: "",
      referredInDays: "",
      visitedInDays: "",
      necrosis: "",
      necrosisPhoto: null,
      necrosisPhotoPreview: "",
      gangrene: "",
      gangreneType: "",
      probetobone: "",
      osteomyelitis: "",
      sepsis: "",
      arterialStenosis: "",
      infection: "",
      swelling: "",
      erythema: "",
      tenderness: "",
      warmth: "",
   
      cultureReport: "",
      woundSize: "",
      woundLocation: "",
      woundDuration: "",
      woundClassification: "",
      other_treatment: "",
      other_treatment_details: "",
      dressingMaterial: "",
      offloadingDevice: "",
      hospitalization: "",
      amputation: "",
      amputationType: "",
      amputationLevel: "",
      debridementWithAmputation: "",
    
      woundReferenceFile: null,
    },
    section3: {
      burningSensation: "",
      painWhileWalking: "",
      skinChanges: "",
      sensationLoss: "",
      nailProblems: "",
      fungalInfection: "",
      skinLesions: "",
      openCrack: "",
      // cellulitis: "",
      monofilamentLeftA: "",
      monofilamentLeftB: "",
      monofilamentLeftC: "",
      monofilamentRightA: "",
      monofilamentRightB: "",
      monofilamentRightC: "",
      footDeformities: "",
      deformityDuration: "",
      hairLoss: "",
      pulsesPalpable: "",
      skinTemperature: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showSuccess, setShowSuccess] = useState({
    visible: false,
    type: "save",
    showSubmitOption: false,
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load data based on whether we're editing or creating a new record
  useEffect(() => {
    if (location.state?.initialData && location.state?.isUpdate) {
      setIsEditMode(true);
      setPatientId(location.state.initialData.patientId);
      const patientData = location.state.initialData.formData;
      if (patientData) {
        console.log("Loading patient data for editing:", patientData);
        // Ensure no extraneous fields like 'name'
        const sanitizedData = { ...initialFormState, ...patientData };
        if (sanitizedData.section1.name) {
          delete sanitizedData.section1.name;
        }
        setFormData(sanitizedData);
      }
    } else {
      setIsEditMode(false);
      const saved = localStorage.getItem("stepFormData");
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          // Sanitize parsed data to remove 'name' field
          if (parsedData.section1.name) {
            delete parsedData.section1.name;
          }
          if (parsedData.section1.consentForm) {
            parsedData.section1.consentForm = null;
            parsedData.section1.consentFormPreview = null;
          }
          setFormData({ ...initialFormState, ...parsedData });
        } catch (error) {
          console.error("Error parsing saved form data:", error);
        }
      }
    }
  }, [location.state]);

  // Fetch patient data if in edit mode or patientId exists
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && isEditMode) {
        try {
          setIsSaving(true);
          const response = await apiGet(`patient/${patientId}`);
          if (response.data) {
            // Sanitize response to remove 'name' field
            if (response.data.section1.name) {
              delete response.data.section1.name;
            }
            setFormData({ ...initialFormState, ...response.data });
            toast.success("Patient data loaded successfully");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
          toast.error("Failed to fetch patient data");
        } finally {
          setIsSaving(false);
        }
      }
    };
    fetchPatientData();
  }, [patientId, isEditMode]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.section1.consentFormPreview) {
        URL.revokeObjectURL(formData.section1.consentFormPreview);
      }
      uploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [formData.section1.consentFormPreview, uploadedFiles]);

  // Handle form field changes
  const handleChange = (e, section) => {
    const { name, value, type, checked, files } = e.target;

    // Prevent setting 'name' field
    if (name === "name") {
      console.warn("Attempted to set 'name' field, which is not allowed. Use 'patient_name' instead.");
      return;
    }

    if (type === "file") {
      const file = files[0];
      if (!file) return;
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: file,
          [`${name}Preview`]: previewUrl,
          consentUploaded: name === "consentForm" ? true : prev[section].consentUploaded,
        },
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: type === "checkbox" ? checked : value,
        },
      }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Define required fields for each step
  const requiredFields = {
    1: [
      "patient_name",
      "age",
      "gender",
      "locality",
      "facilityName",
      "facilityLocation",
      "state",
      "facilityType",
      "education",
      "occupation",
      "maritalStatus",
      "monthlyIncome",
      "familyMembers",
      "dependents",
      "diabetesType",
      "diabetesDuration",
    ],
    2: [
      "Assessment",
      "attendedBefore",
      ...(formData.section2.attendedBefore === "Yes"
        ? ["facilityVisited", "intervalToAssessment", "referredBy", "treatedDays", "referredInDays", "visitedInDays"]
        : []),
      "necrosis",
      ...(formData.section2.necrosis === "Yes" ? ["necrosisPhoto"] : []),
      "gangrene",
      ...(formData.section2.gangrene === "Yes" ? ["gangreneType"] : []),
      "probetobone",
      "osteomyelitis",
      "sepsis",
      "arterialStenosis",
      "infection",
      "swelling",
      "erythema",
      "tenderness",
      "warmth",
      "woundSize",
      "woundLocation",
      "woundDuration",
      "woundClassification",
      "other_treatment",
      ...(formData.section2.other_treatment === "Yes" ? ["other_treatment_details"] : []),
      "dressingMaterial",
      "offloadingDevice",
      "hospitalization",
      "amputation",
      ...(formData.section2.amputation === "Major" ? ["amputationLevel"] : []),
      "debridementWithAmputation",
    ],
    3: [
      "burningSensation",
      "painWhileWalking",
      "skinChanges",
      "sensationLoss",
      "nailProblems",
      "fungalInfection",
      "skinLesions",
      "openCrack",
      // "cellulitis",
      "monofilamentLeftA",
      "monofilamentLeftB",
      "monofilamentLeftC",
      "monofilamentRightA",
      "monofilamentRightB",
      "monofilamentRightC",
      "footDeformities",
      ...(formData.section3.footDeformities === "yes" ? ["deformityDuration"] : []),
      "hairLoss",
      "pulsesPalpable",
      "skinTemperature",
    ],
  };
  useEffect(() => {
    if (location.state?.initialData && location.state?.isUpdate) {
      setIsEditMode(true);
      setPatientId(location.state.initialData.patientId);
      const patientData = location.state.initialData.formData;
      if (patientData) {
        console.log("Loading patient data for editing:", patientData);
        const sanitizedData = { ...initialFormState, ...patientData };
        if (sanitizedData.section1.name) {
          delete sanitizedData.section1.name;
        }
        setFormData(sanitizedData);
      }
    } else {
      setIsEditMode(false);
      const saved = localStorage.getItem("stepFormData");
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          if (parsedData.section1.name) {
            delete parsedData.section1.name;
          }
          if (parsedData.section1.consentForm) {
            parsedData.section1.consentForm = null;
            parsedData.section1.consentFormPreview = null;
          }
          setFormData({ ...initialFormState, ...parsedData });
        } catch (error) {
          console.error("Error parsing saved form data:", error);
        }
      }
    }
  }, [location.state]);
  // Validate consent form for step 1
  const validateConsentForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
      newErrors.consentForm = "Please upload the signed consent form";
      isValid = false;
    }

    if (!formData.section1.consentVerified) {
      newErrors.consentVerified = "Please verify that you've uploaded the signed consent form";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };
  // Validate current step
  const validateCurrentStep = () => {
    const currentStepFields = requiredFields[step];
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      const consentValid = validateConsentForm();
      if (!consentValid) isValid = false;
    }

    currentStepFields.forEach((field) => {
      let fieldValue = "";
      for (const section in formData) {
        if (formData[section][field] !== undefined) {
          fieldValue = formData[section][field];
          break;
        }
      }

      if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    if (step === 2 && !formData.section2.woundReferenceFile) {
      newErrors.woundReferenceFile = "";
      isValid = false;
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return isValid;
  };

  // Validate all steps
  const validateAllSteps = () => {
    const newErrors = {};
    let allValid = true;

    for (let stepNum = 1; stepNum <= 3; stepNum++) {
      const stepFields = requiredFields[stepNum];
      if (stepNum === 1) {
        const consentValid = validateConsentForm();
        if (!consentValid) allValid = false;
      }
      stepFields.forEach((field) => {
        let fieldValue = "";
        for (const section in formData) {
          if (formData[section][field] !== undefined) {
            fieldValue = formData[section][field];
            break;
          }
        }
        if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
          newErrors[field] = "This field is required";
          allValid = false;
        }
      });
    }

    // if (!formData.section2.woundReferenceFile) {
    //   newErrors.woundReferenceFile = "Please upload a wound reference document or image";
    //   allValid = false;
    // }

    setErrors(newErrors);
    return allValid;
  };

  // Prepare FormData for API submission
  const prepareFormDataForAPI = (section) => {
    const formDataObj = new FormData();
    const validFields = Object.keys(initialFormState[section]);

    // Log formData.section1 for debugging
    console.log(`formData[${section}] before preparing FormData:`, formData[section]);

    // Only include fields defined in initialFormState to prevent sending extraneous fields like 'name'
    Object.entries(formData[section]).forEach(([key, value]) => {
      if (!validFields.includes(key)) {
        console.warn(`Ignoring unexpected field in ${section}: ${key}`);
        return;
      }
      if (key.endsWith("Preview") || value === null || value === undefined) {
        return;
      }
      if (value instanceof File) {
        formDataObj.append(key, value);
      } else {
        formDataObj.append(key, typeof value === "boolean" ? value.toString() : value);
      }
    });

    // Debug: Log FormData contents
    const formDataEntries = {};
    for (let [key, value] of formDataObj.entries()) {
      formDataEntries[key] = value instanceof File ? value.name : value;
    }
    console.log(`Prepared FormData for ${section}:`, formDataEntries);

    // Ensure patient_name is included
    if (!formDataObj.has("patient_name") && section === "section1") {
      console.error("patient_name is missing from FormData");
      throw new Error("Patient name is required");
    }

    return formDataObj;
  };

  // Submit step 1 data
  const submitStep1 = async () => {
    try {
      setIsSaving(true);

      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }

      const formDataToSubmit = new FormData();

      // Add regular fields
      Object.entries(formData.section1).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Handle boolean values
          if (typeof value === 'boolean') {
            formDataToSubmit.append(key, value ? '1' : '0');
          }
          // Handle file uploads
          else if (value instanceof File) {
            formDataToSubmit.append(key, value);
          }
          // Handle other types
          else {
            formDataToSubmit.append(key, value);
          }
        }
      });

      // Add doctor info
      const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
      if (currentUser?.id) formDataToSubmit.append("doctor_id", currentUser.id);
      if (currentUser?.email) formDataToSubmit.append("doctor_email", currentUser.email);

      const response = await fetch(`https://webstrategy.co.in/rssdi/api/patient/step1`, {
        method: "POST",
        body: formDataToSubmit,
        // Don't set Content-Type header - the browser will set it with the correct boundary
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          // Handle validation errors
          const serverErrors = data.errors || {};
          setErrors(serverErrors);

          // Find first error field and scroll to it
          const firstError = Object.keys(serverErrors)[0];
          if (firstError) {
            const errorElement = document.querySelector(`[name="${firstError}"]`);
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }

          throw new Error("Validation failed. Please check the highlighted fields.");
        }
        throw new Error(data.message || "Failed to save step 1 data");
      }

      if (!data.id) {
        throw new Error("No patient ID returned from server");
      }

      toast.success("Step 1 data saved successfully!");
      return data.id;
    } catch (error) {
      console.error("Error submitting step 1:", error);
      toast.error(error.message || "Failed to save step 1 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };




  // Submit step 2 data
  const submitStep2 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }
      const formDataToSubmit = prepareFormDataForAPI("section2");

      const response = await apiRequest(`patient/step2/${id}`, {
        method: "POST",
        body: formDataToSubmit,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 422) {
        const serverErrors = response.errors || {};
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
        });
        setErrors(formattedErrors);
        throw new Error("Validation failed. Please check all fields.");
      }

      toast.success("Step 2 data saved successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting step 2:", error);
      toast.error(error.message || "Failed to save step 2 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Submit step 3 data
  const submitStep3 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }
      const formDataToSubmit = prepareFormDataForAPI("section3");

      const response = await apiRequest(`patient/step3/${id}`, {
        method: "POST",
        body: formDataToSubmit,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 422) {
        const serverErrors = response.errors || {};
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
        });
        setErrors(formattedErrors);
        throw new Error("Validation failed. Please check all fields.");
      }

      toast.success("Step 3 data saved successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting step 3:", error);
      toast.error(error.message || "Failed to save step 3 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle next step
  const nextStep = async () => {
    console.log("Attempting to move to next step...");
    const isValid = validateCurrentStep();
    console.log("Validation result:", isValid);
    console.log("Current errors:", errors);

    if (isValid) {
      try {
        if (step === 1 && !isEditMode && !patientId) {
          const newPatientId = await submitStep1();
          setPatientId(newPatientId);
        } else if (step === 2 && patientId) {
          await submitStep2(patientId);
        }

        if (step === 3) {
          setShowSuccess({
            visible: true,
            type: "submit",
            showSubmitOption: true,
            message: "Step 3 completed! You can now submit the form.",
          });
          return;
        }

        setStep((prev) => Math.min(prev + 1, 3));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Error moving to next step:", error);
      }
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  // Handle previous step
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate follow-up date
  const calculateFollowUpDate = (currentDate) => {
    const date = new Date(currentDate);
    date.setMinutes(date.getMinutes() + 5); // For testing
    return date.toISOString();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isValid = validateAllSteps();
      if (!isValid) {
        toast.error("Please fill all required fields");
        return;
      }

      setIsSaving(true);

      if (!patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
        await submitStep2(newPatientId);
        await submitStep3(newPatientId);
      } else {
        if (isEditMode) {
          await submitStep1();
          await submitStep2(patientId);
        }
        await submitStep3(patientId);
      }

      localStorage.removeItem("stepFormData");
      setSubmissionStatus("completed");
      toast.success(`Form successfully ${isEditMode ? "updated" : "submitted"}!`);

      setFormData(initialFormState);
      navigate("/user/rssdi-save-the-feet-2.0", {
        state: {
          showToast: true,
          toastMessage: `Patient assessment ${isEditMode ? "updated" : "completed"}`,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle consent form download
  const handleDownloadForm = async () => {
    try {
      const pdfPath = "/Consent_form_registry.pdf";
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleChange(
        { target: { name: "consentDownloaded", value: true } },
        "section1"
      );
    } catch (error) {
      console.error("Error downloading consent form:", error);
      toast.info("Failed to download consent form. Please contact support.");
    }
  };

  // Handle save for later
  const handleSaveForLater = async () => {
    setIsSaving(true);
    try {
      if (step === 1 && !patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
      } else if (step === 2 && patientId) {
        await submitStep2(patientId);
      } else if (step === 3 && patientId) {
        await submitStep3(patientId);
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData));
      if (formDataForStorage.section1.consentForm) {
        formDataForStorage.section1.consentForm = null;
        formDataForStorage.section1.consentFormPreview = null;
      }
      if (formDataForStorage.section2.necrosisPhoto) {
        formDataForStorage.section2.necrosisPhoto = null;
        formDataForStorage.section2.necrosisPhotoPreview = null;
      }
      if (formDataForStorage.section2.woundReferenceFile) {
        formDataForStorage.section2.woundReferenceFile = null;
      }

      localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
      toast.success("Progress saved successfully!");
      setShowUploadPopup(false);
      navigate("/user/rssdi-save-the-feet-2.0");
    } catch (error) {
      console.error("Error saving for later:", error);
      toast.error(error.message || "Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    localStorage.removeItem("stepFormData");
    setShowUploadPopup(false);
    navigate("/user/rssdi-save-the-feet-2.0");
  };

  // Handle save
  const handleSave = async () => {
    if (validateCurrentStep()) {
      setIsSaving(true);
      try {
        if (step === 1 && !patientId) {
          const newPatientId = await submitStep1();
          setPatientId(newPatientId);
        } else if (step === 2 && patientId) {
          await submitStep2(patientId);
        } else if (step === 3 && patientId) {
          await submitStep3(patientId);
        }

        const formDataForStorage = JSON.parse(JSON.stringify(formData));
        if (formDataForStorage.section1.consentForm) {
          formDataForStorage.section1.consentForm = null;
          formDataForStorage.section1.consentFormPreview = null;
        }
        if (formDataForStorage.section2.necrosisPhoto) {
          formDataForStorage.section2.necrosisPhoto = null;
          formDataForStorage.section2.necrosisPhotoPreview = null;
        }
        if (formDataForStorage.section2.woundReferenceFile) {
          formDataForStorage.section2.woundReferenceFile = null;
        }

        localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
        setShowSuccess({
          visible: true,
          type: "save",
          showSubmitOption: false,
          message: "Progress saved successfully!",
        });
        setTimeout(() => {
          setShowSuccess((prev) => ({ ...prev, visible: false }));
        }, 2000);
      } catch (error) {
        console.error("Error saving progress:", error);
        toast.error(error.message || "Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      // Handle different steps
      if (step === 1 && !patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
      } else if (step === 2 && patientId) {
        await submitStep2(patientId);
      }

      // Clean up form data before storing it
      const formDataForStorage = JSON.parse(JSON.stringify(formData));
      cleanUpFormData(formDataForStorage);

      // Store the cleaned form data
      localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
      toast.success("Progress saved successfully!");

      // Move to next step
      nextStep();
    } catch (error) {
      console.error("Error saving and continuing:", error);
      toast.error(error.message || "Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Clean up form data by removing sensitive fields
  const cleanUpFormData = (data) => {
    if (data.section1.consentForm) {
      data.section1.consentForm = null;
      data.section1.consentFormPreview = null;
    }
    if (data.section2.necrosisPhoto) {
      data.section2.necrosisPhoto = null;
      data.section2.necrosisPhotoPreview = null;
    }
    if (data.section2.woundReferenceFile) {
      data.section2.woundReferenceFile = null;
    }
  };






  // Handle add new
  const handleAddNew = () => {
    navigate("/user/dashboard");
  };

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (stepNumber > step) {
      if (!validateCurrentStep()) {
        toast.error("Please complete the current step before moving forward.");
        return;
      }
    }
    setStep(stepNumber);
  };

  // Render step
  const renderStep = () => {
    const stepProps = { formData, handleChange, errors, setErrors };
    switch (step) {
      case 1:
        return <StepForm1 {...stepProps} />;
      case 2:
        return <StepForm2 {...stepProps} />;
      case 3:
        return <StepForm3 {...stepProps} />;
      default:
        return null;
    }
  };

  // Step titles
  const stepTitles = {
    1: {
      default: "Participant Information (baseline)",
      edit: "Edit Participant Information (baseline)",
    },
    2: {
      default: "Details of Active Ulcer and its Treatment",
      edit: "Edit Details of Active Ulcer and its Treatment",
    },
    3: {
      default: "3-Minute Foot Examination",
      edit: "Edit 3-Minute Foot Examination",
    },
  };

  return (
    <FormLayout>
      <div className="step-form-container">
        <div className="form-header">
          <h2 className="form-title">{isEditMode ? stepTitles[step].edit : stepTitles[step].default}</h2>
          <button type="button" onClick={handleAddNew} className="dashboard-btn" aria-label="Go back to dashboard">
            <ArrowLeftToLine size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="step-progress-container">
            <div className="step-progress-bar">
              <div className="step-progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <div className="step-indicator">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`step-item ${step >= stepNumber ? "active" : ""} ${step > stepNumber ? "completed" : ""}`}
                  onClick={() => handleStepClick(stepNumber)}
                >
                  <div className="step-number">
                    {step > stepNumber ? (
                      <svg viewBox="0 0 24 24" className="check-icon">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className="step-label">
                    {stepNumber === 1 && "Step 1"}
                    {stepNumber === 2 && "Step 2"}
                    {stepNumber === 3 && "Step 3"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-step-content">{renderStep()}</div>

          <div className="step-form-actions">
            <div className="action-buttons stepform-actions">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="prev-btn"
                  aria-label="Go to previous step"
                  disabled={isSaving}
                >
                  <ArrowLeftToLine size={18} />
                  <span>Previous</span>
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  className={`save-continue-btn ${isSaving ? "saving" : ""}`}
                  aria-label="Save and continue to next step"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save & Continue</span>
                    </>
                  )}
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  className="submit-btn"
                  aria-label="Submit form"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Form</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {showUploadPopup && (
          <UploadPopup
            onClose={() => setShowUploadPopup(false)}
            handleFileUpload={handleFileUpload}
            handleDownloadForm={handleDownloadForm}
            uploadedFiles={uploadedFiles}
            handleRemoveFile={handleRemoveFile}
            handleSaveForLater={handleSaveForLater}
            handleUploadComplete={handleUploadComplete}
            isSaving={isSaving}
          />
        )}

        <SuccessPopup
          visible={showSuccess.visible}
          onClose={() => setShowSuccess({ ...showSuccess, visible: false })}
          type={showSuccess.type}
          showSubmitOption={showSuccess.showSubmitOption}
          message={showSuccess.message}
          onContinueToSubmit={() => {
            setShowSuccess({ ...showSuccess, visible: false });
            const event = { preventDefault: () => { } };
            handleSubmit(event);
          }}
        />
      </div>
    </FormLayout>
  );
};

export default StepForm;