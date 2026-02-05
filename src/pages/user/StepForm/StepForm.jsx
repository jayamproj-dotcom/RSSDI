"use client"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useRef } from "react"
import FormLayout from "../../../layouts/FormLayout"
import "./StepForm.css"
import StepForm1 from "./StepForm1"
import StepForm2 from "./StepForm2"
import StepForm3 from "./StepForm3"
import { ArrowLeftToLine, Send, Save } from "lucide-react"
import { LoadingOutlined } from "@ant-design/icons"
import UploadPopup from "../../../components/UploadPopup"
import SuccessPopup from "../../../components/SuccessPopup"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { apiGet } from "../../../services/api-helper"
import { IMAGE_BASE_URL } from "../../../config/api"
import { API_BASE_URL } from "../../../config/api"

const StepForm = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [submissionStatus, setSubmissionStatus] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [step, setStep] = useState(1)
  const step1SubmittedRef = useRef(false)

  const [selectedTest, setSelectedTest] = useState("");

  const [currentStatus, setCurrentStatus] = useState("")

  const initialFormState = {
    section1: {
      patient_name: "",
      consentForm: "",
      consentFormPreview: "",
      consentDownloaded: "",
      consentVerified: false,
      consentUploaded: false,
      locality: "",
      villageOrCity: "",
      state: "",
      facilityState: "",
      pincode: "",
      treatmentType: "",
      facilityEmail: "",
      age: "",
      gender: "",
      facilityName: "",
      facilityLocation: "",
      facilityType: "",
      education: "",
      occupation: "",
      maritalStatus: "",
      sesRating: null,
      familyMembers: "",
      dependents: "",
      diabetesType: "",
      diabetesDuration: "",
      hasUlcer: "",
      hasAmputation: "",
      hasAngioplasty: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
      renal: "",
      retinal: "",
      cardiovascular: "",
      cerebrovascular: "",
      hypertension: "",
      heartFailure: "",
      limbIschemia: "",
      wearFootWear: "",
      regularfootExamination: "",
      walkOnSand: "",
      washFeet: "",
      fastingGlucose: "",
      postPrandialGlucose: "",
      hba1c: "",
      totalCholesterol: "",
      triglycerides: "",
      hdl: "",
      ldl: "",
      vldl: "",
      renalDuration: "",
      retinalDuration: "",
      cardiovascularDuration: "",
      heartFailureDuration: "",
      cerebrovascularDuration: "",
      limbIschemiaDuration: "",
      hypertensionDuration: "",
      serumCreatinine: "",
      status: "",
    },
    section2: {
      Assessment: "",
      necrosis: "",
      leg: "",
      foot: "",
      rightFoot_forefoot: "",
      rightFoot_hindfoot: "",
      rightFoot_midfoot: "",
      leftFoot_forefoot: "",
      leftFoot_hindfoot: "",
      leftFoot_midfoot: "",
      purulentDischarge: "",
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
      woundDuration: "",
      other_treatment: "",
      other_treatment_details: "",
      dressingMaterial: "",
      offloadingDevice: "",
      amputation: "",
      amputationLevel: "",
      antibioticsGiven: "",
      surgicalProcedure: "",
      surgicalProcedureOther: "",
      woundReferenceFile: "",
      woundReferenceFilePreview: "",
      woundReferenceConsent: "",
      cultureReportAvailable: "",
      arterialReport: "",
      cultureReportPreview: "",
      arterialReportPreview: "",
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
      testType: "",
      monofilamentLeftA: "",
      monofilamentLeftB: "",
      monofilamentLeftC: "",
      monofilamentRightA: "",
      monofilamentRightB: "",
      monofilamentRightC: "",
      tuningForkRightMedialMalleolus: "",
      tuningForkRightLateralMalleolus: "",
      tuningForkRightBigToe: "",
      tuningForkLeftMedialMalleolus: "",
      tuningForkLeftLateralMalleolus: "",
      tuningForkLeftBigToe: "",
      footDeformities: "",
      hairLoss: "",
      pulsesPalpable: "",
      skinTemperature: "",
    },
  }

  const [formData, setFormData] = useState(initialFormState)
  const [editedFields, setEditedFields] = useState({
    section1: {},
    section2: {},
    section3: {},
  })

  const [showSuccess, setShowSuccess] = useState({
    visible: false,
    type: "save",
    showSubmitOption: false,
    showEditOption: false,
    message: "",
  })
  const [errors, setErrors] = useState({})
  const [showUploadPopup, setShowUploadPopup] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Fix 1: Add hasAmputation to radioFields
  const isRadioField = (field) => {
    const radioFields = [
      // Section 1
      "hasUlcer", "hasAngioplasty",// Added hasAmputation
      "renal", "retinal", "cardiovascular", "cerebrovascular", "hypertension", "limbIschemia",
      // Section 2
      "necrosis", "gangrene", "sepsis",
      "arterialStenosis", "swelling", "erythema",
      "tenderness", "warmth",
      // Section 3
      "burningSensation", "painWhileWalking", "skinChanges", "sensationLoss",
      "nailProblems", "fungalInfection", "skinLesions", "openCrack",
      "hairLoss", "pulsesPalpable",
    ];
    return radioFields.includes(field);
  };

  // Fix 2: Update convertToYesNo function for hasAmputation
  const convertToYesNo = (value, fieldName) => {
    // Handle null/undefined values first
    if (value === null || value === undefined) return "";

    if (fieldName === "hasAmputation") {
      if (value === null || value === undefined || value === "") return "No";

      const v = String(value).trim().toLowerCase();

      // DB enum
      if (v === "no") return "No";
      if (v === "minor") return "Minor";
      if (v === "major") return "Major";

      // Legacy / boolean values from DB
      if (v === "1" || v === "yes" || value === true) return "Minor";
      if (v === "0" || v === "no" || value === false) return "No";

      return "No";
    }

    // For footDeformities field
    if (fieldName === "footDeformities") {
      const valStr = String(value).trim().toLowerCase();
      if (valStr === "minor" || valStr === "major" || valStr === "no") return valStr;
      return "";
    }

    // For all other boolean fields
    const valStr = String(value).trim().toLowerCase();
    if (valStr === "yes" || valStr === "1" || valStr === "true" || value === true || value === 1) return "yes";
    if (valStr === "no" || valStr === "0" || valStr === "false" || value === false || value === 0) return "no";
    return "";
  };

  // Fix 3: Add hasAmputation to fieldMappings
  const mapFlatToNested = (flatData) => {
    console.log("Flat API Data:", flatData);

    const nestedData = JSON.parse(JSON.stringify(initialFormState));

    const fieldMappings = {
      section1: {
        hasUlcer: ["hasUlcer", "has_ulcer"],
        hasAmputation: ["hasAmputation", "has_amputation"], // Added this line
        hasAngioplasty: ["hasAngioplasty", "has_angioplasty"],
        renal: ["renal"],
        retinal: ["retinal"],
        cardiovascular: ["cardiovascular"],
        cerebrovascular: ["cerebrovascular"],
        hypertension: ["hypertension"],
        consentDownloaded: ["consentDownloaded", "consent_downloaded"],
        consentUploaded: ["consentUploaded", "consent_uploaded"],
        consentVerified: ["consentVerified", "consent_verified"],
        limbIschemia: ["limbIschemia", "limb_ischemia"],
        consentForm: ["consentForm", "consent_form"],
        arterialReport: ["arterialReport", "arterial_report"],
        woundReferenceFile: ["woundReferenceFile", "wound_reference_file"],
      },
      section2: {
        necrosis: ["necrosis"],
        gangrene: ["gangrene"],
        sepsis: ["sepsis"],
        arterialStenosis: ["arterialStenosis", "arterial_issues"],
        necrosisPhoto: ["necrosisPhoto", "necrosis_photo"],
        cultureReport: ["cultureReport", "culture_report"],
        woundReferenceFile: ["woundReferenceFile", "wound_reference_file"],
      },
      section3: {
        burningSensation: ["burningSensation", "burning_sensation"],
        painWhileWalking: ["painWhileWalking", "pain_while_walking"],
        skinChanges: ["skinChanges", "skin_changes"],
        sensationLoss: ["sensationLoss", "sensation_loss"],
        nailProblems: ["nailProblems", "nail_problems"],
        fungalInfection: ["fungalInfection", "fungal_infection"],
        skinLesions: ["skinLesions", "skin_lesions"],
        openCrack: ["openCrack", "open_wound"],
        monofilamentLeftA: ["monofilamentLeftA", "monofilament_left_a"],
        monofilamentLeftB: ["monofilamentLeftB", "monofilament_left_b"],
        monofilamentLeftC: ["monofilamentLeftC", "monofilament_left_c"],
        monofilamentRightA: ["monofilamentRightA", "monofilament_right_a"],
        monofilamentRightB: ["monofilamentRightB", "monofilament_right_b"],
        monofilamentRightC: ["monofilamentRightC", "monofilament_right_c"],
        tuningForkRightMedialMalleolus: ["tuningForkRightMedialMalleolus", "tuning_fork_right_medial_malleolus"],
        tuningForkRightLateralMalleolus: ["tuningForkRightLateralMalleolus", "tuning_fork_right_lateral_malleolus"],
        tuningForkRightBigToe: ["tuningForkRightBigToe", "tuning_fork_right_big_toe"],
        tuningForkLeftMedialMalleolus: ["tuningForkLeftMedialMalleolus", "tuning_fork_left_medial_malleolus"],
        tuningForkLeftLateralMalleolus: ["tuningForkLeftLateralMalleolus", "tuning_fork_left_lateral_malleolus"],
        tuningForkLeftBigToe: ["tuningForkLeftBigToe", "tuning_fork_left_big_toe"],
        footDeformities: ["footDeformities", "footDeformities"],
        hairLoss: ["hairLoss", "hair_growth"],
        pulsesPalpable: ["pulsesPalpable", "pulses_palpable"],
        skinTemperature: ["skinTemperature", "skin_temperature"],
        footImage: ["footImage", "foot_image"],
      },
    };

    const imageFields = [
      "consentForm",
      "necrosisPhoto",
      "woundReferenceFile",
      "woundReferenceConsent",
      "arterialReport",
      "cultureReport",
      "footImage"
    ];

    Object.keys(nestedData).forEach((section) => {
      Object.keys(nestedData[section]).forEach((field) => {
        if (field.endsWith("Preview")) return;

        const isBooleanField = isRadioField(field);
        let value;

        if (fieldMappings[section]?.[field]) {
          for (const variant of fieldMappings[section][field]) {
            if (flatData[variant] !== undefined) {
              value = flatData[variant];
              break;
            }
          }
        } else {
          value = flatData[field];
        }

        // Special handling for hasAmputation
        if (field === "hasAmputation") {
          nestedData.section1.hasAmputation =
            value ? String(value).toLowerCase() : "no";
          return;
        }

        if (field === "footDeformities") {
          // Get the value from all possible field names
          const rawValue = flatData.footDeformities || flatData.foot_deformities;

          console.log("Processing footDeformities:", {
            rawValue: rawValue,
            type: typeof rawValue,
            section: section,
            field: field
          });

          if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
            const strValue = String(rawValue).trim().toLowerCase();

            // Direct mapping
            if (strValue === "no" || strValue === "minor" || strValue === "major") {
              nestedData[section][field] = strValue;
            }
            // Handle numeric values
            else if (strValue === "0" || strValue === "false") {
              nestedData[section][field] = "no";
            }
            else if (strValue === "1" || strValue === "true") {
              nestedData[section][field] = "minor";
            }
            else if (strValue === "2") {
              nestedData[section][field] = "major";
            }
            else {
              nestedData[section][field] = ""; // fallback
            }
          } else {
            nestedData[section][field] = "";
          }

          console.log("Set footDeformities to:", nestedData[section][field]);
          return;
        }

        if (value !== undefined && value !== null && value !== "") {
          if (isBooleanField) {
            nestedData[section][field] = convertToYesNo(value, field);
          } else if (imageFields.includes(field)) {
            nestedData[section][field] = value || "";
            const previewField = `${field}Preview`;
            if (nestedData[section].hasOwnProperty(previewField)) {
              if (value && typeof value === 'string' && value.trim() !== '') {
                nestedData[section][previewField] = `${IMAGE_BASE_URL}${value}`;
              } else {
                nestedData[section][previewField] = '/pdf-icon.png';
              }
            }
            if (field === "consentForm" && value && typeof value === 'string' && value.trim() !== '') {
              nestedData[section].consentFormName = value.split('/').pop() || 'consent_form.pdf';
            }
          } else {
            nestedData[section][field] = String(value);
          }
        } else {
          nestedData[section][field] = "";
          if (field === "consentFormName") {
            nestedData[section].consentFormName = 'consent_form.pdf';
          }
          if (imageFields.includes(field)) {
            const previewField = `${field}Preview`;
            if (nestedData[section].hasOwnProperty(previewField)) {
              nestedData[section][previewField] = '/pdf-icon.png';
            }
          }
        }
      });
    });

    // 🔒 FINAL AMPUTATION CONSISTENCY FIX
    if (
      nestedData.section2.amputation &&
      ["major", "minor"].includes(
        String(nestedData.section2.amputation).toLowerCase()
      )
    ) {
      const amp = String(nestedData.section2.amputation).toLowerCase();
      nestedData.section1.hasAmputation =
        amp === "major" ? "Major" : "Minor";
    }

    console.log("Mapped Nested Data - footDeformities:", nestedData.section3.footDeformities);
    return nestedData;
  }

  // Fix 4: Remove hasAmputation from requiredFields for step 1
  const requiredFields = {
    1: [
      "patient_name",
      "age",
      "gender",
      "villageOrCity",
      "state",
      "treatmentType",
      "education",
      "occupation",
      "maritalStatus",
      "sesRating",
      "familyMembers",
      "dependents",
      "diabetesType",
      "diabetesDuration",
      "hasUlcer",
      // REMOVED: "hasAmputation", // This is the fix - remove it from required fields
      "hasAngioplasty",
      "renal",
      "retinal",
      "cardiovascular",
      "heartFailure",
      "cerebrovascular",
      "limbIschemia",
      "hypertension",
      "smoking",
      "alcohol",
      "tobacco",
      "wearFootWear",
      "regularfootExamination",
      "walkOnSand",
      "washFeet",
      "fastingGlucose",
      "postPrandialGlucose",
      "hba1c",
      "serumCreatinine"
    ],
    2: [
      "Assessment",
      "gangrene",
      ...(formData.section2.gangrene.toLowerCase() === "yes" ? ["gangreneType"] : []),
      "probetobone",
      "osteomyelitis",
      "sepsis",
      "arterialStenosis",
      "infection",
      "swelling",
      "erythema",
      "tenderness",
      "warmth",
      "necrosis",
      "purulentDischarge",
      "antibioticsGiven",
      "surgicalProcedure",
      "leg",
      "foot",
      ...(formData.section2.foot === 'right' || formData.section2.foot === 'both' ? [
        'rightFoot_forefoot',
        'rightFoot_hindfoot',
        'rightFoot_midfoot'
      ] : []),
      ...(formData.section2.foot === 'left' || formData.section2.foot === 'both' ? [
        'leftFoot_forefoot',
        'leftFoot_hindfoot',
        'leftFoot_midfoot'
      ] : []),
      "cultureReportAvailable",
      "woundSize",
      "woundDuration",
      "other_treatment",
      ...(formData.section2.other_treatment === "Yes" ? ["other_treatment_details"] : []),
      "dressingMaterial",
      "offloadingDevice",
      "amputation",
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
      "hairLoss",
      "pulsesPalpable",
      "skinTemperature",
      "footDeformities",
      // ...(["minor", "major"].includes(formData.section3.footDeformities)
      //   ? ["footDeformities"]
      //   : []),
      "testType",
      ...(formData.section3.testType === "monofilament"
        ? [
          "monofilamentLeftA",
          "monofilamentLeftB",
          "monofilamentLeftC",
          "monofilamentRightA",
          "monofilamentRightB",
          "monofilamentRightC"
        ]
        : []),
      ...(formData.section3.testType === "tuningFork"
        ? [
          "tuningForkRightMedialMalleolus",
          "tuningForkRightLateralMalleolus",
          "tuningForkRightBigToe",
          "tuningForkLeftMedialMalleolus",
          "tuningForkLeftLateralMalleolus",
          "tuningForkLeftBigToe"
        ]
        : [])
    ],
  }

  // Fix 5: Update validateCurrentStep to handle hasAmputation properly
  const validateCurrentStep = () => {
    const currentStepFields = requiredFields[step];
    const newErrors = {};
    let isValid = true;

    console.log(`Validating Step ${step} fields:`, currentStepFields);

    currentStepFields.forEach((field) => {
      let fieldValue;
      let section;

      for (const sec in formData) {
        if (formData[sec][field] !== undefined) {
          section = sec;
          fieldValue = formData[sec][field];
          break;
        }
      }

      if (shouldSkipFieldValidation(field)) {
        console.log(`Skipping validation for ${field}`);
        return;
      }

      if (field === "hasAmputation") {
        if (!["no", "minor", "major"].includes(fieldValue)) {
          newErrors[field] = "Please select amputation status";
          isValid = false;
        }
        return;
      }

      if (field === "footDeformities") {
        if (!["no", "minor", "major"].includes(fieldValue)) {
          newErrors[field] = "Please select foot deformity status";
          isValid = false;
        }
        return;
      }


      if (isRadioField(field)) {
        if (!fieldValue || fieldValue === '') {
          newErrors[field] = 'This selection is required';
          isValid = false;
        }
        return;
      }

      if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return isValid;
  };

  // Fix 6: Update shouldSkipFieldValidation
  const shouldSkipFieldValidation = (field) => {
    const conditionalFields = {
      gangreneType: !['Yes', 'yes'].includes(formData.section2.gangrene),
      other_treatment_details: !['Yes', 'yes'].includes(formData.section2.other_treatment),
      amputationLevel: !['Major', 'major'].includes(formData.section2.amputation),
      deformityDuration: !['minor', 'major'].includes(formData.section3.footDeformities),
    };
    return conditionalFields[field] === true;
  };

  // Load data for edit or new record
  useEffect(() => {
    const loadData = async () => {
      if (location.state?.initialData && location.state?.isUpdate) {
        setIsEditMode(true)
        setPatientId(location.state.initialData.patientId)

        try {
          setIsSaving(true)
          const response = await apiGet(`patient/${location.state.initialData.patientId}`)
          console.log("API Response:", response)

          const initialData = location.state?.initialData?.formData || location.state?.initialData || {}
          const mergedData = {
            ...(response.patient || {}),
            ...initialData,
          }

          const nestedData = mapFlatToNested(mergedData)
          setFormData(nestedData)
          if (mergedData.status) {
            setCurrentStatus(mergedData.status)
          }
        } catch (error) {
          console.error("Error fetching patient data:", error)
          const initialData = location.state?.initialData?.formData || location.state?.initialData
          if (initialData) {
            const nestedData = mapFlatToNested(initialData)
            setFormData(nestedData)
          }
        } finally {
          setIsSaving(false)
        }
      } else {
        setIsEditMode(false)
        const saved = localStorage.getItem("stepFormData")
        if (saved) {
          try {
            const parsedData = JSON.parse(saved)
            setFormData({ ...initialFormState, ...parsedData })
          } catch (error) {
            console.error("Error parsing saved form data:", error)
          }
        }
      }
    }

    loadData()
  }, [location.state])

  // useEffect(() => {
  //   const fetchPatientData = async () => {
  //     if (patientId && isEditMode) {
  //       try {
  //         setIsSaving(true)
  //         const response = await apiGet(`patient/${patientId}`)
  //         console.log("API Response for patient:", response)

  //         const initialData = location.state?.initialData?.formData || location.state?.initialData || {}
  //         let mergedData

  //         if (response.patient) {
  //           mergedData = {
  //             ...response.patient,
  //             ...initialData,
  //           }

  //           Object.keys(mergedData).forEach((key) => {
  //             if (key.includes("_")) {
  //               const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  //               if (mergedData[camelKey] === undefined) {
  //                 mergedData[camelKey] = mergedData[key]
  //               }
  //             } else if (/[A-Z]/.test(key)) {
  //               const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
  //               if (mergedData[snakeKey] === undefined) {
  //                 mergedData[snakeKey] = mergedData[key]
  //               }
  //             }
  //           })

  //           console.log("Merged Data (API + initialData):", mergedData)
  //         } else {
  //           console.warn("No patient data from API, using initialData:", initialData)
  //           mergedData = {
  //             ...initialData,
  //           }
  //         }

  //         const nestedData = mapFlatToNested(mergedData)
  //         console.log("Final nested data for form:", nestedData)
  //         setFormData(nestedData)
  //         toast.success("Patient data loaded successfully")
  //       } catch (error) {
  //         console.error("Error fetching patient data:", error)
  //         const initialData = location.state?.initialData?.formData || location.state?.initialData
  //         if (initialData) {
  //           console.warn("Error fetching API data, using initialData:", initialData)
  //           const nestedData = mapFlatToNested(initialData)
  //           setFormData(nestedData)
  //           toast.warn("Loaded data from initial input due to API error")
  //         } else {
  //           toast.error("Failed to fetch patient data")
  //         }
  //       } finally {
  //         setIsSaving(false)
  //       }
  //     }
  //   }
  //   fetchPatientData()
  // }, [patientId, isEditMode, location.state])



  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && isEditMode) {
        try {
          setIsSaving(true);
          const response = await apiGet(`patient/${patientId}`);
          console.log("API Response for patient - checking footDeformities:", {
            apiFootDeformities: response.patient?.footDeformities,
            apiFoot_deformities: response.patient?.foot_deformities
          });

          const initialData = location.state?.initialData?.formData || location.state?.initialData || {};
          let mergedData;

          if (response.patient) {
            // REVERSE THE ORDER: initialData first, then API response
            // This ensures API data (which has the real values) takes precedence
            mergedData = {
              ...initialData,           // Start with initialData (likely empty)
              ...response.patient,      // Override with API data (has real values)
            };

            // Debug before adding snake/camel case
            console.log("After merge - footDeformities:", mergedData.footDeformities);

            Object.keys(mergedData).forEach((key) => {
              if (key.includes("_")) {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                if (mergedData[camelKey] === undefined) {
                  mergedData[camelKey] = mergedData[key];
                }
              } else if (/[A-Z]/.test(key)) {
                const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                if (mergedData[snakeKey] === undefined) {
                  mergedData[snakeKey] = mergedData[key];
                }
              }
            });

            // SPECIAL FIX: Ensure footDeformities has the API value
            if (response.patient.footDeformities) {
              mergedData.footDeformities = response.patient.footDeformities;
              mergedData.foot_deformities = response.patient.footDeformities;
            } else if (response.patient.foot_deformities) {
              mergedData.footDeformities = response.patient.foot_deformities;
              mergedData.foot_deformities = response.patient.foot_deformities;
            }

            console.log("Merged Data - final footDeformities check:", {
              footDeformities: mergedData.footDeformities,
              foot_deformities: mergedData.foot_deformities,
              fromApi: response.patient.footDeformities || response.patient.foot_deformities
            });
          } else {
            console.warn("No patient data from API, using initialData:", initialData);
            mergedData = { ...initialData };
          }

          const nestedData = mapFlatToNested(mergedData);
          console.log("Final nested data for form - footDeformities:", nestedData.section3.footDeformities);
          setFormData(nestedData);
          if (mergedData.status) {
            setCurrentStatus(mergedData.status);
          }
          toast.success("Patient data loaded successfully");
        } catch (error) {
          console.error("Error fetching patient data:", error);
          const initialData = location.state?.initialData?.formData || location.state?.initialData;
          if (initialData) {
            console.warn("Error fetching API data, using initialData:", initialData);
            const nestedData = mapFlatToNested(initialData);
            setFormData(nestedData);
            toast.warn("Loaded data from initial input due to API error");
          } else {
            toast.error("Failed to fetch patient data");
          }
        } finally {
          setIsSaving(false);
        }
      }
    };
    fetchPatientData();
  }, [patientId, isEditMode, location.state]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (formData.section1.consentFormPreview) {
        URL.revokeObjectURL(formData.section1.consentFormPreview)
      }
      uploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [formData.section1.consentFormPreview, uploadedFiles])

  // Handle form field changes
  const handleChange = (e, section) => {
    const { name, value, type, checked, files } = e.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "radio") {
      newValue = value;
    } else if (type === "file") {
      newValue = files[0];
    } else {
      newValue = name === "sesRating" ? Number(value) : value;
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue,
      },
    }));

    setEditedFields((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue,
      },
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Prepare FormData for API submission
  const prepareFormDataForAPI = (step, status) => {
    const formDataObj = new FormData()
    const section = `section${step}`
    const validFields = Object.keys(initialFormState[section])

    if (status) {
      formDataObj.append("status", status);
    }


    // Object.entries(formData[section]).forEach(([key, value]) => {
    //   if (!validFields.includes(key)) {
    //     console.warn(`Ignoring unexpected field in ${section}: ${key}`)
    //     return
    //   }

    //   if (key.endsWith("Preview") || value === null || value === undefined) {
    //     return
    //   }

    //   if (key === "footDeformities") {
    //     formDataObj.append(key, value);
    //     return;
    //   }

    //   if (key === "hasAmputation") {
    //     formDataObj.append(key, value);
    //     return;
    //   }

    //   if (isRadioField(key)) {
    //     formDataObj.append(key, value === "yes" ? "1" : "0")
    //     return
    //   }


    //   if (value instanceof File) {
    //     formDataObj.append(key, value)
    //   } else if (typeof value === "boolean") {
    //     formDataObj.append(key, value.toString())
    //   } else {
    //     formDataObj.append(key, String(value))
    //   }
    // })


    const MONOFILAMENT_FIELDS = ['monofilamentLeftA', 'monofilamentLeftB', 'monofilamentLeftC', 'monofilamentRightA', 'monofilamentRightB', 'monofilamentRightC'];
    const TUNING_FORK_FIELDS = ['tuningForkRightBigToe', 'tuningForkRightMedialMalleolus', 'tuningForkRightLateralMalleolus', 'tuningForkLeftBigToe', 'tuningForkLeftMedialMalleolus', 'tuningForkLeftLateralMalleolus'];

    const selectedTestType = formData[section]?.testType;

    Object.entries(formData[section]).forEach(([key, value]) => {
      if (!validFields.includes(key)) return;

      // ❌ never send preview fields
      if (key.endsWith("Preview")) return;

      // 🔥 SECTION 3 TEST-TYPE BASED RESET LOGIC
      if (section === "section3") {
        if (
          selectedTestType === "monofilament" &&
          TUNING_FORK_FIELDS.includes(key)
        ) {
          formDataObj.append(key,""); // 👈 force empty
          return;
        }

        if (
          selectedTestType === "tuningFork" &&
          MONOFILAMENT_FIELDS.includes(key)
        ) {
          formDataObj.append(key,""); // 👈 force empty
          return;
        }
      }

      // ✅ radio fields FIRST (very important)
      if (isRadioField(key)) {
        if (value === "yes") formDataObj.append(key, "1");
        else if (value === "no") formDataObj.append(key, "0");
        else formDataObj.append(key, "");
        return;
      }

      // ✅ Section 3 non-radio: null → ""
      if (section === "section3" && (value === null || value === undefined)) {
        formDataObj.append(key, "");
        return;
      }

      // ❌ other sections: skip null
      if (value === null || value === undefined) return;

      if (key === "footDeformities" || key === "hasAmputation") {
        formDataObj.append(key, value);
        return;
      }

      if (value instanceof File) {
        formDataObj.append(key, value);
      } else if (typeof value === "boolean") {
        formDataObj.append(key, value.toString());
      } else {
        formDataObj.append(key, String(value));
      }
    });

    const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || {})
    formDataObj.append("doctor_id", currentUser?.id || "")
    formDataObj.append("doctor_email", currentUser?.email || "unknown@doctor.com")

    if (isEditMode && patientId) {
      formDataObj.append("id", patientId)
    }

    console.log(`FormData Entries for Step ${step}:`)
    for (const [key, value] of formDataObj.entries()) {
      console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value)
    }

    return formDataObj
  }


  //   const prepareFormDataForAPI = (step, status) => {
  //   const formDataObj = new FormData();
  //   const section = `section${step}`;
  //   const validFields = Object.keys(initialFormState[section]);

  //   if (status) {
  //     formDataObj.append("status", status);
  //   }

  //   Object.entries(formData[section]).forEach(([key, value]) => {

  //     if (!validFields.includes(key)) return;

  //     if (key.endsWith("Preview")) return;

  //     if (value === null || value === undefined) {
  //       formDataObj.append(key, "");
  //       return;
  //     }

  //     if (isRadioField(key)) {
  //       if (value === "yes") formDataObj.append(key, "1");
  //       else if (value === "no") formDataObj.append(key, "0");
  //       else formDataObj.append(key, ""); // not_tested
  //       return;
  //     }

  //     if (value instanceof File) {
  //       formDataObj.append(key, value);
  //     } else {
  //       formDataObj.append(key, String(value));
  //     }
  //   });

  //   const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  //   formDataObj.append("doctor_id", currentUser?.id || "");
  //   formDataObj.append("doctor_email", currentUser?.email || "");

  //   if (isEditMode && patientId) {
  //     formDataObj.append("id", patientId);
  //   }

  //   return formDataObj;
  // };


  // Submit step 1 data
  const submitStep1 = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields")
      }

      console.log("Submitting Step 1 data for patient ID:", patientId)
      const nextStatus = currentStatus === "Completed" ? "Completed" : "In Progress";
      const formDataToSubmit = prepareFormDataForAPI(1, nextStatus)
      const url =
        isEditMode && patientId
          ? `${API_BASE_URL}/patient/updatestep1/${patientId}`
          : `${API_BASE_URL}/patient/step1`
      const response = await fetch(url, {
        method: "POST",
        body: formDataToSubmit,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log("Step 1 API Response:", data)
      const newPatientId = data.id || data.patientId || data.data?.id
      if (!newPatientId && !isEditMode) {
        throw new Error("Server didn't return a patient ID.")
      }

      if (!isEditMode) {
        setPatientId(newPatientId)
      }
      toast.success("Step 1 data saved successfully!")
      return newPatientId
    } catch (error) {
      console.error("Error submitting step 1:", error)
      toast.error(error.message || "Failed to save step 1 data")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Submit step 2 data
  const submitStep2 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error('Please fill all required fields');
      }

      console.log(`Submitting Step 2 data for patient ID: ${id}`);
      const nextStatus = currentStatus === "Completed" ? "Completed" : "Partial";
      const formDataToSubmit = prepareFormDataForAPI(2, nextStatus)
      const response = await fetch(`${API_BASE_URL}/patient/step2/${id}`, {
        method: 'POST',
        body: formDataToSubmit,
      });

      const data = await response.json();
      console.log('Step 2 API Response:', data);

      if (!response.ok) {
        const serverErrors = data.errors || {};
        const errorMessage = data.message || 'Failed to save Step 2 data';
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
        });
        setErrors(formattedErrors);
        console.log('Server validation errors:', formattedErrors);
        throw new Error(`Validation failed: ${errorMessage}`);
      }

      toast.success('Step 2 data saved successfully!');
      return true;
    } catch (error) {
      console.error('Error submitting step 2:', error);
      toast.error(error.message || 'Failed to save step 2 data. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Submit step 3 data
  const submitStep3 = async (id) => {
    try {
      setIsSaving(true)
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields")
      }
      console.log("Submitting Step 3 data for patient ID:", id)
      const formDataToSubmit = prepareFormDataForAPI(3, "Completed")
      const response = await fetch(`${API_BASE_URL}/patient/step3/${id}`, {
        method: "POST",
        body: formDataToSubmit,
      });

      const data = await response.json()
      console.log("Step 3 API Response:", data)

      if (!response.ok) {
        const serverErrors = data.errors || {}
        const formattedErrors = {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages
        })
        setErrors(formattedErrors)
        throw new Error(`Validation failed: ${data.message || "Please check all fields"}`)
      }

      toast.success("Step 3 data saved successfully!")
      setCurrentStatus("Completed")
      return true
    } catch (error) {
      console.error("Error submitting step 3:", error)
      toast.error(error.message || "Failed to save step 3 data")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Handle next step
  const nextStep = () => {
    const isValid = validateCurrentStep()
    if (!isValid) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`)
        if (errorElement) errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setStep((prev) => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle previous step
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isValid = validateCurrentStep();
      if (!isValid) {
        toast.error("Please fill all required fields");
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      let patientIdToUse = patientId;

      if (!isEditMode) {
        if (!patientIdToUse) {
          patientIdToUse = await submitStep1();
          setPatientId(patientIdToUse);
        }

        await submitStep2(patientIdToUse);
        await submitStep3(patientIdToUse);
      } else {
        if (Object.keys(editedFields.section1).length > 0) await submitStep1();
        if (Object.keys(editedFields.section2).length > 0) await submitStep2(patientIdToUse);
        if (Object.keys(editedFields.section3).length > 0) await submitStep3(patientIdToUse);
      }

      localStorage.removeItem("stepFormData");
      setEditedFields({ section1: {}, section2: {}, section3: {} });

      navigate("/user/rssdi-save-the-feet-2.0", {
        state: {
          showToast: true,
          toastMessage: isEditMode
            ? "Patient assessment updated successfully!"
            : "Patient assessment completed successfully!",
          refreshData: true,
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
    }))
    setUploadedFiles((prev) => [...prev, ...files])
  }

  // Handle file removal
  const handleRemoveFile = (index) => {
    const fileToRemove = uploadedFiles[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle consent form download
  const handleDownloadForm = async () => {
    try {
      const pdfPath = "/Consent_form_registry.pdf"
      const link = document.createElement("a")
      link.href = pdfPath
      link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      handleChange({ target: { name: "consentDownloaded", value: true } }, "section1")
    } catch (error) {
      console.error("Error downloading consent form:", error)
      toast.info("Failed to download consent form. Please contact support.")
    }
  }

  // Handle save for later
  const handleSaveForLater = async () => {
    setIsSaving(true)
    try {
      if (step === 1 && !patientId && Object.keys(editedFields.section1).length > 0) {
        const newPatientId = await submitStep1()
        setPatientId(newPatientId)
        setEditedFields((prev) => ({ ...prev, section1: {} }))
      } else if (step === 2 && patientId && Object.keys(editedFields.section2).length > 0) {
        await submitStep2(patientId)
        setEditedFields((prev) => ({ ...prev, section2: {} }))
      } else if (step === 3 && patientId && Object.keys(editedFields.section3).length > 0) {
        await submitStep3(patientId)
        setEditedFields((prev) => ({ ...prev, section3: {} }))
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData))
      if (formDataForStorage.section1.consentForm) {
        formDataForStorage.section1.consentForm = null
        formDataForStorage.section1.consentFormPreview = null
      }
      if (formDataForStorage.section2.necrosisPhoto) {
        formDataForStorage.section2.necrosisPhoto = null
        formDataForStorage.section2.necrosisPhotoPreview = null
      }
      if (formDataForStorage.section2.woundReferenceFile) {
        formDataForStorage.section2.woundReferenceFile = null
      }

      toast.success("Progress saved successfully!")
      setShowUploadPopup(false)
      navigate("/user/rssdi-save-the-feet-2.0")
    } catch (error) {
      console.error("Error saving for later:", error)
      toast.error(error.message || "Failed to save progress. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle upload complete
  const handleUploadComplete = () => {
    localStorage.removeItem("stepFormData")
    setShowUploadPopup(false)
    navigate("/user/rssdi-save-the-feet-2.0")
  }

  // Handle save
  const handleSave = async () => {
    if (validateCurrentStep()) {
      setIsSaving(true)
      try {
        if (step === 1 && !patientId && Object.keys(editedFields.section1).length > 0) {
          const newPatientId = await submitStep1()
          setPatientId(newPatientId)
          setEditedFields((prev) => ({ ...prev, section1: {} }))
        } else if (step === 2 && patientId && Object.keys(editedFields.section2).length > 0) {
          await submitStep2(patientId)
          setEditedFields((prev) => ({ ...prev, section2: {} }))
        } else if (step === 3 && patientId && Object.keys(editedFields.section3).length > 0) {
          await submitStep3(patientId)
          setEditedFields((prev) => ({ ...prev, section3: {} }))
        }

        const formDataForStorage = JSON.parse(JSON.stringify(formData))
        if (formDataForStorage.section1.consentForm) {
          formDataForStorage.section1.consentForm = null
          formDataForStorage.section1.consentFormPreview = null
        }
        if (formDataForStorage.section2.necrosisPhoto) {
          formDataForStorage.section2.necrosisPhoto = null
          formDataForStorage.section2.necrosisPhotoPreview = null
        }
        if (formDataForStorage.section2.woundReferenceFile) {
          formDataForStorage.section2.woundReferenceFile = null
        }

        setShowSuccess({
          visible: true,
          type: "save",
          showSubmitOption: false,
          message: "Progress saved successfully!",
        })
        setTimeout(() => {
          setShowSuccess((prev) => ({ ...prev, visible: false }))
        }, 2000)
      } catch (error) {
        console.error("Error saving progress:", error)
        toast.error(error.message || "Failed to save progress. Please try again.")
      } finally {
        setIsSaving(false)
      }
    } else {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    console.log(`handleSaveAndContinue called for step ${step}`);

    const isValid = validateCurrentStep();
    if (!isValid) {
      console.log('Validation failed. Errors:', errors);
      const firstError = Object.keys(errors)[0];
      const newErrors = {};

      if (!formData.section1.consentVerified) {
        newErrors.consentVerified = "You must verify the consent to proceed.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);

        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast.error('Please fill all required fields');
      }
      return;
    }

    setIsSaving(true);
    try {
      let newPatientId = patientId;

      if (step === 1) {
        if (!newPatientId && Object.keys(editedFields.section1).length > 0) {
          newPatientId = await submitStep1();
          setPatientId(newPatientId);
          setEditedFields((prev) => ({ ...prev, section1: {} }));
        } else if (isEditMode && Object.keys(editedFields.section1).length > 0) {
          await submitStep1();
          setEditedFields((prev) => ({ ...prev, section1: {} }));
        }
      } else if (step === 2 && newPatientId && Object.keys(editedFields.section2).length > 0) {
        console.log(`Submitting Step 2 with patientId: ${newPatientId}`);
        await submitStep2(newPatientId);
        setEditedFields((prev) => ({ ...prev, section2: {} }));
      } else if (step === 3 && newPatientId && Object.keys(editedFields.section3).length > 0) {
        console.log(`Submitting Step 3 with patientId: ${newPatientId}`);
        await submitStep3(newPatientId);
        setEditedFields((prev) => ({ ...prev, section3: {} }));
      } else {
        console.log(`No changes to submit for step ${step} or missing patientId`);
      }

      if (step < 3) {
        setStep((prev) => Math.min(prev + 1, 3));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Progress saved successfully!');
      }
    } catch (error) {
      console.error('Error saving and continuing:', error);
      toast.error(error.message || 'Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  // Clean up form data
  const cleanUpFormData = (data) => {
    if (data.section1.consentForm) {
      data.section1.consentForm = null
      data.section1.consentFormPreview = null
    }
    if (data.section2.necrosisPhoto) {
      data.section2.necrosisPhoto = null
      data.section2.necrosisPhotoPreview = null
    }
    if (data.section2.woundReferenceFile) {
      data.section2.woundReferenceFile = null
    }
  }

  // Handle add new
  const handleAddNew = () => {
    navigate("/user/rssdi-save-the-feet-2.0")
  }

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (stepNumber > step) {
      if (!validateCurrentStep()) {
        toast.error("Please complete the current step before moving forward.")
        return
      }
    }
    setStep(stepNumber)
  }

  // Render step
  const renderStep = () => {
    const stepProps = { formData, handleChange, errors, setErrors }
    switch (step) {
      case 1:
        return <StepForm1 {...stepProps} />
      case 2:
        return <StepForm2 {...stepProps} />
      case 3:
        return <StepForm3 {...stepProps} />
      default:
        return null
    }
  }

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
  }

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
                  aria-label={isEditMode ? "Update form" : "Submit form"}
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{isEditMode ? "Update Form" : "Submit Form"}</span>
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
          showEditOption={showSuccess.showEditOption}
          message={showSuccess.message}
          onContinueToSubmit={() => {
            setShowSuccess({ ...showSuccess, visible: false })
            const event = { preventDefault: () => { } }
            handleSubmit(event)
          }}
          onEdit={() => {
            setShowSuccess({ ...showSuccess, visible: false })
            setIsEditMode(true)
            setStep(1)
          }}
          onReturnToDashboard={() => {
            setShowSuccess({ ...showSuccess, visible: false })
            navigate("/user/rssdi-save-the-feet-2.0", {
              state: {
                showToast: true,
                toastMessage: `Patient assessment ${isEditMode ? "updated" : "completed"}`,
              },
              replace: true,
            })
          }}
        />
      </div>
    </FormLayout>
  )
}

export default StepForm