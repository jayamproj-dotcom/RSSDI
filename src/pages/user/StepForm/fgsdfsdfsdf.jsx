"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import UserLayout from "../../layouts/UserLayout"
import DataTable from "../../components/DataTable"
import { formatToDDMMYYYY, is24HoursPassed, calculateRemainingTime } from "../../utils/dateUtils"
import "./UserDashboard.css"
import { FilePenLine, CalendarClock, Lock } from "lucide-react"
import { toast } from "react-toastify"
import UploadPopup from "../../components/UploadPopup"
import { apiGet } from "../../services/api-helper"
import MessageBanner from "../../components/MessageBanner/MessageBanner"
import { FaSync } from "react-icons/fa"


const UserDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [doctorData, setDoctorData] = useState([])
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [currentPatient, setCurrentPatient] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (location.state?.refresh) {
            loadPatientRecords()
        }
    }, [location.state])

    useEffect(() => {
        if (!location.state?.isUpdate) {
            const saved = localStorage.getItem("stepFormData")
            if (saved) {
                try {
                    const parsedData = JSON.parse(saved)
                    if (parsedData.section1.consentForm) {
                        parsedData.section1.consentForm = null
                        parsedData.section1.consentFormPreview = null
                    }
                    setFormData(parsedData)
                } catch (error) {
                    console.error("Error parsing saved form data:", error)
                }
            }
        }

        if (location.state?.showToast) {
            toast.success(location.state.toastMessage)
            window.history.replaceState({}, document.title)
        }

        window.scrollTo(0, 0)
    }, [location])

    const normalizeYesNo = (val) => {
        if (val === null || val === undefined) return ""
        const strVal = String(val).toLowerCase()
        if (strVal === "yes" || strVal === "1" || strVal === "true" || val === 1 || val === true) {
            return "yes"
        }
        if (strVal === "no" || strVal === "0" || strVal === "false" || val === 0 || val === false) {
            return "no"
        }
        return ""
    }

    const convertToYesNo = normalizeYesNo

    // Helper to normalize follow-up duration strings (e.g., "3-month" to "3month")
    const normalizeFollowUpDuration = (duration) => {
        if (!duration) return "3month"; // Default to 3month if not specified

        // Convert to lowercase and remove hyphens
        const cleaned = String(duration).toLowerCase().replace(/-/g, '');

        // Only allow "3month" or "6month" as valid values
        return cleaned === "6month" ? "6month" : "3month";
    };

    const loadPatientRecords = async () => {
        try {
            setLoading(true)
            setError(null)
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}")
            const doctorId = currentUser?.id || ""
            const doctorEmail = currentUser?.email || "unknown@doctor.com"

            if (!doctorId) {
                throw new Error("Doctor ID not found in user info")
            }

            const records = await apiGet("patient", {
                doctor_id: doctorId,
                doctor_email: doctorEmail,
            })

            const patientRecords = Array.isArray(records.patients) ? records.patients : Array.isArray(records) ? records : []

            if (patientRecords.length === 0) {
                console.warn("No patient records found for doctor ID:", doctorId)
                setDoctorData([])
                localStorage.removeItem("patientRecords")
                return
            }

            const localRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")

            const filteredRecords = patientRecords.filter(
                (record) => record.doctor_id === doctorId || record.doctor_email === doctorEmail,
            )

            const mappedRecords = filteredRecords.map((record, index) => {
                const followUpDuration = normalizeFollowUpDuration(record.follow_up_duration || "3-month");
                const submissionDate = new Date(record.submission_date || record.created_at || new Date().toISOString())
                const lastFollowUpDate = record.last_follow_up_date ? new Date(record.last_follow_up_date) : null

                // Get and normalize the follow-up duration directly from the API record
                const apiFollowUpDuration = normalizeFollowUpDuration(record.follow_up_duration || "3-month")

                // Calculate the specific due date based on the API's followUpDuration
                const specificDueDate = new Date(submissionDate)
                if (apiFollowUpDuration === "6month") {
                    specificDueDate.setMinutes(specificDueDate.getMinutes() + 3) // TESTING: 3 minutes
                    // PRODUCTION: specificDueDate.setMonth(specificDueDate.getMonth() + 6);
                } else {
                    // Defaults to 3month
                    specificDueDate.setMinutes(specificDueDate.getMinutes() + 2) // TESTING: 2 minutes
                    // PRODUCTION: specificDueDate.setMonth(specificDueDate.getMonth() + 3);
                }

                const now = new Date()
                let currentFollowUpStatus = "Pending" // Default status

                // Determine the current follow-up status
                if (record.follow_up_status === "Completed") {
                    currentFollowUpStatus = "Completed"
                } else if (now >= specificDueDate) {
                    currentFollowUpStatus = "Due"
                } else {
                    currentFollowUpStatus = "Pending"
                }

                // Map all boolean fields consistently
                const booleanFields = [
                    "hasUlcer",
                    "hasAmputation",
                    "hasAngioplasty",
                    "renal",
                    "retinal",
                    "cardiovascular",
                    "cerebrovascular",
                    "hypertension",
                    "limbIschemia",
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
                    "cellulitis",
                    "footDeformities",
                    "hairLoss",
                    "pulsesPalpable",
                ]

                // Create a normalized record with consistent boolean values
                const normalizedRecord = { ...record }
                booleanFields.forEach((field) => {
                    if (field in record) {
                        normalizedRecord[field] = normalizeYesNo(record[field])
                    }
                })

                return {
                    sNo: index + 1,
                    patientId: record.id || record.patient_id || `PAT-${index + 1}`,
                    patient_name: record.patient_name || record.name || "Unknown",
                    appointmentDate: record.appointment_date || record.created_at || new Date().toISOString(),
                    diagnosis: record.diagnosis || "N/A",
                    status: record.status || "Completed", // This 'status' seems to be for the initial assessment
                    lastVisit: record.last_visit || record.updated_at || new Date().toISOString(),
                    submissionDate: submissionDate.toISOString(),
                    canEdit: !is24HoursPassed(submissionDate.toISOString()),
                    lastFollowUpDate: record.last_follow_up_date || null,
                    doctor_id: record.doctor_id,
                    doctor_email: record.doctor_email,
                    followUpDuration,
                    followUpData:
                        localRecords.find((lr) => lr.patientId === (record.id || record.patient_id))?.followUpData || null,
                    originalRecord: normalizedRecord,
                    // Directly use the API's followUpDuration and the calculated status
                    followUpDuration: apiFollowUpDuration, // This is the key change: directly use the API's duration
                    follow_up_status: currentFollowUpStatus, // Use the calculated status
                    followUpDueDate: specificDueDate.toISOString(), // The specific due date for this patient's type
                }
            })

            // Sort by most recent submission first
            mappedRecords.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))

            // Reassign serial numbers based on new order
            const finalRecords = mappedRecords.map((record, index) => ({
                ...record,
                sNo: index + 1,
            }))

            setDoctorData(finalRecords)
        } catch (error) {
            console.error("Error fetching patient records:", error)
            toast.error("Failed to load patient records: " + error.message)
            setError("Failed to load patient records. Please try again.")
            setDoctorData([])
            localStorage.removeItem("patientRecords")
        } finally {
            setLoading(false)
        }
    }

    const handleClearLocalStorage = () => {
        localStorage.removeItem("patientRecords")
        toast.info("Reloading records...")
        loadPatientRecords()
    }

    useEffect(() => {
        handleClearLocalStorage()
    }, [])

    useEffect(() => {
        loadPatientRecords()
    }, [])

    const handleSubmitFollowUp = (patient) => {
        try {
            setIsSaving(true)
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}")
            // Use the already determined followUpDuration from the patient object
            const followUpDuration = patient.followUpDuration

            navigate(`/user/${followUpDuration === "3month" ? "followup" : "followup-6month"}/${patient.patientId}`, {
                state: {
                    initialData: {
                        patientId: patient.patientId,
                        patient_name: patient.patient_name,
                        doctor_id: currentUser?.id || "",
                        doctor_email: currentUser?.email || "unknown@doctor.com",
                        lastFollowUpDate: patient.lastFollowUpDate,
                        followUpData: patient.followUpData || null,
                        followUpDuration: followUpDuration, // Pass the correct duration
                    },
                    isInitialFollowUp: !patient.followUpData,
                    isUpdate: !!patient.followUpData,
                },
            })
        } catch (error) {
            console.error("Error navigating to follow-up form:", error)
            toast.error("Failed to open follow-up form")
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileUpload = (event) => {
        const newFile = event.target.files[0]
        setUploadedFiles((prevFiles) => [...prevFiles, newFile])
    }

    const handleRemoveFile = (index) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    }

    const handleSaveForLater = async () => {
        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success("Saved for later!")
            setShowUploadPopup(false)
        } catch (error) {
            toast.error("Failed to save for later")
        } finally {
            setIsSaving(false)
        }
    }

    const handleUploadComplete = async () => {
        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success("Concern form saved successfully!")
            setTimeout(() => setShowUploadPopup(false), 1000)
        } catch (error) {
            toast.error("Upload failed!")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDownloadForm = () => {
        const link = document.createElement("a")
        link.href = "/Consent_form_registry.pdf"
        link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const updatePatientStatus = (patientId, status, additionalData = {}) => {
        const updatedData = doctorData.map((patient) =>
            patient.patientId === patientId ? { ...patient, status, ...additionalData } : patient,
        )
        setDoctorData(updatedData)
        localStorage.setItem("patientRecords", JSON.stringify(updatedData))
        toast.success(`Patient ${patientId} status updated to ${status}`)
    }

    const handleEdit = (row) => {
        setCurrentPatient(row)
        setUploadedFiles([])
        setShowUploadPopup(true)
    }

    const handleCloseModal = () => {
        setUploadedFiles([])
        setShowUploadPopup(false)
    }

    const handleRefresh = () => {
        loadPatientRecords()
    }

    const columns = [
        {
            key: "sNo",
            header: "S.NO",
            sortable: true,
        },
        {
            key: "patientId",
            header: "Patient ID",
            sortable: true,
        },
        {
            key: "patient_name",
            header: "Patient Name",
            sortable: true,
        },
        {
            key: "appointmentDate",
            header: "Appointment Date",
            sortable: true,
            render: (value) => formatToDDMMYYYY(value),
        },
        {
            key: "diagnosis",
            header: "Diagnosis",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: () => (
                <div className="status-container">
                    <span className="status-badge completed">Completed</span>
                </div>
            ),
        },
        {
            key: "lastVisit",
            header: "Last Visit",
            sortable: true,
            render: (value) => formatToDDMMYYYY(value),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (_, row, externalProps) => {
                const submissionDate = row.submissionDate
                const canEdit = !is24HoursPassed(submissionDate)
                const { currentTime } = externalProps || {}
                const remainingTime = canEdit ? calculateRemainingTime(submissionDate, currentTime) : null

                return (
                    <div className="action-buttons">
                        <div className="main-assessment-actions">
                            {canEdit && remainingTime ? (
                                <>
                                    <a className="action-btn edit-btn" onClick={() => handleStepForm(row, true)} title="Edit assessment">
                                        <FilePenLine size={16} />
                                    </a>
                                    <div className="edit-countdown">
                                        <small>You can edit this for another {remainingTime}</small>
                                    </div>
                                </>
                            ) : (
                                <div className="expired-indicator" title="Edit period expired">
                                    <Lock size={16} />
                                    <span className="expired-text">Edit Expired</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            key: "follow_up_status",
            header: "Follow Up",
            sortable: true,
            render: (_, row) => {
                // Directly use the properties from the row object, which are now correctly set in loadPatientRecords
                const { followUpDuration, follow_up_status, followUpDueDate, lastFollowUpDate } = row
                const displayDueDate = followUpDueDate ? new Date(followUpDueDate) : null

                const handleClick = () => {
                    if (follow_up_status === "Due") {
                        // Use followUpDuration directly for navigation
                        handleSubmitFollowUp(row)
                    } else if (follow_up_status === "Pending") {
                        toast.info(
                            `${followUpDuration === "3month" ? "3-month" : "6-month"} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"}`,
                        )
                    }
                }

                let statusText = ""
                const statusClass = follow_up_status.toLowerCase()

                if (follow_up_status === "Pending") {
                    statusText = `Follow-up Pending`
                } else if (follow_up_status === "Due") {
                    statusText = `Follow-up Due`
                } else if (follow_up_status === "Completed") {
                    statusText = `Follow-up Completed`
                }

                return (
                    <div className="follow-up-cell">
                        <div
                            className={`follow-up-content ${follow_up_status !== "Completed" ? "clickable" : ""}`}
                            onClick={follow_up_status !== "Completed" ? handleClick : undefined}
                            title={
                                follow_up_status === "Due"
                                    ? `Click to submit ${followUpDuration === "3month" ? "3-month" : "6-month"} follow-up`
                                    : follow_up_status === "Pending"
                                        ? `${followUpDuration === "3month" ? "3-month" : "6-month"} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"}`
                                        : "All follow-ups completed"
                            }
                        >
                            <span className={`follow-up-status ${statusClass}`}>
                                {statusText}
                                <br />
                                {/* Display the correct duration type */}
                                <small>({followUpDuration === "3month" ? "3-month" : "6-month"})</small>
                            </span>
                        </div>

                        {follow_up_status === "Pending" && displayDueDate && (
                            <small>
                                <CalendarClock size={12} />
                                Available: {formatToDDMMYYYY(displayDueDate)}
                            </small>
                        )}

                        {follow_up_status === "Completed" && lastFollowUpDate && (
                            <small>
                                <CalendarClock size={12} />
                                Completed: {formatToDDMMYYYY(lastFollowUpDate)}
                            </small>
                        )}
                    </div>
                )
            },
        },
    ]

    const handleAddNew = () => {
        localStorage.removeItem("stepFormData")
        navigate("/user/survey", {
            state: {
                isUpdate: false,
                initialData: null,
            },
        })
    }

    return (
        <UserLayout>
            <div className="doctor-dashboard">
                {/* <MessageBanner message=" Your Previous data is safe. We're fixing a backend issue, and it will reappear soon. You can continue submitting." /> */}

                <div className="dashboard-controls"></div>
                {loading ? (
                    <div className="loading-indicator">
                        <div className="loader"></div>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <div className="error-content">
                            <p>{error}</p>
                            <button onClick={handleRefresh} className="retry-button">
                                <FaSync className="retry-icon" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={doctorData}
                        columns={columns}
                        onAddNew={handleAddNew}
                        showSearch={true}
                        showAddNew={true}
                        showDownloadSample={true}
                        showUploadExcel={true}
                        showExport={false}
                        showaddsubadmin={false}
                        showDownloadSubadmin={false}
                        showDirectExport={false}
                        searchPlaceholder="Search patients..."
                        exportFileName="doctor_patients"
                        rowsPerPageOptions={[5, 10, 25]}
                        defaultRowsPerPage={10}
                        title="Patient Records"
                        extraProps={{ currentTime }}
                        loading={loading}
                        rawExportData={doctorData}
                        loadPatientRecords={loadPatientRecords}
                    />
                )}
                {showUploadPopup && currentPatient && (
                    <UploadPopup
                        onClose={handleCloseModal}
                        handleFileUpload={handleFileUpload}
                        handleDownloadForm={handleDownloadForm}
                        uploadedFiles={uploadedFiles}
                        handleRemoveFile={handleRemoveFile}
                        handleSaveForLater={handleSaveForLater}
                        handleUploadComplete={handleUploadComplete}
                        isSaving={isSaving}
                        consentFormPdf="/Consent_form_registry.pdf"
                        updatePatientStatus={updatePatientStatus}
                        currentPatientId={currentPatient.patientId}
                        patientName={currentPatient.patient_name}
                        patientId={currentPatient.patientId}
                    />
                )}
            </div>
        </UserLayout>
    )
}

export default UserDashboard