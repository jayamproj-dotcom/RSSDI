"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import UserLayout from "../../layouts/UserLayout"
import DataTable from "../../components/DataTable"
import { formatToDDMMYYYY, is24HoursPassed, calculateRemainingTime } from "../../utils/dateUtils"
import "./UserDashboard.css" // Import the custom CSS file
import { FilePenLine, CalendarClock, Lock, Bell, Filter, ChevronDown, Check, BellRing, BellOff } from "lucide-react"
import { toast } from "react-toastify"
import UploadPopup from "../../components/UploadPopup"
import { apiGet } from "../../services/api-helper"
import { FaSync } from "react-icons/fa"

const MS_IN_DAY = 1000 * 60 * 60 * 24
const MS_IN_MONTH = MS_IN_DAY * 30 // Approximate month duration for simplicity

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
    const [filterStatus, setFilterStatus] = useState("all")
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])

    // Update current time every minute (not every second to reduce updates)
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60 * 1000)
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
                    if (parsedData.section1?.consentForm) {
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
        if (location.state?.followUpCompleted) {
            const { patientId, followUpType } = location.state
            updatePatientAfterFollowUp(patientId, followUpType)
            window.history.replaceState({}, document.title)
        }
        window.scrollTo(0, 0)
    }, [location])

    // Update patient data after successful follow-up submission
    const updatePatientAfterFollowUp = (patientId, followUpType) => {
        setDoctorData((prevData) => {
            const updatedData = prevData.map((patient) => {
                if (patient.patientId === patientId) {
                    const now = new Date()
                    if (followUpType === "3-month") {
                        // After 3-month follow-up, update patient for 6-month follow-up
                        return {
                            ...patient,
                            follow_up_status: "Pending",
                            lastFollowUpDate: now.toISOString(),
                            currentFollowUpType: "6-month",
                            followUpSchedule: calculateFollowUpSchedule({
                                submissionDate: patient.submissionDate,
                                lastFollowUpDate: now.toISOString(),
                                followUpDuration: "6-month",
                                follow_up_status: "Pending",
                            }),
                        }
                    } else if (followUpType === "6-month") {
                        // After 6-month follow-up, mark as completed final
                        return {
                            ...patient,
                            follow_up_status: "Completed",
                            lastFollowUpDate: now.toISOString(),
                            currentFollowUpType: "6-month",
                            followUpSchedule: calculateFollowUpSchedule({
                                submissionDate: patient.submissionDate,
                                lastFollowUpDate: now.toISOString(),
                                followUpDuration: "6-month",
                                follow_up_status: "Completed",
                            }),
                        }
                    }
                }
                return patient
            })
            const newNotifications = generateNotifications(updatedData)
            setNotifications(newNotifications)
            return updatedData
        })
    }

    const normalizeYesNo = (val) => {
        if (val == null) return ""
        const strVal = String(val).toLowerCase()
        if (strVal === "yes" || strVal === "1" || strVal === "true" || val === 1 || val === true) return "yes"
        if (strVal === "no" || strVal === "0" || strVal === "false" || val === 0 || val === false) return "no"
        return ""
    }

    // Normalize duration strictly to "3-month" or "6-month"
    const normalizeFollowUpDuration = (duration) => {
        if (!duration) return "3-month"
        const cleaned = String(duration).toLowerCase().replace(/\s+/g, "-")
        if (cleaned === "3-month" || cleaned === "3month") return "3-month"
        if (cleaned === "6-month" || cleaned === "6month") return "6-month"
        return "3-month"
    }

    // Calculate follow-up schedule based on real months (approx 30 days each)
    const calculateFollowUpSchedule = (patient) => {
        const submissionDate = new Date(patient.submissionDate)
        const lastFollowUpDate = patient.lastFollowUpDate ? new Date(patient.lastFollowUpDate) : null
        const followUpDuration = patient.followUpDuration
        const now = new Date()

        if (followUpDuration === "3-month") {
            // 3 months after submissionDate
            const threeMonthDue = new Date(submissionDate.getTime() + 3 * MS_IN_MONTH)
            // If 3-month completed, next is 6-month based on lastFollowUpDate or submissionDate
            if (patient.follow_up_status === "Completed" && lastFollowUpDate) {
                const sixMonthDue = new Date(submissionDate.getTime() + 6 * MS_IN_MONTH)
                return {
                    currentSchedule: "6-month",
                    dueDate: sixMonthDue,
                    canAccess: now >= sixMonthDue,
                    daysUntilAccess: Math.ceil((sixMonthDue - now) / MS_IN_DAY),
                    secondsUntilAccess: Math.ceil((sixMonthDue - now) / 1000),
                }
            }
            return {
                currentSchedule: "3-month",
                dueDate: threeMonthDue,
                canAccess: now >= threeMonthDue,
                daysUntilAccess: Math.ceil((threeMonthDue - now) / MS_IN_DAY),
                secondsUntilAccess: Math.ceil((threeMonthDue - now) / 1000),
            }
        }

        if (followUpDuration === "6-month") {
            // 6 months after submissionDate
            const sixMonthDue = new Date(submissionDate.getTime() + 6 * MS_IN_MONTH)
            return {
                currentSchedule: "6-month",
                dueDate: sixMonthDue,
                canAccess: now >= sixMonthDue,
                daysUntilAccess: Math.ceil((sixMonthDue - now) / MS_IN_DAY),
                secondsUntilAccess: Math.ceil((sixMonthDue - now) / 1000),
            }
        }

        // Default to 3-month if unknown
        const threeMonthDue = new Date(submissionDate.getTime() + 3 * MS_IN_MONTH)
        return {
            currentSchedule: "3-month",
            dueDate: threeMonthDue,
            canAccess: now >= threeMonthDue,
            daysUntilAccess: Math.ceil((threeMonthDue - now) / MS_IN_DAY),
            secondsUntilAccess: Math.ceil((threeMonthDue - now) / 1000),
        }
    }

    // Generate notifications based on follow-up schedule and patient status
    const generateNotifications = (patients) => {
        const notifs = []
        patients.forEach((patient) => {
            const schedule = calculateFollowUpSchedule(patient)
            // Notify if upcoming follow-up within next 10 days and not completed yet
            if (
                schedule.daysUntilAccess > 0 &&
                schedule.daysUntilAccess <= 10 &&
                !schedule.canAccess &&
                patient.follow_up_status !== "Completed"
            ) {
                notifs.push({
                    id: `${patient.patientId}-upcoming`,
                    type: "info",
                    message: `${patient.patient_name}'s ${schedule.currentSchedule} follow-up will be available in ${schedule.daysUntilAccess} days`,
                    patientId: patient.patientId,
                    date: new Date(),
                })
            }
            // Notify if follow-up due
            if (schedule.canAccess && patient.follow_up_status === "Due") {
                notifs.push({
                    id: `${patient.patientId}-due`,
                    type: "warning",
                    message: `${patient.patient_name}'s ${schedule.currentSchedule} follow-up is due.`,
                    patientId: patient.patientId,
                    date: new Date(),
                })
            }
        })
        return notifs
    }

    // Load patient records and process follow-ups using months logic
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
                setDoctorData([])
                localStorage.removeItem("patientRecords")
                return
            }

            const localRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")

            // Filter records for current doctor
            const filteredRecords = patientRecords.filter(
                (record) => record.doctor_id === doctorId || record.doctor_email === doctorEmail,
            )

            // Map records into processed form
            const mappedRecords = filteredRecords.map((record, index) => {
                const rawDuration =
                    record.follow_up_duration ||
                    record.followUpDuration ||
                    record.followup_duration ||
                    record.followupDuration ||
                    "3-month"
                const followUpDuration = normalizeFollowUpDuration(rawDuration)
                const submissionDate = new Date(record.submission_date || record.created_at || new Date().toISOString())
                const lastFollowUpDate = record.last_follow_up_date ? new Date(record.last_follow_up_date) : null

                // Calculate follow-up schedule
                const schedule = calculateFollowUpSchedule({
                    submissionDate: submissionDate.toISOString(),
                    lastFollowUpDate: lastFollowUpDate?.toISOString(),
                    followUpDuration,
                    follow_up_status: record.follow_up_status,
                })

                let currentFollowUpStatus = "Pending"
                // Determine current status using updated logic
                if (record.follow_up_status === "Completed" && schedule.currentSchedule === "6-month") {
                    currentFollowUpStatus = "Completed"
                } else if (schedule.canAccess) {
                    currentFollowUpStatus = "Due"
                }

                // Normalize boolean fields
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
                    // "cellulitis",
                    "footDeformities",
                    "hairLoss",
                    "pulsesPalpable",
                ]
                const normalizedRecord = { ...record }
                booleanFields.forEach((field) => {
                    if (field in record) normalizedRecord[field] = normalizeYesNo(record[field])
                })

                return {
                    sNo: index + 1,
                    patientId: record.id || record.patient_id || `PAT-${index + 1}`,
                    patient_name: record.patient_name || record.name || "Unknown",
                    appointmentDate: record.appointment_date || record.created_at || new Date().toISOString(),
                    diagnosis: record.diagnosis || "N/A",
                    status: record.status || "Completed",
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
                    follow_up_status: currentFollowUpStatus,
                    followUpDueDate: schedule.dueDate.toISOString(),
                    followUpSchedule: schedule,
                    currentFollowUpType: schedule.currentSchedule,
                }
            })

            mappedRecords.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
            setDoctorData(mappedRecords)
            // Set notifications
            setNotifications(generateNotifications(mappedRecords))
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

    useEffect(() => {
        loadPatientRecords()
    }, [])

    const handleEdit = (row) => {
        try {
            localStorage.setItem("stepFormData", JSON.stringify(row.originalRecord))
            navigate("/user/survey", {
                state: {
                    isUpdate: true,
                    initialData: {
                        patientId: row.patientId,
                        patient_name: row.patient_name,
                        followUpDuration: row.followUpDuration,
                        doctor_id: row.doctor_id,
                        doctor_email: row.doctor_email,
                        ...row.originalRecord,
                    },
                },
            })
        } catch (error) {
            console.error("Error navigating to edit form:", error)
            toast.error("Failed to open edit form")
        }
    }

    // Submit follow-up navigation with correct follow-up duration/type
    const handleSubmitFollowUp = (patient) => {
        try {
            setIsSaving(true)
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}")
            // Use currentFollowUpType for route and state to ensure 3-month or 6-month follow-up form opens correctly
            const followUpDuration = patient.currentFollowUpType || patient.followUpDuration
            const followUpRoute = followUpDuration === "6-month" ? "followup-6month" : "followup"
            navigate(`/user/${followUpRoute}/${patient.patientId}`, {
                state: {
                    initialData: {
                        patientId: patient.patientId,
                        patient_name: patient.patient_name,
                        doctor_id: currentUser?.id || "",
                        doctor_email: currentUser?.email || "unknown@doctor.com",
                        lastFollowUpDate: patient.lastFollowUpDate,
                        followUpData: patient.followUpData || null,
                        followUpDuration,
                        currentFollowUpType: followUpDuration,
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

    // File Upload handlers (unchanged)
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
            toast.success("Consent form saved successfully!")
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

    const handleCloseModal = () => {
        setUploadedFiles([])
        setShowUploadPopup(false)
    }

    const handleRefresh = () => {
        loadPatientRecords()
    }

    const handleAddNew = () => {
        localStorage.removeItem("stepFormData")
        navigate("/user/survey", {
            state: {
                isUpdate: false,
                initialData: null,
            },
        })
    }

    // ------------------ Custom Filter Dropdown Component ------------------
    const CustomFilterDropdown = ({ options, value, onChange, placeholder }) => {
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef(null)

        const selectedOptionLabel = options.find((option) => option.value === value)?.label || placeholder

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false)
                }
            }
            document.addEventListener("mousedown", handleClickOutside)
            return () => {
                document.removeEventListener("mousedown", handleClickOutside)
            }
        }, [])

        return (
            <div className="custom-filter-dropdown" ref={dropdownRef}>
                <button
                    className={`custom-filter-trigger ${isOpen ? "active" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <div className="custom-filter-trigger-content">
                        <Filter size={16} className="custom-filter-icon" />
                        <span className="custom-filter-trigger-text">Filter: {selectedOptionLabel}</span>
                    </div>
                    <ChevronDown size={16} className="custom-filter-icon" />
                </button>
                {isOpen && (
                    <div className="custom-filter-options" role="listbox">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`custom-filter-option ${option.value === value ? "selected" : ""}`}
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                {option.label}
                                {option.value === value && <Check size={16} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ------------------ Filter and Notifications Section ------------------
    const notificationRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        if (showNotifications) {
            document.addEventListener("click", handleClickOutside)
        }
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [showNotifications])

    const FilterSection = () => {
        const filterOptions = [
            { value: "all", label: "All Patients" },
            { value: "pending", label: "Pending Follow-ups" },
            { value: "due", label: "Due Follow-ups" },
            { value: "completed", label: "Completed " },
        ]

        return (
            <div className="filter-notification-container">
                <CustomFilterDropdown
                    options={filterOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Select Filter"
                />

                <div className="notification-section" ref={notificationRef}>
                    <button
                        className={`notification-btn  ${showNotifications ? "active" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowNotifications((prev) => !prev)
                        }}
                        aria-label="Toggle notifications"
                    >
                          <BellRing size={20} />
                        {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                        <span className="notification-text">Notifications</span>
                    </button>
                    {showNotifications && (
                        <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                            <div className="notification-header">
                                <p>Follow-up Notifications</p>
                                <button
                                    className="close-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowNotifications(false)
                                    }}
                                    aria-label="Close notifications"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                            <div className="notification-content">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">
                                        <BellOff size={40} strokeWidth={1} />
                                        <p>No notifications at this time</p>
                                       
                                    </div>
                                ) : (
                                    <div className="notification-list">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className={`notification-item ${notif.type}`}>
                                                <div className="notification-icon">
                                                    {notif.type === "warning" ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path
                                                                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                                                strokeWidth="2"
                                                            />
                                                            <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
                                                            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                            <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="notification-details">
                                                    <p className="notification-message">{notif.message}</p>
                                                    <button
                                                        className="notification-action-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const patient = doctorData.find((p) => p.patientId === notif.patientId)
                                                            if (patient && notif.type === "warning") {
                                                                handleSubmitFollowUp(patient)
                                                                setShowNotifications(false)
                                                            }
                                                        }}
                                                    >
                                                        {notif.type === "warning" ? "Submit Follow-up" : "View Details"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Filtered data based on filterStatus
    const filteredData = doctorData.filter((patient) => {
        if (filterStatus === "all") return true
        if (filterStatus === "pending") return patient.follow_up_status === "Pending"
        if (filterStatus === "due") return patient.follow_up_status === "Due"
        if (filterStatus === "completed") return patient.follow_up_status === "Completed"
        return true
    })

    // DataTable columns including follow-up column with correct click behavior and labels
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
            render: (_, row) => {
                const submissionDate = row.submissionDate
                const canEdit = !is24HoursPassed(submissionDate)
                const remainingTime = canEdit ? calculateRemainingTime(submissionDate, currentTime) : null
                return (
                    <div className="action-buttons">
                        <div className="main-assessment-actions">
                            {canEdit && remainingTime ? (
                                <>
                                    <a className="action-btn edit-btn" onClick={() => handleEdit(row)} title="Edit assessment">
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
                const { followUpSchedule, follow_up_status, currentFollowUpType } = row
                const handleClick = () => {
                    if (follow_up_status === "Due") {
                        handleSubmitFollowUp({
                            ...row,
                            followUpDuration: currentFollowUpType,
                        })
                    } else if (follow_up_status === "Pending") {
                        toast.info(
                            `${currentFollowUpType} follow-up will be available in ${followUpSchedule.daysUntilAccess} day${followUpSchedule.daysUntilAccess === 1 ? "" : "s"
                            }`,
                        )
                    }
                    // No action on Completed
                }
                const statusClass = follow_up_status.toLowerCase()
                return (
                    <div className="follow-up-cell">
                        <div
                            className={`follow-up-content ${follow_up_status !== "Completed" ? "clickable" : ""}`}
                            onClick={follow_up_status !== "Completed" ? handleClick : undefined}
                            title={
                                follow_up_status === "Due"
                                    ? `Click to submit ${currentFollowUpType} follow-up`
                                    : follow_up_status === "Pending"
                                        ? `${currentFollowUpType} follow-up available in ${followUpSchedule.daysUntilAccess} days`
                                        : "All follow-ups completed"
                            }
                        >
                            <span className={`follow-up-status ${statusClass}`}>
                                {follow_up_status} <small>({currentFollowUpType})</small>
                            </span>
                        </div>
                        {follow_up_status === "Pending" && (
                            <small className="follow-up-info">
                                <CalendarClock size={12} /> Available: {formatToDDMMYYYY(followUpSchedule.dueDate)} (
                                {followUpSchedule.daysUntilAccess} days)
                            </small>
                        )}
                        {follow_up_status === "Completed" && row.lastFollowUpDate && (
                            <small className="follow-up-info">
                                <CalendarClock size={12} /> Completed: {formatToDDMMYYYY(row.lastFollowUpDate)}
                            </small>
                        )}
                    </div>
                )
            },
        },
    ]

    return (
        <UserLayout>
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
                    <FilterSection />
                </div>
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
                        data={filteredData}
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
                        rawExportData={filteredData}
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
