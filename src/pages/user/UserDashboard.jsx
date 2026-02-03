"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import DataTable from "../../components/DataTable";
import { formatToDDMMYYYY, is24HoursPassed, calculateRemainingTime } from "../../utils/dateUtils";
import "./UserDashboard.css";
import { FilePenLine, CalendarClock, Lock } from "lucide-react";
import { toast } from "react-toastify";
import UploadPopup from "../../components/UploadPopup";
import { apiGet, apiPost } from "../../services/api-helper";
import MessageBanner from "../../components/MessageBanner/MessageBanner";
import { FaSync } from "react-icons/fa";


const UserDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [doctorData, setDoctorData] = useState([]);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestData, setRequestData] = useState(false);
    const [openRow, setOpenRow] = useState(null);


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.state?.refresh) {
            loadPatientRecords();
        }
    }, [location.state]);

    useEffect(() => {
        if (!location.state?.isUpdate) {
            const saved = localStorage.getItem("stepFormData");
            if (saved) {
                try {
                    const parsedData = JSON.parse(saved);

                    if (parsedData && parsedData.section1) {
                        if (parsedData.section1.consentForm) {
                            parsedData.section1.consentForm = null;
                            parsedData.section1.consentFormPreview = null;
                        }
                    }

                    setFormData(parsedData);
                } catch (error) {
                    console.error("Error parsing saved form data:", error);
                }
            }
        }

        if (location.state?.showToast) {
            toast.success(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }

        window.scrollTo(0, 0);
    }, [location]);


    const normalizeYesNo = (val) => {
        if (val === null || val === undefined) return "";
        const strVal = String(val).toLowerCase();
        if (strVal === "yes" || strVal === "1" || strVal === "true" || val === 1 || val === true) {
            return "yes";
        }
        if (strVal === "no" || strVal === "0" || strVal === "false" || val === 0 || val === false) {
            return "no";
        }
        return "";
    };

    const normalizeFollowUpDuration = (duration) => {
        if (!duration) {
            // console.warn("follow_up_duration is null or undefined, defaulting to '3-month'");
            return "3-month";
        }

        const cleaned = String(duration).toLowerCase().replace(/\s+/g, "-");
        if (cleaned === "3-month" || cleaned === "3month") {
            return "3-month";
        }
        if (cleaned === "6-month" || cleaned === "6month") {
            return "6-month";
        }

        console.warn(`Unexpected follow_up_duration value: ${duration}, defaulting to '3-month'`);
        return "3-month";
    };


    const loadPatientRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
            const doctorId = currentUser?.id || "";
            const doctorEmail = currentUser?.email || "unknown@doctor.com";

            if (!doctorId) {
                throw new Error("Doctor ID not found in user info");
            }

            // const records = await apiPost("patientbydoctor", {
            //     doctor_id: doctorId,
            //     doctor_email: doctorEmail,
            // });

            // const patientRecords = Array.isArray(records)
            //     ? records
            //     : Array.isArray(records)
            //         ? records
            //         : [];

            const doctData = { doctor_id: doctorId, doctor_email: doctorEmail };

            const response = await apiPost('patientbydoctor', doctData);

            const records = response.patients;

            const patientRecords = Array.isArray(records) ? records : [];

           // console.log("API patient patientRecords (raw):", patientRecords);

            if (patientRecords.length === 0) {
                console.warn("No patient records found for doctor ID:", doctorId);
                setDoctorData([]);
                localStorage.removeItem("patientRecords");
                return;
            }

           // console.log("API patient records (raw):", records);
            // console.log(
            //     "API patient records (summary):",
            //     patientRecords.map((r) => ({
            //         id: r.id || r.patient_id,
            //         patient_name: r.patient_name,
            //         follow_up_duration: r.follow_up_duration,
            //         hasUlcer: r.hasUlcer,
            //         hasAmputation: r.hasAmputation,
            //         possible_alt_keys: {
            //             followUpDuration: r.followUpDuration,
            //             followup_duration: r.followup_duration,
            //             followupDuration: r.followupDuration,
            //         },
            //     }))
            // );

            const localRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]");
            const filteredRecords = patientRecords.filter(
                (record) => record.doctor_id === doctorId || record.doctor_email === doctorEmail
            );

            const mappedRecords = filteredRecords.map((record, index) => {
            
                const rawDuration =
                    record.follow_up_duration ||
                    record.followUpDuration ||
                    record.followup_duration ||
                    record.followupDuration;
                const followUpDuration = normalizeFollowUpDuration(rawDuration);
                // console.log(
                //     `Patient ${record.id || record.patient_id}: follow_up_duration=${rawDuration}, normalized=${followUpDuration}`
                // );

                const submissionDate = new Date(record.submission_date || record.created_at || new Date().toISOString());
                const lastFollowUpDate = record.last_follow_up_date ? new Date(record.last_follow_up_date) : null;

                const specificDueDate = new Date(submissionDate);

                if (followUpDuration === "6-month") {
                    specificDueDate.setMinutes(specificDueDate.getMinutes() + 3); // TESTING
                    // specificDueDate.setMonth(specificDueDate.getMonth() + 6); // PRODUCTION
                } else {
                    specificDueDate.setMinutes(specificDueDate.getMinutes() + 2); // TESTING
                    // specificDueDate.setMonth(specificDueDate.getMonth() + 3); // PRODUCTION
                }

                const followUpCount = record.follow_up_count || 0; // backend or local field

                const isAllFollowUpsDone = followUpCount >= 2; // after 2 follow-ups disable further


                const now = new Date();
                let currentFollowUpStatus = "Due";
                if (record.follow_up_status === "Completed") {
                    currentFollowUpStatus = "Completed";
                } else if (now >= specificDueDate) {
                    currentFollowUpStatus = "Due";
                }

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
                ];

                const normalizedRecord = { ...record };
                booleanFields.forEach((field) => {
                    if (field in record) {
                        normalizedRecord[field] = normalizeYesNo(record[field]);
                    }
                });

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
                    followUpDueDate: specificDueDate.toISOString(),
                    followUpCount,
                    isAllFollowUpsDone,
                };
            });

            mappedRecords.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
            const finalRecords = mappedRecords.map((record, index) => ({
                ...record,
                sNo: index + 1,
            }));
            setDoctorData(finalRecords);

        } catch (error) {
            console.error("Error fetching patient records:", error);
            toast.error("Failed to load patient records: " + error.message);
            setError("Failed to load patient records. Please try again.");
            setDoctorData([]);
            localStorage.removeItem("patientRecords");
        } finally {
            setLoading(false);
        }
    };

    const handleClearLocalStorage = () => {
        localStorage.removeItem("patientRecords");
        toast.info("Reloading records...");
        loadPatientRecords();
    };

    useEffect(() => {
        loadPatientRecords();
    }, []);

    const handleEdit = (row) => {
        try {
            console.log(`Editing patient ${row.patientId}:`, row.originalRecord);
            localStorage.setItem("stepFormData", JSON.stringify(row.originalRecord));
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
            });
        } catch (error) {
            console.error("Error navigating to edit form:", error);
            toast.error("Failed to open edit form");
        }
    };

    const handleSubmitFollowUp = (patient) => {
        console.log(patient)
        try {
            setIsSaving(true);
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
            const followUpDuration = patient.followUpDuration;

            console.log(`Navigating for patient ${patient.patientId}: followUpDuration=${followUpDuration}`);

            const followUpRoute = followUpDuration === "6-month" ? "followup-6month" : "followup";

            navigate(`/user/${followUpRoute}/${patient.patientId}`, {
                state: {
                    initialData: {
                        patientId: patient.patientId,
                        patient_name: patient.patient_name,
                        doctor_id: currentUser?.id || "",
                        doctor_email: currentUser?.email || "unknown@doctor.com",
                        lastFollowUpDate: patient.lastFollowUpDate,
                        followUpData: patient.followUpData || null,
                        follow_up_1: patient.originalRecord.follow_up_1,
                        follow_up_2: patient.originalRecord.follow_up_2,
                    },
                    isInitialFollowUp: !patient.followUpData,
                    isUpdate: !!patient.followUpData,
                },
            });
        } catch (error) {
            console.error("Error navigating to follow-up form:", error);
            toast.error("Failed to open follow-up form");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (event) => {
        const newFile = event.target.files[0];
        setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleSaveForLater = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Saved for later!");
            setShowUploadPopup(false);
        } catch (error) {
            toast.error("Failed to save for later");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadComplete = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Consent form saved successfully!");
            setTimeout(() => setShowUploadPopup(false), 1000);
        } catch (error) {
            toast.error("Upload failed!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadForm = () => {
        const link = document.createElement("a");
        link.href = "/Consent_form_registry.pdf";
        link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const updatePatientStatus = (patientId, status, additionalData = {}) => {
        const updatedData = doctorData.map((patient) =>
            patient.patientId === patientId ? { ...patient, status, ...additionalData } : patient
        );
        setDoctorData(updatedData);
        localStorage.setItem("patientRecords", JSON.stringify(updatedData));
        toast.success(`Patient ${patientId} status updated to ${status}`);
    };

    const handleCloseModal = () => {
        setUploadedFiles([]);
        setShowUploadPopup(false);
    };

    const handleRefresh = () => {
        loadPatientRecords();
    };

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
        // {
        //     key: "diagnosis",
        //     header: "Diagnosis",
        //     sortable: true,
        // },
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
            key: "Request Data",
            header: "Request Data",
            sortable: true,
            render: (row) => {
                
                const rowKey = row.patientId;
                const isOpen = openRow === rowKey;

                return (
                    <div>
                        <div
                            className="status-container"
                            onClick={() =>
                                setOpenRow(isOpen ? null : rowKey)
                            }
                        >
                            <span className="musculoskeletal-status">
                                Musculoskeletal Exam
                            </span>
                        </div>

                        {isOpen && (
                            <div>
                                <div className="medical-add-group">
                                    <label className="medical-add-label required">
                                        Does the patient have obvious deformities in the feet?
                                    </label>

                                    <div className="medical-add-radio-group">
                                        {[
                                            { value: "no", label: "No" },
                                            { value: "minor", label: "Minor" },
                                            { value: "major", label: "Major" }
                                        ].map((option) => (
                                            <label
                                                key={`footDeformities-${rowKey}-${option.value}`}
                                                className="medical-add-radio-label"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`footDeformities-${rowKey}`}
                                                    className="medical-add-radio-button"
                                                />
                                                <span className="medical-add-radio-button-label">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button>Submit</button>
                            </div>
                        )}
                    </div>
                );
            },
        }
,
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
                const submissionDate = row.submissionDate;
                const canEdit = !is24HoursPassed(submissionDate);
                const { currentTime } = externalProps || {};
                const remainingTime = canEdit ? calculateRemainingTime(submissionDate, currentTime) : null;

                return (
                    <div className="action-buttons">
                        <div className="main-assessment-actions">
                            {canEdit && remainingTime ? (
                                <>
                                    <a
                                        className="action-btn edit-btn"
                                        onClick={() => {
                                            console.log("Edit button clicked for patient:", row.patientId);
                                            handleEdit(row);
                                        }}
                                        title="Edit assessment"
                                    >
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
                );
            },
        },
        // {
        //     key: "follow_up_status",
        //     header: "Follow Up",
        //     sortable: true,
        //     render: (_, row) => {
        //         const { followUpDuration, follow_up_status, followUpDueDate, lastFollowUpDate } = row;
        //         const displayDueDate = followUpDueDate ? new Date(followUpDueDate) : null;

        //         const handleClick = () => {
        //             if (follow_up_status === "Due") {
        //                 console.log(`Clicked Follow-up Due for patient ${row.patientId}: followUpDuration=${followUpDuration}`);
        //                 handleSubmitFollowUp(row);
        //             } else if (follow_up_status === "Pending") {
        //                 toast.info(
        //                     `${followUpDuration} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"}`
        //                 );
        //             }
        //         };

        //         let statusText = "";
        //         const statusClass = follow_up_status.toLowerCase();

        //         if (follow_up_status === "Pending") {
        //             statusText = ` Pending`;
        //         } else if (follow_up_status === "Due") {
        //             statusText = ` Due`;
        //         } else if (follow_up_status === "Completed") {
        //             statusText = ` Completed`;
        //         }

        //         return (
        //             <div className="follow-up-cell">
        //                 <div
        //                     className={`follow-up-content ${follow_up_status !== "Completed" ? "clickable" : ""}`}
        //                     onClick={follow_up_status !== "Completed" ? handleClick : undefined}
        //                     title={
        //                         follow_up_status === "Due"
        //                             ? `Click to submit ${followUpDuration} follow-up`
        //                             : follow_up_status === "Pending"
        //                                 ? `${followUpDuration} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"}`
        //                                 : "All follow-ups completed"
        //                     }
        //                 >
        //                     <span className={`follow-up-status ${statusClass}`}>
        //                         {statusText} <small>({followUpDuration})</small>
        //                     </span>
        //                 </div>

        //                 {follow_up_status === "Pending" && displayDueDate && (
        //                     <small>
        //                         <CalendarClock size={12} />
        //                         Available: {formatToDDMMYYYY(displayDueDate)}
        //                     </small>
        //                 )}

        //                 {follow_up_status === "Completed" && lastFollowUpDate && (
        //                     <small>
        //                         <CalendarClock size={12} />
        //                         Completed: {formatToDDMMYYYY(lastFollowUpDate)}
        //                     </small>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
        {
            key: "follow_up_status",
            header: "Follow Up",
            sortable: true,
            render: (_, row) => {
                const { followUpDuration, follow_up_status, followUpDueDate, lastFollowUpDate, appointmentDate, last_follow_up_date } = row;

                // Calculate due date = appointment date + 3 months
                let displayDueDate = null;
                if (appointmentDate) {
                    const apptDate = new Date(appointmentDate);
                    //apptDate.setMonth(apptDate.getMonth() + 3);
                    apptDate.setDate(apptDate.getDate() + 80); //appointmentDate add 80 days
                    displayDueDate = apptDate;
                };

                // Calculate due date = lastFollowUp date + 3 months
                let displayLastDate = null;
                if (lastFollowUpDate) {
                    const lastFUDate = new Date(lastFollowUpDate);
                    lastFUDate.setDate(lastFUDate.getDate() + 80); //lastFollowUpdate add 80 days
                    displayLastDate = lastFUDate;
                }

                const handleClick = () => {
                   
                    if (row.isAllFollowUpsDone) {
                        toast.info("All 3-month follow-ups completed. No further follow-ups required.");
                        return;
                    }

                    if (follow_up_status === "Due") {
                        const today = new Date();

                        if (displayDueDate && displayDueDate > today) {
                            // ✅ Future due date → only show toast
                            toast.info(
                                `Follow-up will be available on ${formatToDDMMYYYY(displayDueDate)}`
                            );
                        } else {
                                    
                            if (row.originalRecord.follow_up_1 === "pending"){

                                handleSubmitFollowUp({
                                    ...row,
                                    followUpDueDate: displayDueDate,
                                });
                            }
                            // ✅ Due date passed → open form
                           
                        }

                    } else if (follow_up_status === "Completed") {

                        const today = new Date();

                        if (displayLastDate && displayLastDate > today) {
                            toast.info(
                                `Follow-up will be available on ${formatToDDMMYYYY(displayLastDate)}`
                            );
                        } else {        
                            if (row.originalRecord.follow_up_1 === "completed" ){
                                handleSubmitFollowUp({
                                    ...row,
                                    followUpDueDate: displayLastDate,
                                });
                            }
                            else{
                                toast.info(
                                    `Follow-up will be completed on ${formatToDDMMYYYY(displayLastDate)}`
                                );
                            }
                           
                        }

                        // Completed → directly open form if needed
                        // handleSubmitFollowUp(row);

                    } else if (follow_up_status === "Pending") {
                        toast.info(
                            `${followUpDuration} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"
                            }`
                        );
                    }
                };

                const PatientDetails = () => {
                    console.log(row);
                }

                let statusText = "";
                const statusClass = follow_up_status.toLowerCase();

                if (follow_up_status === "Pending") {
                    statusText = `Pending`;
                } else if (follow_up_status === "Due") {
                    statusText = ` Due`;
                } else if (follow_up_status === "Completed") {
                    statusText = ` Completed`;
                }

                return (
                    <div className="follow-up-cell">
                        <div
                            className={`follow-up-content ${follow_up_status !== "Completed" ? "clickable" : ""}`}
                            onClick={follow_up_status !== "Completed" ? handleClick : handleClick}
                            title={follow_up_status === "Due" ? `Click to check ${followUpDuration} follow-up` : follow_up_status === "Pending"
                                ? `${followUpDuration} follow-up available on ${displayDueDate ? formatToDDMMYYYY(displayDueDate) : "N/A"
                                }`
                                : "All follow-ups completed"
                            }
                        >
                            <span className={`follow-up-status ${statusClass}`}>
                                {statusText} <small>({followUpDuration})</small>
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
                );
            },
        }
    ];

    const handleAddNew = () => {
        localStorage.removeItem("stepFormData");
        navigate("/user/survey", {
            state: {
                isUpdate: false,
                initialData: null,
            },
        });
    };

    return (
        <UserLayout>
            <div className="doctor-dashboard">
                {/* <MessageBanner message="Your Previous data is safe. We're fixing a backend issue, and it will reappear soon. You can continue submitting." /> */}

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
    );
};

export default UserDashboard;