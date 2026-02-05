"use client"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiGet } from "../../services/api-helper"
import { toast } from "react-toastify"
import AdminLayout from "../../layouts/AdminLayout"
import "./PatientDetailsPage.css"
import { IMAGE_BASE_URL } from "../../config/api"
import { FaDownload, FaUser, FaCalendar, FaMapMarkerAlt } from "react-icons/fa"
import * as XLSX from "xlsx"
import { Tooltip } from "antd";



const PatientDetailsPage = () => {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("basic")

    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    // Initial form state structure

    const initialFormState = {
        section1: {
            patient_name: "",
            consentForm: "",
            consentFormPreview: "",
            consentDownloaded: "",
            consentUploaded: "no",
            consentVerified: "no",
            locality: "",
            villageOrCity: "",
            state: "",
            pincode: "",
            treatmentType: "",
            facilityEmail: "",
            age: "",
            gender: "",
            facilityName: "",
            facilityLocation: "",
            facilityState: "",
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
            // ulcerDuration: "",
            hasAmputation: "",
            // amputationDuration: "",
            hasAngioplasty: "",
            // angioplastyDuration: "",
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
            cultureReportPreview: "",
            woundSize: "",
            woundDuration: "",
            other_treatment: "",
            other_treatment_details: "",
            dressingMaterial: "",
            offloadingDevice: "",
            amputation: "",
            // amputationType: "",
            amputationLevel: "",
            antibioticsGiven: "",
            surgicalProcedure: "",
            surgicalProcedureOther: "",
            woundReferenceFile: "",
            woundReferenceFilePreview: "",
            woundReferenceConsent: "",
            cultureReportAvailable: "",
            arterialReport: "",
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
            // deformityDuration: "",
            hairLoss: "",
            pulsesPalpable: "",
            skinTemperature: "",
        },
    }
    const [followUp, setFollowUp] = useState({
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
        activeUlcer: "",
    })


    // Function to determine if a field is a radio/boolean field
    const isRadioField = (field) => {
        const radioFields = [
            "consentDownloaded",
            "consentUploaded",
            "consentVerified",
            "hasUlcer",
            "hasAmputation",
            "hasAngioplasty",
            "renal",
            "retinal",
            "cardiovascular",
            "cerebrovascular",
            "hypertension",
            "limbIschemia",
            "heartFailure",
            "necrosis",
            "gangrene",
            "probetobone",
            "osteomyelitis",
            "sepsis",
            "arterialStenosis",
            "infection",
            "swelling",
            "erythema",
            "tenderness",
            "warmth",
            "burningSensation",
            "painWhileWalking",
            "skinChanges",
            "sensationLoss",
            "nailProblems",
            "fungalInfection",
            "skinLesions",
            "openCrack",
            "monofilamentLeftA",
            "monofilamentLeftB",
            "monofilamentLeftC",
            "monofilamentRightA",
            "monofilamentRightB",
            "monofilamentRightC",
            "footDeformities",
            "hairLoss",
            "pulsesPalpable",
        ]
        return radioFields.includes(field)
    }

    // Convert flat API data to nested structure
    const mapFlatToNested = (flatData) => {
        console.log("mapFlatToNested: Starting mapping with Flat API Data:", flatData)
        const nestedData = JSON.parse(JSON.stringify(initialFormState))

        const fieldMappings = {
            section1: {
                patient_name: ["patient_name", "name"],
                hasUlcer: ["hasUlcer", "has_ulcer"],
                hasAmputation: ["hasAmputation", "has_amputation"],
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
            },
            section2: {
                necrosis: ["necrosis"],
                gangrene: ["gangrene"],
                probetobone: ["probetobone", "bone_exposure"],
                osteomyelitis: ["osteomyelitis"],
                sepsis: ["sepsis"],
                arterialStenosis: ["arterialStenosis", "arterial_issues"],
                infection: ["infection"],
                swelling: ["swelling"],
                erythema: ["erythema"],
                tenderness: ["tenderness"],
                warmth: ["warmth"],
                arterialReport: ["arterialReport", "arterial_report"],
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
                testType: ["testType", "test_type"],
                // Enhanced monofilament mappings with more variations
                monofilamentLeftA: ["monofilamentLeftA", "monofilament_left_a", "monofilament_left_A", "left_a", "leftA"],
                monofilamentLeftB: ["monofilamentLeftB", "monofilament_left_b", "monofilament_left_B", "left_b", "leftB"],
                monofilamentLeftC: ["monofilamentLeftC", "monofilament_left_c", "monofilament_left_C", "left_c", "leftC"],
                monofilamentRightA: ["monofilamentRightA", "monofilament_right_a", "monofilament_right_A", "right_a", "rightA"],
                monofilamentRightB: ["monofilamentRightB", "monofilament_right_b", "monofilament_right_B", "right_b", "rightB"],
                monofilamentRightC: ["monofilamentRightC", "monofilament_right_c", "monofilament_right_C", "right_c", "rightC"],
                tuningForkRightMedialMalleolus: ["tuningForkRightMedialMalleolus", "tuning_fork_right_medial_malleolus"],
                tuningForkRightLateralMalleolus: ["tuningForkRightLateralMalleolus", "tuning_fork_right_lateral_malleolus"],
                tuningForkRightBigToe: ["tuningForkRightBigToe", "tuning_fork_right_big_toe"],
                tuningForkLeftMedialMalleolus: ["tuningForkLeftMedialMalleolus", "tuning_fork_left_medial_malleolus"],
                tuningForkLeftLateralMalleolus: ["tuningForkLeftLateralMalleolus", "tuning_fork_left_lateral_malleolus"],
                tuningForkLeftBigToe: ["tuningForkLeftBigToe", "tuning_fork_left_big_toe"],
                footDeformities: ["footDeformities", "foot_deformities"],
                // deformityDuration: ["deformityDuration", "deformity_duration"],
                hairLoss: ["hairLoss", "hair_growth"],
                pulsesPalpable: ["pulsesPalpable", "pulses_palpable"],
                skinTemperature: ["skinTemperature", "skin_temperature"],
            },
        }

        Object.keys(nestedData).forEach((section) => {
            Object.keys(nestedData[section]).forEach((field) => {
                if (field.endsWith("Preview")) return
                const isBooleanField = isRadioField(field)
                let value = undefined // Initialize value to undefined

                if (fieldMappings[section]?.[field]) {
                    for (const variant of fieldMappings[section][field]) {
                        if (flatData[variant] !== undefined) {
                            value = flatData[variant]
                            // console.log(`mapFlatToNested: Found mapping for ${section}.${field} as ${variant}: ${value}`)
                            break
                        }
                    }
                } else {
                    // If no specific mapping, try direct field name
                    if (flatData[field] !== undefined) {
                        value = flatData[field]
                        // console.log(`mapFlatToNested: Found direct field ${section}.${field}: ${value}`)
                    }
                }

                if (value !== undefined) {
                    if (isBooleanField) {
                        nestedData[section][field] = convertToYesNo(value)
                    } else {
                        nestedData[section][field] = value !== null ? String(value) : ""
                    }
                } else {
                    console.log(`mapFlatToNested: Field ${section}.${field} not found in flatData. Keeping initial state value.`)
                }
            })
        })

        console.log("mapFlatToNested: Mapped Nested Data:", nestedData)
        return nestedData
    }

    // Convert boolean-like values to "yes" or "no"
    const convertToYesNo = (value) => {
        if (value === true || value === 1 || value === "1" || value === "yes" || value === "Yes" || value === "YES")
            return "yes"
        if (value === false || value === 0 || value === "0" || value === "no" || value === "No" || value === "NO")
            return "no"
        if (value === null || value === undefined || value === "") return ""
        return String(value) // Return the actual value if it's not yes/no
    }

    const downloadPatientDetails = () => {
        if (!patient) {
            toast.error("No patient data to download.")
            return
        }

        console.log("downloadPatientDetails: Patient object before Excel generation:", JSON.stringify(patient, null, 2))

        try {
            const workbook = XLSX.utils.book_new()
            const allData = [["Section", "Field", "Value"]] // Header row for the single sheet

            // Helper function to safely get value
            const getValue = (value) => {
                if (value === null || value === undefined || value === "") return "N/A"
                return String(value)
            }

            // Function to add section data to the allData array
            const addSectionData = (sectionName, sectionData, initialSectionState) => {
                const safeSectionData = sectionData || {}
                for (const fieldKey in initialSectionState) {
                    if (Object.prototype.hasOwnProperty.call(initialSectionState, fieldKey) && !fieldKey.endsWith("Preview")) {
                        const displayField = fieldKey
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase()) // Convert camelCase to Title Case
                        const value = getValue(safeSectionData?.[fieldKey])
                        allData.push([sectionName, displayField, value])
                    }
                }
            }

            // Add data for each patient section
            addSectionData("Section 1 - Personal & Medical", patient.section1, initialFormState.section1)
            addSectionData("Section 2 - Ulcer Assessment", patient.section2, initialFormState.section2)
            addSectionData("Section 3 - Foot Examination", patient.section3, initialFormState.section3)

            // ✅ Add Follow-Up data
            addSectionData("Section 4 - Follow Up", followUp, {
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
                activeUlcer: "",
            })

            // Create a single worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(allData)

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Patient Data")

            // Style the header
            const headerStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EEEEEE" } },
            }
            if (worksheet["A1"]) worksheet["A1"].s = headerStyle
            if (worksheet["B1"]) worksheet["B1"].s = headerStyle
            if (worksheet["C1"]) worksheet["C1"].s = headerStyle

            // Auto-size columns
            const range = XLSX.utils.decode_range(worksheet["!ref"])
            const wscols = []
            for (let C = range.s.c; C <= range.e.c; ++C) {
                let maxWidth = 10
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
                    const cell = worksheet[cellAddress]
                    if (cell && cell.v) {
                        const cellLength = cell.v.toString().length
                        if (cellLength > maxWidth) {
                            maxWidth = cellLength
                        }
                    }
                }
                wscols.push({ wch: Math.min(maxWidth + 2, 50) })
            }
            worksheet["!cols"] = wscols

            // Generate filename
            const patientName = patient.section1?.patient_name?.replace(/\s+/g, "_") || "Unknown"
            const currentDate = new Date().toISOString().split("T")[0]
            const filename = `Patient_${patientName}_ID_${patientId}_AllData_${currentDate}.xlsx`

            // Write and download the file
            XLSX.writeFile(workbook, filename)

            toast.success("Complete patient details (with follow-up) downloaded successfully!")
        } catch (error) {
            console.error("Error creating Excel file:", error)
            toast.error("Failed to download patient details. Please try again.")
        }
    }


    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                setLoading(true)
                setError(null)
                console.log(`Fetching patient details from: /patient/${patientId}`)
                const response = await apiGet(`/patient/${patientId}`)

                console.log(response?.patient?.follow_up?.survival_status);

                setFollowUp(prev => ({
                    survivalStatus: response?.patient?.follow_up?.survival_status || "",
                    woundHealed: response?.patient?.follow_up?.has_wound_healed || "",
                    healingTime: response?.patient?.follow_up?.time_of_healing_days || "",
                    nonHealingReason: response?.patient?.follow_up?.reason_for_non_healing || "",
                    surgicalIntervention: response?.patient?.follow_up?.surgical_intervention || "",
                    amputationPerformed: response?.patient?.follow_up?.amputation_performed || "",
                    hospitalVisits: response?.patient?.follow_up?.number_of_hospital_visits || "0",
                    hospitalized: response?.patient?.follow_up?.was_hospitalized || "",
                    hospitalStayLength: response?.patient?.follow_up?.length_of_hospital_stay_days || "0",
                    deathDate: response?.patient?.follow_up?.date_of_death || "",
                    deathReason: response?.patient?.follow_up?.reason_for_death || "",
                    activeUlcer: response?.patient?.follow_up?.active_ulcer || "",
                }));

                console.log("API Response:", response)
                console.log("API Response:", response?.patient?.facilityState)

                if (!response) {
                    throw new Error("Empty response from server")
                }

                const patientData = response.data || response.patient || response
                if (!patientData) {
                    throw new Error("Patient data not found in response")
                }

                const nestedData = mapFlatToNested(patientData)
                console.log("Monofilament Test Debug (from nestedData):", {
                    leftA: nestedData.section3?.monofilamentLeftA,
                    leftB: nestedData.section3?.monofilamentLeftB,
                    leftC: nestedData.section3?.monofilamentLeftC,
                    rightA: nestedData.section3?.monofilamentRightA,
                    rightB: nestedData.section3?.monofilamentRightB,
                    rightC: nestedData.section3?.monofilamentRightC,
                })
                console.log(
                    "Raw API fields containing 'mono':",
                    Object.keys(patientData).filter((key) => key.toLowerCase().includes("mono")),
                )
                setPatient(nestedData)
            } catch (err) {
                console.error("Fetch error:", err)
                setError(err.message || "Failed to fetch patient details")
                toast.error(`Error: ${err.message || "Failed to fetch patient details"}`)
            } finally {
                setLoading(false)
            }
        }

        if (patientId) {
            fetchPatientDetails()
        } else {
            setError("Missing patient ID")
            setLoading(false)
            toast.error("Invalid patient ID")
        }
    }, [patientId])


    const renderStatusBadge = (value) => {
        console.log("Rendering badge for value:", value) // Debug log
        if (!value || value === "N/A" || value === "" || value === null || value === undefined) {
            return <span className="status-badge neutral">Not available</span>
        }
        if (value === "yes" || value === "Yes" || value === "YES") {
            return <span className="status-badge positive">Yes</span>
        } else if (value === "no" || value === "No" || value === "NO") {
            return <span className="status-badge negative">No</span>
        } else {
            return <span className="status-badge neutral">{value}</span>
        }
    }


    // Function to render value with fallback
    // const renderValue = (value) => {
    //     // console.log("facility", value, patient.section1?.facilityState)
    //     return value || <span className="text-gray-400">Not available</span>
    // }

    const renderValue = (value) => {
        // console.log("facility", value, patient.section1?.facilityState)
        if (!value || value === "N/A" || value === "" || value === null || value === undefined) {
            return <span className="status-badge neutral">Not available</span>
        }
        if (value === "yes" || value === "Yes" || value === "YES") {
            return <span className="status-badge positive">Yes</span>
        } else if (value === "no" || value === "No" || value === "NO") {
            return <span className="status-badge negative">No</span>
        } else {
            return <span className="status-badge neutral">{value}</span>
        }
    }

    // Render patient data with all sections
    const renderPatientData = () => {
        if (!patient) return null

        return (
            <div className="patient-details-container">
                {/* Enhanced Header with patient summary and download option */}
                <div className="patient-details-header">
                    <Tooltip title="Back To Foot Exam" >
                        <button onClick={() => navigate(-1)} className="back-button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="back-icon"
                            >
                                <path d="M19 12H5"></path>
                                <path d="M12 19l-7-7 7-7"></path>
                            </svg>
                            Back to Patient List
                        </button>
                    </Tooltip>
                    <div className="patient-actions">
                        <button onClick={downloadPatientDetails} className="download-patient-btn" >
                            <FaDownload />
                            <span>Download {patient.section1?.patient_name} Details</span>
                        </button>
                    </div>
                </div>
                <div className="patient-header">
                    <div className="patient-header-left">
                        <div className="patient-avatar">
                            <FaUser />
                        </div>
                        <div className="patient-header-info">
                            <h1>{patient.section1?.patient_name || "Unnamed Patient"}</h1>
                            <div className="patient-meta">
                                <div className="meta-item">
                                    <FaCalendar className="meta-icon" />
                                    <span>{patient.section1?.age || "N/A"} years, {patient.section1?.gender || "N/A"}</span>
                                </div>
                                <div className="meta-item">
                                    <FaMapMarkerAlt className="meta-icon" />
                                    <span>{patient.section1?.locality || "N/A"}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">#</span>
                                    <span>ID: {patientId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="patient-header-right">
                        {/* <div className="patient-actions">
                            <button onClick={downloadPatientDetails} className="download-patient-btn" title="Download Patient Details">
                                <FaDownload />
                                <span>Download {patient.section1?.patient_name} Details</span>
                            </button>
                        </div> */}
                        <div className="patient-quick-stats">
                            <div className="stat-card">
                                <div className="stat-value">{patient.section1?.diabetesType || "N/A"}</div>
                                <div className="stat-label">Diabetes Type</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{patient.section1?.diabetesDuration || "N/A"}</div>
                                <div className="stat-label">Duration</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{patient.section1?.hba1c || "N/A"}</div>
                                <div className="stat-label">HbA1c</div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Enhanced Navigation tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button className={`tab ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>
                            <div className="tab-icon">
                                <FaUser />
                            </div>
                            Basic Information
                        </button>
                        <button
                            className={`tab ${activeTab === "medical" ? "active" : ""}`}
                            onClick={() => setActiveTab("medical")}
                        >
                            <div className="tab-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            Medical History
                        </button>
                        <button className={`tab ${activeTab === "ulcer" ? "active" : ""}`} onClick={() => setActiveTab("ulcer")}>
                            <div className="tab-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                                    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                                    <circle cx="20" cy="8" r="2" />
                                </svg>
                            </div>
                            Ulcer & Treatment
                        </button>
                        <button className={`tab ${activeTab === "foot" ? "active" : ""}`} onClick={() => setActiveTab("foot")}>
                            <div className="tab-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 20v-8a4 4 0 0 0-4-4H6" />
                                    <path d="M10 6H6a4 4 0 0 0-4 4v8" />
                                    <path d="M2 14h20" />
                                </svg>
                            </div>
                            Foot Examination
                        </button>
                        <button className={`tab ${activeTab === "Followup" ? "active" : ""}`} onClick={() => setActiveTab("Followup")}>
                            <div className="tab-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 20v-8a4 4 0 0 0-4-4H6" />
                                    <path d="M10 6H6a4 4 0 0 0-4 4v8" />
                                    <path d="M2 14h20" />
                                </svg>
                            </div>
                            Follow  Up Information
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="tab-content">
                    {/* Basic Information Tab */}
                    {activeTab === "basic" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Personal Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Age</div>
                                            <div className="info-value">{renderValue(patient.section1?.age)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gender</div>
                                            <div className="info-value">{renderValue(patient.section1?.gender)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Locality</div>
                                            <div className="info-value">{renderValue(patient.section1?.locality)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Village/City</div>
                                            <div className="info-value">{renderValue(patient.section1?.villageOrCity)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">State</div>
                                            <div className="info-value">{renderValue(patient.section1?.state)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Pincode</div>
                                            <div className="info-value">{renderValue(patient.section1?.pincode)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Education</div>
                                            <div className="info-value">{renderValue(patient.section1?.education)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Occupation</div>
                                            <div className="info-value">{renderValue(patient.section1?.occupation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Marital Status</div>
                                            <div className="info-value">{renderValue(patient.section1?.maritalStatus)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Socio-Demographic Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">SES Rating</div>
                                            <div className="info-value">{renderValue(patient.section1?.sesRating)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Family Members</div>
                                            <div className="info-value">{renderValue(patient.section1?.familyMembers)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Dependents</div>
                                            <div className="info-value">{renderValue(patient.section1?.dependents)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Health Facility Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Treatment Type</div>
                                            <div className="info-value">{renderValue(patient.section1?.treatmentType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Name</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityName)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Location</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityLocation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility State</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityState)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Type</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Email</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityEmail)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Consent Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Consent Downloaded</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentDownloaded)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Consent Uploaded</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentUploaded)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Consent Verified</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentVerified)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Consent Form</div>
                                            <div className="info-value">
                                                {patient.section1?.consentForm ? (
                                                    <a
                                                        href={`${IMAGE_BASE_URL}${patient.section1?.consentForm}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        <FaDownload /> Download
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medical History Tab */}
                    {activeTab === "medical" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Diabetes Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Diabetes Type</div>
                                            <div className="info-value">{renderValue(patient.section1?.diabetesType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Diabetes Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.diabetesDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Has Ulcer</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasUlcer)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Ulcer Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.ulcerDuration)}</div>
                                        </div> */}
                                        <div className="info-row">
                                            <div className="info-label">Has Amputation</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasAmputation)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Amputation Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.amputationDuration)}</div>
                                        </div> */}
                                        <div className="info-row">
                                            <div className="info-label">Has Angioplasty</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasAngioplasty)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Angioplasty Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.angioplastyDuration)}</div>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Lifestyle Factors</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Smoking</div>
                                            <div className="info-value">{renderValue(patient.section1?.smoking)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Alcohol</div>
                                            <div className="info-value">{renderValue(patient.section1?.alcohol)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Tobacco</div>
                                            <div className="info-value">{renderValue(patient.section1?.tobacco)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wear Shoes</div>
                                            <div className="info-value">{renderValue(patient.section1?.wearFootWear)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wear Slippers</div>
                                            <div className="info-value">{renderValue(patient.section1?.regularfootExamination)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Walk On Sand</div>
                                            <div className="info-value">{renderValue(patient.section1?.walkOnSand)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wash Feet</div>
                                            <div className="info-value">{renderValue(patient.section1?.washFeet)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Other Diabetic Complications / Comorbidities</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Renal</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.renal)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Renal Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.renalDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Retinal</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.retinal)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Retinal Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.retinalDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cardiovascular</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.cardiovascular)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cardiovascular Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.cardiovascularDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cerebrovascular</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.cerebrovascular)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cerebrovascular Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.cerebrovascularDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Limb Ischemia</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.limbIschemia)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Limb Ischemia Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.limbIschemiaDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Hypertension</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hypertension)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Hypertension Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.hypertensionDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Heart Failure</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.heartFailure)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Heart Failure Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.heartFailureDuration)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Biochemical Investigation (Recent Report)</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Fasting Glucose</div>
                                            <div className="info-value">{renderValue(patient.section1?.fastingGlucose)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Post-Prandial Glucose</div>
                                            <div className="info-value">{renderValue(patient.section1?.postPrandialGlucose)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">HbA1c</div>
                                            <div className="info-value">{renderValue(patient.section1?.hba1c)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Total Cholesterol</div>
                                            <div className="info-value">{renderValue(patient.section1?.totalCholesterol)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Triglycerides</div>
                                            <div className="info-value">{renderValue(patient.section1?.triglycerides)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">HDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.hdl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">LDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.ldl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">VLDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.vldl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Serum Creatinine</div>
                                            <div className="info-value">{renderValue(patient.section1?.serumCreatinine)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ulcer & Treatment Tab */}
                    {activeTab === "ulcer" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Assessment Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">First Assessment</div>
                                            <div className="info-value">{renderValue(patient.section2?.Assessment)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Wound Location</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Leg</div>
                                            <div className="info-value">{renderValue(patient.section2?.leg)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Foot</div>
                                            <div className="info-value">{renderValue(patient.section2?.foot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right Foot - Forefoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.rightFoot_forefoot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right Foot - Hindfoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.rightFoot_hindfoot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right Foot - Midfoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.rightFoot_midfoot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Foot - Forefoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.leftFoot_forefoot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Foot - Hindfoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.leftFoot_hindfoot)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Foot - Midfoot</div>
                                            <div className="info-value">{renderValue(patient.section2?.leftFoot_midfoot)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Wound Conditions</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Necrosis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.necrosis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Purulent Discharge</div>
                                            <div className="info-value">{renderValue(patient.section2?.purulentDischarge)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gangrene</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.gangrene)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gangrene Type</div>
                                            <div className="info-value">{renderValue(patient.section2?.gangreneType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Probe to Bone</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.probetobone)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Osteomyelitis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.osteomyelitis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Sepsis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.sepsis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Arterial Issues</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.arterialStenosis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Infection</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.infection)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Swelling</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.swelling)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Erythema</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.erythema)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Tenderness</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.tenderness)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Warmth</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.warmth)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Wound Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Wound Size</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundSize)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wound Duration</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Culture Report Available</div>
                                            <div className="info-value">{renderValue(patient.section2?.cultureReportAvailable)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Culture Report</div>
                                            <div className="info-value">
                                                {patient.section2?.cultureReport ? (
                                                    <a
                                                        href={`${IMAGE_BASE_URL}${patient.section2?.cultureReport}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        <FaDownload /> Download
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Arterial Report</div>
                                            <div className="info-value">
                                                {patient.section2?.arterialReport ? (
                                                    <a
                                                        href={`${IMAGE_BASE_URL}${patient.section2?.arterialReport}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        <FaDownload /> Download
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wound Reference File</div>
                                            <div className="info-value">
                                                {patient.section2?.woundReferenceFile ? (
                                                    <a
                                                        href={`${IMAGE_BASE_URL}${patient.section2?.woundReferenceFile}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        <FaDownload /> Download
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Treatment Details</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">SOC Given</div>
                                            <div className="info-value">{renderValue(patient.section2?.other_treatment)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">SOC Details</div>
                                            <div className="info-value">{renderValue(patient.section2?.other_treatment_details)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Dressing Material</div>
                                            <div className="info-value">{renderValue(patient.section2?.dressingMaterial)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Offloading Device</div>
                                            <div className="info-value">{renderValue(patient.section2?.offloadingDevice)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Amputation</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputation)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Amputation Type</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputationType)}</div>
                                        </div> */}
                                        <div className="info-row">
                                            <div className="info-label">Amputation Level</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputationLevel)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Antibiotics Given</div>
                                            <div className="info-value">{renderValue(patient.section2?.antibioticsGiven)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Surgical Procedure</div>
                                            <div className="info-value">
                                                {patient.section2?.surgicalProcedure === "other"
                                                    ? renderValue(patient.section2?.surgicalProcedureOther)
                                                    : renderValue(patient.section2?.surgicalProcedure)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Foot Examination Tab */}
                    {activeTab === "foot" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Symptoms</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Burning Sensation</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.burningSensation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Pain While Walking</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.painWhileWalking)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Skin Changes</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.skinChanges)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Sensation Loss</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.sensationLoss)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Nail Problems</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.nailProblems)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Fungal Infection</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.fungalInfection)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Skin Lesions</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.skinLesions)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Open Wound</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.openCrack)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Foot Conditions</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Foot Deformities</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.footDeformities)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Deformity Duration</div>
                                            <div className="info-value">{renderValue(patient.section3?.deformityDuration)}</div>
                                        </div> */}
                                        <div className="info-row">
                                            <div className="info-label">Hair Growth</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.hairLoss)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Pulses Palpable</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.pulsesPalpable)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Skin Temperature</div>
                                            <div className="info-value">{renderValue(patient.section3?.skinTemperature)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card enhanced-monofilament-card">
                                    <h3 className="card-title">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="test-icon">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        Monofilament Test Results
                                    </h3>
                                    <div className="card-content">
                                        <div className="test-type-row">
                                            <div className="info-label">Test Type</div>
                                            <div className="info-value test-type-value">{renderValue(patient.section3?.testType)}</div>
                                        </div>

                                        <div className="monofilament-grid">
                                            <div className="foot-section">
                                                <h4 className="foot-title">Left Foot</h4>
                                                <div className="test-results">
                                                    <div className="test-point">
                                                        <span className="point-label">Point A</span>
                                                        <div className="point-result">{renderStatusBadge(patient.section3?.monofilamentLeftA)}</div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Point B</span>
                                                        <div className="point-result">{renderStatusBadge(patient.section3?.monofilamentLeftB)}</div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Point C</span>
                                                        <div className="point-result">{renderStatusBadge(patient.section3?.monofilamentLeftC)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="foot-section">
                                                <h4 className="foot-title">Right Foot</h4>
                                                <div className="test-results">
                                                    <div className="test-point">
                                                        <span className="point-label">Point A</span>
                                                        <div className="point-result">
                                                            {renderStatusBadge(patient.section3?.monofilamentRightA)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Point B</span>
                                                        <div className="point-result">
                                                            {renderStatusBadge(patient.section3?.monofilamentRightB)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Point C</span>
                                                        <div className="point-result">
                                                            {renderStatusBadge(patient.section3?.monofilamentRightC)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card enhanced-tuning-fork-card">
                                    <h3 className="card-title">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="test-icon">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        Tuning Fork Test Results
                                    </h3>
                                    <div className="card-content">
                                        <div className="tuning-fork-grid">
                                            <div className="foot-section">
                                                <h4 className="foot-title">Right Foot</h4>
                                                <div className="test-results">
                                                    <div className="test-point">
                                                        <span className="point-label">Medial Malleolus</span>
                                                        <div className="point-result">
                                                            {renderValue(patient.section3?.tuningForkRightMedialMalleolus)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Lateral Malleolus</span>
                                                        <div className="point-result">
                                                            {renderValue(patient.section3?.tuningForkRightLateralMalleolus)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Big Toe</span>
                                                        <div className="point-result">{renderValue(patient.section3?.tuningForkRightBigToe)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="foot-section">
                                                <h4 className="foot-title">Left Foot</h4>
                                                <div className="test-results">
                                                    <div className="test-point">
                                                        <span className="point-label">Medial Malleolus</span>
                                                        <div className="point-result">
                                                            {renderValue(patient.section3?.tuningForkLeftMedialMalleolus)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Lateral Malleolus</span>
                                                        <div className="point-result">
                                                            {renderValue(patient.section3?.tuningForkLeftLateralMalleolus)}
                                                        </div>
                                                    </div>
                                                    <div className="test-point">
                                                        <span className="point-label">Big Toe</span>
                                                        <div className="point-result">{renderValue(patient.section3?.tuningForkLeftBigToe)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* followup inforamtion Tab */}
                    {activeTab === "Followup" && (

                        <div className="section-grid">
                            <div className="card">
                                <h3 className="card-title">Follow-up Summary</h3>
                                <div className="card-content">

                                    {loading && <div className="info-value">Loading follow-up data...</div>}
                                    {error && <div className="info-value red">{error}</div>}

                                    {!loading && !error && followUp && (
                                        <>

                                            <div className="info-row">
                                                <div className="info-label">Survival Status</div>
                                                <div className="info-value">{followUp.survivalStatus}</div>
                                            </div>

                                            {followUp.survivalStatus.toLowerCase() === "alive" && (
                                                <>
                                                    <div className="info-row">
                                                        <div className="info-label">Wound Healed</div>
                                                        <div className="info-value">{followUp.woundHealed}</div>
                                                    </div>

                                                    {followUp.woundHealed.toLowerCase() === "yes" && (
                                                        <div className="info-row">
                                                            <div className="info-label">Healing Time</div>
                                                            <div className="info-value">{followUp.healingTime}</div>
                                                        </div>
                                                    )}

                                                    {followUp.woundHealed.toLowerCase() === "no" && (
                                                        <>
                                                            <div className="info-row">
                                                                <div className="info-label">Non-Healing Reason</div>
                                                                <div className="info-value">{followUp.nonHealingReason}</div>
                                                            </div>
                                                            <div className="info-row">
                                                                <div className="info-label">Surgical Intervention</div>
                                                                <div className="info-value">{followUp.surgicalIntervention}</div>
                                                            </div>
                                                            <div className="info-row">
                                                                <div className="info-label">Amputation Performed</div>
                                                                <div className="info-value">{followUp.amputationPerformed}</div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="info-row">
                                                        <div className="info-label">Hospital Visits</div>
                                                        <div className="info-value">{followUp.hospitalVisits}</div>
                                                    </div>

                                                    <div className="info-row">
                                                        <div className="info-label">Hospitalized</div>
                                                        <div className="info-value">{followUp.hospitalized}</div>
                                                    </div>

                                                    {followUp.hospitalized.toLowerCase() === "yes" && (
                                                        <div className="info-row">
                                                            <div className="info-label">Hospital Stay Length</div>
                                                            <div className="info-value">{followUp.hospitalStayLength}</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}


                                            {followUp.survivalStatus.toLowerCase() === "death" && (
                                                <>
                                                    <div className="info-row">
                                                        <div className="info-label">Death Date</div>
                                                        <div className="info-value">{followUp.deathDate}</div>
                                                    </div>
                                                    <div className="info-row">
                                                        <div className="info-label">Death Reason</div>
                                                        <div className="info-value">{followUp.deathReason}</div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="info-row">
                                                <div className="info-label">Active Ulcer</div>
                                                <div className="info-value">{followUp.activeUlcer}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>




                    )}
                </div>
            </div>
        )
    }

    return (
        <AdminLayout>
            <div className="patient-details-page">
                <div className="page-header">
                    <h1>RSSDI Save the Feet 2.0</h1>
                    <p>View, manage, and export participant records in the system.</p>

                    <div className="header-actions footexam-actions">
                        {/* <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Refresh Data</span>
              )}
            </button> */}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="loader"></div>
                        {/* <span className="loader">Loading patient records...</span> */}
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="error-icon"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p className="error-message">{error}</p>
                    </div>
                ) : patient ? (
                    renderPatientData()
                ) : (
                    <div className="no-data-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="no-data-icon"
                        >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        <p>No patient data available</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default PatientDetailsPage
