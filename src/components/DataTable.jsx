"use client";

import { useState, useMemo, useEffect } from "react";
import {
    FaEye, FaEdit, FaTrash, FaFileCsv,
    FaSearch, FaDownload, FaPlus, FaFileUpload,
    FaFileDownload, FaFilter, FaTimes, FaFileExcel
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Download, Upload, FilePlus, FileText, MousePointerClick, CalendarCheck } from "lucide-react";
import { Hand } from 'lucide-react';
import { CiFilter } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { IoFilterOutline } from "react-icons/io5";
import { GoSortAsc, GoSortDesc } from "react-icons/go";
import { DatePicker } from "antd";
import * as XLSX from "xlsx";
import ExportModal from "./ExportModal";
import { toast } from 'react-toastify';
import "./DataTable.css";
import FileUploadConfirmationModal from "./FileUploadConfirmationModal";
import { apiGet } from "../services/api-helper"; // Ensure this is available
import { handleExport } from "../utils/exportPatients";
import { apiRequest } from "../services/api-helper"; // Added to imports
import { Navigate } from "react-router-dom";
import { Tooltip } from "antd";




const DataTable = ({
    data = [],
    columns = [],
    showSearch = true,
    showAddNew = true,
    showDownloadSample = true,
    showUploadExcel = true,
    showExport = true,
    showDirectExport = true,
    showDownloadSubadmin = true,
    showaddsubadmin = true,
    onAddNew,
    onDownloadSample,
    onUploadExcel,
    searchPlaceholder = "Search...",
    exportFileName = "data_export",
    rowsPerPageOptions = [10, 25, 50],
    defaultRowsPerPage = 10,
    loadPatientRecords,
    showTodayUpdated = false,
    todayUpdatedCount = 0,
    loading = false,
    onTodayUpdated = () => { },


}) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [loadingStates, setLoadingStates] = useState({
        addNew: false,
        downloadSample: false,
        uploadExcel: false,
        export: false,
        directExport: false
    });
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState("csv");
    const [dateRange, setDateRange] = useState([null, null]);
    const [gender, setGender] = useState("all");
    const [ageRange, setAgeRange] = useState({ min: "", max: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const [isExporting, setIsExporting] = useState(false);
    const [permissions, setPermissions] = useState({
        download_patient_data: "Disabled",
        download_doctor_data: "Disabled",
    });

    const fetchPermissions = async () => {
        try {
            const adminId = sessionStorage.getItem("adminId");
            const role = sessionStorage.getItem("adminRole"); // Changed from "role" to "adminRole" to match your login code

            console.log("Fetching permissions for:", { adminId, role }); // Debug log

            if (!adminId) {
                throw new Error("Admin ID not found in session");
            }

            if (!role) {
                throw new Error("User role not found in session");
            }

            // Admins get all permissions by default
            if (role === "admin") {
                console.log("User is admin, granting all permissions"); // Debug log
                setPermissions({
                    download_patient_data: "Enabled",
                    download_doctor_data: "Enabled",
                });
                return;
            }

            // For subadmins, fetch permissions from API
            console.log("Fetching permissions for subadmin"); // Debug log
            const response = await apiRequest(`/subadmins/${adminId}/permissions`);

            if (!response) {
                throw new Error("Empty response from permissions API");
            }

            console.log("Permissions API response:", response); // Debug log

            setPermissions({
                download_patient_data: response.permissions?.download_patient_data || "Disabled",
                download_doctor_data: response.permissions?.download_doctor_data || "Disabled",
            });

        } catch (error) {
            console.error("Permission fetch error:", error);

            // More specific error messages
            let errorMessage = "Failed to fetch permissions";
            if (error.message.includes("Network Error")) {
                errorMessage = "Network error - please check your connection";
            } else if (error.response?.status === 401) {
                errorMessage = "Session expired - please login again";
            } else if (error.response?.status === 403) {
                errorMessage = "You don't have permission to access this resource";
            }

            setPermissions({
                download_patient_data: "Disabled",
                download_doctor_data: "Disabled",
            });

            toast.error(`${errorMessage}. Contact admin.`);
        }
    };

    useEffect(() => {
        // Fetch permissions when component mounts and when showExport/showDirectExport changes
        if (showExport || showDirectExport) {
            fetchPermissions();
        }
    }, [showExport, showDirectExport]);
    // This triggers the actual export
    const onExport = async (filters) => {
        if (permissions.download_patient_data === "Disabled") {
            toast.error("You don't have access to download patient data. Please contact admin.");
            return;
        }

        // Start loading
        setLoadingStates((prev) => ({ ...prev, export: true }));

        try {
            // Call export utility
            await handleExport(filters, "PatientDataExport", setShowExportModal);
           // toast.success("Patient data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export patient data");
        } finally {
            // Stop loading
            setLoadingStates((prev) => ({ ...prev, export: false }));
        }
    };

    const [uploadedData, setUploadedData] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`${exportFileName}_uploadedData`);
            return savedData ? JSON.parse(savedData) : [];
        }
        return [];
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`${exportFileName}_uploadedData`, JSON.stringify(uploadedData));
        }
    }, [uploadedData, exportFileName]);

    const clearAllData = () => {
        setUploadedData([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`${exportFileName}_uploadedData`);
        }
        toast.success("All data has been cleared");
    };

    const combinedData = useMemo(() => {
        const combined = [...data, ...uploadedData];
        return combined.map((item, index) => ({
            ...item,
            'S.No': index + 1
        }));
    }, [data, uploadedData]);

    const filteredData = useMemo(() => {
        let result = [...combinedData];

        if (searchTerm) {
            const normalizedSearch = searchTerm.toLowerCase().replace(/\s/g, "");

            result = result.filter((row) => {
                return columns.some((col) => {
                    if (col.searchable === false) return false;
                    const value = row[col.key];
                    if (value === undefined || value === null) return false;

                    const normalizedValue = String(value).toLowerCase().replace(/\s/g, "");
                    return normalizedValue.includes(normalizedSearch);
                });
            });
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [combinedData, columns, searchTerm, sortConfig]);


    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const isTableEmpty = combinedData.length === 0;

    const requestSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc';
        setSortConfig({ key, direction });
    };

    const handleAction = async (actionName, actionFn) => {
        setLoadingStates(prev => ({ ...prev, [actionName]: true }));
        try {
            await actionFn?.();
        } finally {
            setLoadingStates(prev => ({ ...prev, [actionName]: false }));
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoadingStates(prev => ({ ...prev, uploadExcel: true }));

        try {
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
            const doctorId = currentUser?.id || "";
            const doctorEmail = currentUser?.email || "unknown@doctor.com";

            console.log("Uploading Excel file:", file);

            // Read and parse Excel file
            const data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(new Uint8Array(e.target.result));
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsArrayBuffer(file);
            });

            const workbook = XLSX.read(data, { type: 'array' });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            console.log("Parsed Excel data:", jsonData);

            // Upload data
            const response = await apiRequest('/patients/bulk-upload', {
                method: 'POST',
                body: JSON.stringify({
                    patients: jsonData.map(p => ({
                        ...p,
                        doctor_id: doctorId,
                        doctor_email: doctorEmail
                    }))
                })
            });

            console.log("API Response:", response);

            // Check if the response indicates success
            // Adjust this condition based on your API's actual response structure
            if (response.success === false || response.error) {
                throw new Error(response.message || response.error || "Upload failed");
            }

            // SUCCESS - show toast and reload
            const recordCount = jsonData.length;
            console.log("Triggering success toast for", recordCount, "patients");
            toast.success(`${recordCount} ${recordCount === 1 ? 'patient' : 'patients'} imported successfully!`, {
                toastId: 'excel-upload-success'
            });

            // Clear patientRecords and reload data
            localStorage.removeItem("patientRecords");
            if (loadPatientRecords) {
                console.log("Calling loadPatientRecords to refresh data");
                await loadPatientRecords();
            } else {
                console.warn("loadPatientRecords not provided as prop");
            }

        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.message === "Processed 1 patients."
                ? "1 patient imported successfully, but marked as error by server."
                : error.message || "Failed to import patients");
        } finally {
            setLoadingStates(prev => ({ ...prev, uploadExcel: false }));
            event.target.value = ''; // Reset file input
        }
    };

    const handleConfirmUpload = () => {
        setUploadedData(prev => [...prev, ...previewData]);
        toast.success(`${previewData.length} records uploaded successfully!`);
        clearUploadState();
    };

    const handleCancelUpload = () => {
        clearUploadState();
    };

    const clearUploadState = () => {
        setPreviewData([]);
        setSelectedFile(null);
        setShowUploadConfirmModal(false);
    };

    const clearUploadedData = () => {
        setUploadedData([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`${exportFileName}_uploadedData`);
        }
    };


    const renderCellContent = (row, column) => {


        // ✅ Handle Request Data column ONLY
        if (column.key === "Request Data" && typeof column.render === "function") {
            return column.render(row);
        }
        
        if (column.actions) {
            return (
                <div className="action-buttons">
                    {column.actions.map((action, index) => (
                        <button
                            key={index}
                            className={`action-btn ${action.name}-btn`}
                            onClick={() => action.handler(row)}
                            title={action.title}
                            disabled={loadingStates[action.name]}
                        >
                            {loadingStates[action.name] ? (
                                <div className="spinner-small" />
                            ) : (
                                action.icon
                            )}
                        </button>
                    ))}
                </div>
            );
        }

        if (column.render) {
            return column.render(row[column.key], row);
        }

        return row[column.key];
    };

    const handleDownloadSamplefile = () => {

        setLoadingStates(prev => ({ ...prev, downloadSample: true }));
        try {

            const link = document.createElement('a');

            link.href = '../patient_details_sample2.xlsx'; // Public folder path

            link.download = 'patient_details_sample2.xlsx'; // Force correct file name

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);



            toast.success("Sample file with all fields downloaded successfully!");

        } catch (error) {

            console.error("Error generating sample file:", error);

            toast.error("Failed to download sample file");

        } finally {

            setLoadingStates(prev => ({ ...prev, downloadSample: false }));

        }

    };


    const handleDownloadSample = () => {
        setLoadingStates(prev => ({ ...prev, downloadSample: true }));

        try {
            // Define all fields from StepForm.jsx initialFormState
            const allFields = [
                // Basic fields
                'sNo',
                'patientId',
                'patientName',
                'appointmentDate',
                'submissionDate',
                'status',
                'lastVisit',
                'followUpStatus',
                'followUpDate',
                // Section 1
                'section1_patient_name',
                'section1_address',
                'section1_locality',
                'section1_age',
                'section1_gender',
                'section1_facilityName',
                'section1_facilityLocation',
                'section1_facilityType',
                'section1_facilityState',
                'section1_education',
                'section1_occupation',
                'section1_maritalStatus',
                'section1_monthlyIncome',
                'section1_familyMembers',
                'section1_dependents',
                'section1_diabetesType',
                'section1_diabetesDuration',
                'section1_hasUlcer',
                // 'section1_ulcerDuration',
                'section1_hasAmputation',
                // 'section1_amputationDuration',
                'section1_hasAngioplasty',
                // 'section1_angioplastyDuration',
                'section1_smoking',
                'section1_alcohol',
                'section1_tobacco',
                'section1_Renal',
                'section1_retinal',
                'section1_cardiovascular',
                'section1_cerebrovascular',
                // 'section1_imbIschemia',
                'section1_hypertension',
                // Section 2
                'section2_Assessment',
                'section2_attendedBefore',
                'section2_facilityVisited',
                'section2_intervalToAssessment',
                'section2_referredBy',
                'section2_treatedDays',
                'section2_referredInDays',
                'section2_visitedInDays',
                'section2_necrosis',
                'section2_gangrene',
                'section2_gangreneType',
                'section2_probetobone',
                'section2_osteomyelitis',
                'section2_sepsis',
                'section2_arterialStenosis',
                'section2_infection',
                'section2_swelling',
                'section2_erythema',
                'section2_tenderness',
                'section2_warmth',

                'section2_cultureReport',
                'section2_woundSize',
                'section2_woundLocation',
                'section2_woundDuration',
                'section2_woundClassification',
                'section2_other_treatment',
                'section2_other_treatment_details',
                'section2_dressingMaterial',
                'section2_offloadingDevice',
                'section2_hospitalization',
                'section2_amputation',
                // 'section2_amputationType',
                'section2_amputationLevel',
                'section2_debridementWithAmputation',


                // Section 3
                'section3_burningSensation',
                'section3_painWhileWalking',
                'section3_skinChanges',
                'section3_sensationLoss',
                'section3_nailProblems',
                'section3_fungalInfection',
                'section3_skinLesions',
                'section3_openCrack',
                // 'section3_cellulitis',
                'section3_monofilamentLeftA',
                'section3_monofilamentLeftB',
                'section3_monofilamentLeftC',
                'section3_monofilamentRightA',
                'section3_monofilamentRightB',
                'section3_monofilamentRightC',
                'section3_footDeformities',
                // 'section3_deformityDuration',
                'section3_hairLoss',
                'section3_pulsesPalpable',
                'section3_skinTemperature',
                // 'section3_ulcerPresence'

                //Section 4
                'section4_survivalStatus',
                'section4_woundHealed',
                'section4_healingTime',
                'section4_nonHealingReason',
                'section4_surgicalIntervention',
                'section4_amputationPerformed',
                'section4_hospitalVisits',
                'section4_hospitalized',
                'section4_hospitalStayLength',
                'section4_deathDate',
                'section4_deathReason',
                'section4_activeUlcer',
                
            ];

            // Create headers with friendly names
            const headers = allFields.reduce((acc, field) => {
                let friendlyName = field
                    .replace('section1_', '')
                    .replace('section2_', '')
                    .replace('section3_', '')
                    .replace('section4_', '')
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();

                // Special cases
                switch (field) {
                    case 'sNo': friendlyName = 'Serial Number'; break;
                    case 'patientId': friendlyName = 'Patient ID'; break;
                    case 'patientName': friendlyName = 'Patient Name'; break;
                    case 'appointmentDate': friendlyName = 'Appointment Date'; break;
                    case 'submissionDate': friendlyName = 'Submission Date'; break;
                    case 'status': friendlyName = 'Status'; break;
                    case 'lastVisit': friendlyName = 'Last Visit'; break;
                    case 'followUpStatus': friendlyName = 'Follow-Up Status'; break;
                    case 'followUpDate': friendlyName = 'Follow-Up Date'; break;
                    case 'section1_patient_name': friendlyName = 'Patient Name'; break;
                    case 'section1_facilityName': friendlyName = 'Facility Name'; break;
                    case 'section1_facilityLocation': friendlyName = 'Facility Location'; break;
                    case 'section1_facilityType': friendlyName = 'Facility Type'; break;
                    case 'section1_facilityState': friendlyName = 'Facility State'; break;
                    case 'section1_monthlyIncome': friendlyName = 'Monthly Income'; break;
                    case 'section1_familyMembers': friendlyName = 'Family Members'; break;
                    case 'section1_diabetesType': friendlyName = 'Diabetes Type'; break;
                    case 'section1_diabetesDuration': friendlyName = 'Diabetes Duration'; break;
                    case 'section1_hasUlcer': friendlyName = 'Has Ulcer'; break;
                    // case 'section1_ulcerDuration': friendlyName = 'Ulcer Duration'; break;
                    case 'section1_hasAmputation': friendlyName = 'Has Amputation'; break;
                    // case 'section1_amputationDuration': friendlyName = 'Amputation Duration'; break;
                    case 'section1_hasAngioplasty': friendlyName = 'Has Angioplasty'; break;
                    // case 'section1_angioplastyDuration': friendlyName = 'Angioplasty Duration'; break;
                    case 'section1_imbIschemia': friendlyName = 'Limb Ischemia'; break;
                    case 'section2_Assessment': friendlyName = 'First Assessment'; break;
                    case 'section2_attendedBefore': friendlyName = 'Attended Before'; break;
                    case 'section2_facilityVisited': friendlyName = 'Facility Visited'; break;
                    case 'section2_intervalToAssessment': friendlyName = 'Interval to Assessment'; break;
                    case 'section2_referredBy': friendlyName = 'Referred By'; break;
                    case 'section2_treatedDays': friendlyName = 'Treated Days'; break;
                    case 'section2_referredInDays': friendlyName = 'Referred In Days'; break;
                    case 'section2_visitedInDays': friendlyName = 'Visited In Days'; break;
                    case 'section2_gangreneType': friendlyName = 'Gangrene Type'; break;
                    case 'section2_probetobone': friendlyName = 'Bone Exposure'; break;
                    case 'section2_arterialStenosis': friendlyName = 'Arterial Issues'; break;
                    case 'section2_woundSize': friendlyName = 'Wound Size'; break;
                    case 'section2_woundLocation': friendlyName = 'Wound Location'; break;
                    case 'section2_woundDuration': friendlyName = 'Wound Duration'; break;
                    case 'section2_woundClassification': friendlyName = 'Wound Classification'; break;
                    case 'section2_other_treatment': friendlyName = 'Other Treatment'; break;
                    case 'section2_other_treatment_details': friendlyName = 'Other Treatment Details'; break;
                    case 'section2_dressingMaterial': friendlyName = 'Dressing Material'; break;
                    case 'section2_offloadingDevice': friendlyName = 'Offloading Device'; break;
                    // case 'section2_amputationType': friendlyName = 'Amputation Type'; break;
                    case 'section2_amputationLevel': friendlyName = 'Amputation Level'; break;
                    case 'section2_debridementWithAmputation': friendlyName = 'Debridement with Amputation'; break;


                    case 'section3_burningSensation': friendlyName = 'Burning Sensation'; break;
                    case 'section3_painWhileWalking': friendlyName = 'Pain While Walking'; break;
                    case 'section3_skinChanges': friendlyName = 'Skin Changes'; break;
                    case 'section3_sensationLoss': friendlyName = 'Sensation Loss'; break;
                    case 'section3_nailProblems': friendlyName = 'Nail Problems'; break;
                    case 'section3_fungalInfection': friendlyName = 'Fungal Infection'; break;
                    case 'section3_skinLesions': friendlyName = 'Skin Lesions'; break;
                    case 'section3_openCrack': friendlyName = 'Open Wound'; break;
                    case 'section3_monofilamentLeftA': friendlyName = 'Monofilament Left A'; break;
                    case 'section3_monofilamentLeftB': friendlyName = 'Monofilament Left B'; break;
                    case 'section3_monofilamentLeftC': friendlyName = 'Monofilament Left C'; break;
                    case 'section3_monofilamentRightA': friendlyName = 'Monofilament Right A'; break;
                    case 'section3_monofilamentRightB': friendlyName = 'Monofilament Right B'; break;
                    case 'section3_monofilamentRightC': friendlyName = 'Monofilament Right C'; break;
                    case 'section3_footDeformities': friendlyName = 'Foot Deformities'; break;
                    // case 'section3_deformityDuration': friendlyName = 'Deformity Duration'; break;
                    case 'section3_hairLoss': friendlyName = 'Hair Growth'; break;
                    case 'section3_pulsesPalpable': friendlyName = 'Pulses Palpable'; break;
                    case 'section3_skinTemperature': friendlyName = 'Skin Temperature'; break;
                    // case 'section3_ulcerPresence': friendlyName = 'Ulcer Presence'; break;

                    case 'section4_survivalStatus': friendlyName = 'Survival Status'; break;
                    case 'section4_woundHealed': friendlyName = 'Wound Healed'; break;
                    case 'section4_healingTime': friendlyName = 'HealingTime'; break;
                    case 'section4_nonHealingReason': friendlyName = 'Non Healing Reason'; break;
                    case 'section4_surgicalIntervention': friendlyName = 'Surgical Intervention'; break;
                    case 'section4_amputationPerformed': friendlyName = 'Amputation Performed'; break;
                    case 'section4_hospitalVisits': friendlyName = 'Hospital Visits'; break;
                    case 'section4_hospitalized': friendlyName = 'Hospitalized'; break;
                    case 'section4_hospitalStayLength': friendlyName = 'Hospital Stay Length'; break;
                    case 'section4_deathDate': friendlyName = 'Death Date'; break;
                    case 'section4_deathReason': friendlyName = 'Death Reason'; break;
                    case 'section4_activeUlcer': friendlyName = 'Active Ulcer'; break;
                }

                acc[field] = friendlyName;
                return acc;
            }, {});

            // Create example data row with realistic values
            const exampleRow = allFields.reduce((acc, field) => {
                let exampleValue = '';

                switch (field) {
                    // Basic fields
                    case 'sNo': exampleValue = '1'; break;
                    case 'patientId': exampleValue = 'PAT12345'; break;
                    case 'patientName': exampleValue = 'John Doe'; break;
                    case 'appointmentDate': exampleValue = '2025-05-15'; break;
                    case 'submissionDate': exampleValue = '2025-05-15'; break;
                    case 'status': exampleValue = 'Completed'; break;
                    case 'lastVisit': exampleValue = '2025-05-10'; break;
                    case 'followUpStatus': exampleValue = 'Pending'; break;
                    case 'followUpDate': exampleValue = '2025-11-15'; break;
                    // Section 1
                    case 'section1_patient_name': exampleValue = 'John Doe'; break;
                    case 'section1_address': exampleValue = '123 Main St'; break;
                    case 'section1_locality': exampleValue = 'Downtown'; break;
                    case 'section1_age': exampleValue = '55'; break;
                    case 'section1_gender': exampleValue = 'Male'; break;
                    case 'section1_facilityName': exampleValue = 'City Hospital'; break;
                    case 'section1_facilityLocation': exampleValue = 'Mumbai'; break;
                    case 'section1_facilityType': exampleValue = 'Public'; break;
                     case 'section1_facilityState': exampleValue = 'tamil nadu'; break;
                    case 'section1_education': exampleValue = 'Graduate'; break;
                    case 'section1_occupation': exampleValue = 'Teacher'; break;
                    case 'section1_maritalStatus': exampleValue = 'Married'; break;
                    case 'section1_monthlyIncome': exampleValue = '50000'; break;
                    case 'section1_familyMembers': exampleValue = '4'; break;
                    case 'section1_dependents': exampleValue = '2'; break;
                    case 'section1_diabetesType': exampleValue = 'Type 2'; break;
                    case 'section1_diabetesDuration': exampleValue = '10'; break;
                    case 'section1_hasUlcer': exampleValue = 'Yes'; break;
                    // case 'section1_ulcerDuration': exampleValue = '2'; break;
                    case 'section1_hasAmputation': exampleValue = 'No'; break;
                    // case 'section1_amputationDuration': exampleValue = ''; break;
                    case 'section1_hasAngioplasty': exampleValue = 'No'; break;
                    // case 'section1_angioplastyDuration': exampleValue = ''; break;
                    case 'section1_smoking': exampleValue = 'No'; break;
                    case 'section1_alcohol': exampleValue = 'No'; break;
                    case 'section1_tobacco': exampleValue = 'No'; break;
                    case 'section1_Renal': exampleValue = 'No'; break;
                    case 'section1_retinal': exampleValue = 'No'; break;
                    case 'section1_cardiovascular': exampleValue = 'Yes'; break;
                    case 'section1_cerebrovascular': exampleValue = 'No'; break;
                    case 'section1_imbIschemia': exampleValue = 'No'; break;
                    case 'section1_hypertension': exampleValue = 'Yes'; break;
                    // Section 2
                    case 'section2_Assessment': exampleValue = '2025-05-01'; break;
                    case 'section2_attendedBefore': exampleValue = 'Yes'; break;
                    case 'section2_facilityVisited': exampleValue = 'General Hospital'; break;
                    case 'section2_intervalToAssessment': exampleValue = '6'; break;
                    case 'section2_referredBy': exampleValue = 'Dr. Smith'; break;
                    case 'section2_treatedDays': exampleValue = '30'; break;
                    case 'section2_referredInDays': exampleValue = '5'; break;
                    case 'section2_visitedInDays': exampleValue = '7'; break;
                    case 'section2_necrosis': exampleValue = 'No'; break;
                    case 'section2_gangrene': exampleValue = 'No'; break;
                    case 'section2_gangreneType': exampleValue = ''; break;
                    case 'section2_probetobone': exampleValue = 'No'; break;
                    case 'section2_osteomyelitis': exampleValue = 'No'; break;
                    case 'section2_sepsis': exampleValue = 'No'; break;
                    case 'section2_arterialStenosis': exampleValue = 'No'; break;
                    case 'section2_infection': exampleValue = 'No'; break;
                    case 'section2_swelling': exampleValue = 'Yes'; break;
                    case 'section2_erythema': exampleValue = 'No'; break;
                    case 'section2_tenderness': exampleValue = 'Yes'; break;
                    case 'section2_warmth': exampleValue = 'No'; break;

                    case 'section2_cultureReport': exampleValue = 'Negative'; break;
                    case 'section2_woundSize': exampleValue = '2x3 cm'; break;
                    case 'section2_woundLocation': exampleValue = 'Left Foot'; break;
                    case 'section2_woundDuration': exampleValue = '3'; break;
                    case 'section2_woundClassification': exampleValue = 'Grade 1'; break;
                    case 'section2_other_treatment': exampleValue = 'Yes'; break;
                    case 'section2_other_treatment_details': exampleValue = 'Daily dressing'; break;
                    case 'section2_dressingMaterial': exampleValue = 'Hydrocolloid'; break;
                    case 'section2_offloadingDevice': exampleValue = 'Orthotic Shoe'; break;
                    case 'section2_hospitalization': exampleValue = 'No'; break;
                    case 'section2_amputation': exampleValue = 'No'; break;
                    // case 'section2_amputationType': exampleValue = ''; break;
                    case 'section2_amputationLevel': exampleValue = ''; break;
                    case 'section2_debridementWithAmputation': exampleValue = 'No'; break;


                    // Section 3
                    case 'section3_burningSensation': exampleValue = 'No'; break;
                    case 'section3_painWhileWalking': exampleValue = 'Yes'; break;
                    case 'section3_skinChanges': exampleValue = 'No'; break;
                    case 'section3_sensationLoss': exampleValue = 'No'; break;
                    case 'section3_nailProblems': exampleValue = 'No'; break;
                    case 'section3_fungalInfection': exampleValue = 'No'; break;
                    case 'section3_skinLesions': exampleValue = 'No'; break;
                    case 'section3_openCrack': exampleValue = 'Yes'; break;
                    // case 'section3_cellulitis': exampleValue = 'No'; break;
                    case 'section3_monofilamentLeftA': exampleValue = 'Yes'; break;
                    case 'section3_monofilamentLeftB': exampleValue = 'Yes'; break;
                    case 'section3_monofilamentLeftC': exampleValue = 'No'; break;
                    case 'section3_monofilamentRightA': exampleValue = 'Yes'; break;
                    case 'section3_monofilamentRightB': exampleValue = 'Yes'; break;
                    case 'section3_monofilamentRightC': exampleValue = 'No'; break;
                    case 'section3_footDeformities': exampleValue = 'No'; break;
                    // case 'section3_deformityDuration': exampleValue = ''; break;
                    case 'section3_hairLoss': exampleValue = 'Normal'; break;
                    case 'section3_pulsesPalpable': exampleValue = 'Yes'; break;
                    case 'section3_skinTemperature': exampleValue = 'Normal'; break;
                    // case 'section3_ulcerPresence': exampleValue = 'Yes'; break;

                    //section 4
                    case 'section4_survivalStatus': friendlyName = 'Alive'; break;
                    case 'section4_woundHealed': friendlyName = 'Yes'; break;
                    case 'section4_healingTime': friendlyName = '0'; break;
                    case 'section4_nonHealingReason': friendlyName = 'No'; break;
                    case 'section4_surgicalIntervention': friendlyName = 'No'; break;
                    case 'section4_amputationPerformed': friendlyName = 'No'; break;
                    case 'section4_hospitalVisits': friendlyName = '1'; break;
                    case 'section4_hospitalized': friendlyName = 'Yes'; break;
                    case 'section4_hospitalStayLength': friendlyName = '1'; break;
                    case 'section4_deathDate': friendlyName = '2025-05-01'; break;
                    case 'section4_deathReason': friendlyName = 'Yes'; break;
                    case 'section4_activeUlcer': friendlyName = 'Yes'; break;
                }

                acc[field] = exampleValue;
                return acc;
            }, {});

            // Create worksheet with headers and example row
            const ws = XLSX.utils.json_to_sheet([headers, exampleRow], { skipHeader: true });

            // Style headers (bold)
            if (ws['!ref']) {
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
                    if (ws[headerCell]) {
                        ws[headerCell].s = { font: { bold: true } };
                    }
                }
            }

            // Set column widths based on content
            ws['!cols'] = allFields.map(field => ({
                wch: Math.max(
                    10, // Minimum width
                    Math.min(
                        50, // Maximum width
                        field.length,
                        headers[field]?.length || 0,
                        String(exampleRow[field] || '').length
                    )
                )
            }));

            // Create workbook and download
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sample Data");
            XLSX.writeFile(wb, `${exportFileName}_complete_sample.xlsx`);

            toast.success("Sample file with all fields downloaded successfully!");
        } catch (error) {
            console.error("Error generating sample file:", error);
            toast.error("Failed to download sample file");
        } finally {
            setLoadingStates(prev => ({ ...prev, downloadSample: false }));
        }
    };

    const handleDirectExport = async () => {
        if (permissions.download_doctor_data === "Disabled") {
            toast.error("You don't have access to download doctor data. Please contact admin.");
            return;
        }
        setLoadingStates(prev => ({ ...prev, directExport: true }));

        try {
            console.log("Starting doctor export...");
            const response = await apiGet('/doctors');
            console.log("API response:", response);

            const rawDoctors = response?.data || response;

            if (!Array.isArray(rawDoctors)) {
                throw new Error("Invalid data format received from API");
            }

            // Sort doctors by update time, latest first
            const sortedDoctors = [...rawDoctors].sort((a, b) =>
                new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
            );

            const doctorsWithSNo = sortedDoctors.map((doc, index) => ({ ...doc, sNo: index + 1 }));

            // Define the headers to match the fields
            const headers = [
                "S.No", "Doctor Name", "Education", "Specialty", "Experience Years",
                "Facility Name", "Facility Address", "Facility State", "Facility Type",
                "Patients/Day", "Patients/Week",
                "Diabetologist", "General Practitioner", "General Surgeon",
                "Orthopaedic Surgeon", "Podiatric Surgeon", "Vascular Surgeon",
                "Infectious Specialist", "Podiatrist", "Diabetes Nurse", "Pedorthist",
                "Referring Patients", "Referring Specialist", "Referring Surgical",
                "Surgical Procedure", "Receiving Referrals",
                "Email", "Phone", "Status", "Created At", "Updated At"
            ];

            // Convert to worksheet data
            const worksheetData = [
                headers,
                ...doctorsWithSNo.map(doc => [
                    doc.sNo,
                    doc.doctors_name,
                    doc.education,
                    doc.specialty,
                    doc.experience_years,
                    doc.facility_name,
                    doc.facility_address,
                    doc.facility_state,
                    doc.facility_type,
                    doc.patients_per_day,
                    doc.patients_per_week,

                    doc.diabetologist ? "Yes" : "No",
                    doc.generalPractitioner ? "Yes" : "No",
                    doc.generalSurgeon ? "Yes" : "No",
                    doc.orthopaedicSurgeon ? "Yes" : "No",
                    doc.podiatricSurgeon ? "Yes" : "No",
                    doc.vascularSurgeon ? "Yes" : "No",
                    doc.infectiousSpecialist ? "Yes" : "No",
                    doc.podiatrist ? "Yes" : "No",
                    doc.diabetesNurse ? "Yes" : "No",
                    doc.pedorthist ? "Yes" : "No",

                    doc.referring_patients || "",
                    doc.referring_specialist || "",
                    doc.referring_surgical || "",
                    doc.surgical_procedure || "",
                    doc.receiving_referrals || "",

                    doc.email,
                    doc.phone,
                    doc.status,
                    doc.created_at,
                    doc.updated_at
                ])
            ];

            // Create Excel sheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            // Auto column widths
            const colWidths = headers.map((header, index) => {
                const maxContentLength = Math.max(
                    header.length,
                    ...worksheetData.slice(1).map(row => String(row[index]).length)
                );
                return { wch: Math.min(Math.max(maxContentLength, 10), 50) };
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, "Doctors");
            XLSX.writeFile(wb, `Doctors_${new Date().toISOString().slice(0, 10)}.xlsx`);

            toast.success("Doctors data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export doctors data");
        } finally {
            setLoadingStates(prev => ({ ...prev, directExport: false }));
        }
    };
    const navigate = useNavigate();
    const handleDownloadSubadmin = async () => {
        setLoadingStates(prev => ({ ...prev, subadminExport: true }));

        try {
            console.log("Starting subadmin export...");
            const response = await apiGet('/subadmins');  // Your subadmin API endpoint
            console.log("API response:", response);

            const rawSubadmins = response?.data || response;

            if (!Array.isArray(rawSubadmins)) {
                throw new Error("Invalid data format received from API");
            }

            if (rawSubadmins.length === 0) {
                toast.info("No sub-admin data available to download.");
                return;
            }

            const sortedSubadmins = [...rawSubadmins].sort((a, b) => a.id - b.id);

            const subadminsWithSNo = sortedSubadmins.map((subadmin, index) => ({
                ...subadmin,
                sNo: index + 1,
            }));

            const headers = [
                "S.NO",
                "ID",
                "Name",
                "Email",
                "Status",
                "Download Patient Data",
                "Download Doctor Data",
                "Delete Doctors"
            ];

            const worksheetData = [
                headers,
                ...subadminsWithSNo.map(subadmin => [
                    subadmin.sNo,
                    subadmin.id,
                    subadmin.name,
                    subadmin.username,
                    subadmin.status,
                    subadmin.download_patient_data !== "Disabled" ? "Enabled" : "Disabled",
                    subadmin.download_doctor_data !== "Disabled" ? "Enabled" : "Disabled",
                    subadmin.delete_doctors !== "Disabled" ? "Enabled" : "Disabled"
                ])
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            const colWidths = headers.map((header, idx) => {
                const maxLength = Math.max(
                    header.length,
                    ...worksheetData.slice(1).map(row => String(row[idx]).length)
                );
                return { wch: Math.min(Math.max(maxLength, 10), 50) };
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, "Subadmins");
            XLSX.writeFile(wb, `Subadmins_${new Date().toISOString().slice(0, 10)}.xlsx`);

            toast.success("Subadmin data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export subadmin data");
        } finally {
            setLoadingStates(prev => ({ ...prev, subadminExport: false }));
        }
    };

    const handleAddSubadmin = () => {
        navigate("/admin/SubadminForm"); // ✅ route to your Subadmin form
    };

    return (
        <div className="data-table-container">
            <div className="table-controls">

                {/* SearchBar */}
                <div className="controls-group">
                    {showSearch && (
                        <div className="search-container">
                            <div className="search-input-container">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    id="search-input"
                                />
                                <label htmlFor="search-input" className="floating-label">
                                    {searchPlaceholder}
                                </label>
                                {searchTerm && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchTerm("")}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-buttons-container">
                    
                    {showTodayUpdated && (
                        <Tooltip title="Showing today's updated records">
                            <a
                                className="today-updated action-btn"
                                onClick={onTodayUpdated}
                                disabled={loadingStates.todayUpdated || loading} // Use both loading states
                                id="today-updated-button"
                                style={{ cursor: "pointer" }}
                            >
                                {loadingStates.todayUpdated || loading ? ( // Show spinner if either is loading
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <CalendarCheck className="btn-icon" />
                                        <span className="btn-text">Today's Updates ({todayUpdatedCount})</span>
                                    </>
                                )}
                            </a>
                        </Tooltip>
                    )}
                    
                    {/* {showAddNew && (
                        <Tooltip title="Add new patient details">
                            <a
                                className="Add-new action-btn"
                                onClick={() =>
                                    toast.info(
                                        "Backend work is in progress, please check again after some time.",
                                        {
                                            position: "top-right",
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                        }
                                    )
                                }
                                aria-disabled={loadingStates.addNew}
                                id="add-data-button"
                                role="button"
                            >
                                {loadingStates.addNew ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <FilePlus className="btn-icon" />
                                        <span className="btn-text">Add Data</span>
                                        {isTableEmpty && <MousePointerClick className="mouse-click" size={20} />}
                                    </>
                                )}
                            </a>
                        </Tooltip>
                    )} */}


                    {showAddNew && (

                        <Tooltip title="Add new patient details" >
                            <a
                                className="Add-new action-btn"
                                onClick={onAddNew}
                                disabled={loadingStates.addNew}
                                id="add-data-button"
                            >
                                {loadingStates.addNew ? (
                                    <div className="spinner" />
                                ) : (
                                    <>

                                        <FilePlus className="btn-icon" />
                                        <span className="btn-text">Add Data</span>

                                        {isTableEmpty && (
                                            <MousePointerClick className="mouse-click" size={20} />
                                        )}
                                    </>
                                )}
                            </a>
                        </Tooltip>
                    )}



                    {showaddsubadmin && (
                        <a
                            className="Add-new action-btn"
                            onClick={handleAddSubadmin}
                            disabled={loadingStates.addNew}
                            id="add-data-button"
                            style={{ cursor: "pointer" }} // Optional: makes it look clickable
                        >
                            {loadingStates.addNew ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FilePlus className="btn-icon" />
                                    <span className="btn-text">Add Sub-Admin</span>

                                    {isTableEmpty && (
                                        <MousePointerClick className="mouse-click" size={20} />
                                    )}
                                </>
                            )}
                        </a>
                    )}

                    {/* {showDownloadSample && (
                        <a
                            className="sample-excel-download action-btn"
                            onClick={() => handleAction('downloadSample', handleDownloadSamplefile)}
                            disabled={loadingStates.downloadSample}
                        >
                            {loadingStates.downloadSample ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <Download className="btn-icon" />
                                    <span className="btn-text">Download Sample</span>
                                </>
                            )}
                        </a>
                    )} */}

                    {/* {showUploadExcel && (
                        <Tooltip title="Bulk upload patient data">
                            <div className="excel-upload-wrapper">


                                <input
                                    type="file"
                                    id="excel-upload-input"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="excel-upload-input"
                                    className={`excel-upload action-btn ${loadingStates.uploadExcel ? 'loading' : ''}`}
                                >
                                    {loadingStates.uploadExcel ? (
                                        <div className="spinner" />
                                    ) : (
                                        <>
                                            <FileText className="btn-icon" />
                                            <span className="btn-text">Excel Upload</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </Tooltip>
                    )} */}

                    {showExport && (
                        <a
                            className="download-excel action-btn"
                            onClick={() => {
                                if (permissions.download_patient_data === "Disabled") {
                                    toast.error("You don't have access to download patient data. Please contact admin.");
                                    return;
                                }
                                setShowExportModal(true);
                            }}
                            disabled={loadingStates.export}
                        >
                            {loadingStates.export ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <Download className="btn-icon" />
                                    <Tooltip title="Download All Patients Data ">
                                        <span className="btn-text">Excel Download</span>
                                    </Tooltip>
                                </>
                            )}
                        </a>
                    )}

                    {showDirectExport && (
                        <a
                            className="excel-upload action-btn"
                            onClick={handleDirectExport}
                            disabled={loadingStates.directExport}
                        >
                            {loadingStates.directExport ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FaFileExcel className="btn-icon" />
                                    <span className="btn-text">Download Doctor List</span>
                                </>
                            )}
                        </a>
                    )}
                    {showDownloadSubadmin && (
                        <a
                            className="excel-upload action-btn"
                            onClick={handleDownloadSubadmin}
                            disabled={loadingStates.subadminExport} // use a separate loading flag here
                        >
                            {loadingStates.subadminExport ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FaFileExcel className="btn-icon" />
                                    <span className="btn-text">Download Sub-Admins List</span>
                                </>
                            )}
                        </a>
                    )}


                </div>
            </div>

            {isTableEmpty ? (
                <div className="empty-state-container">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 17V15M12 17V13M15 17V11M5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7H15.8284C15.2979 7 14.7893 6.78929 14.4142 6.41421L12.5858 4.58579C12.2107 4.21071 11.7021 4 11.1716 4H5C3.89543 4 3 4.89543 3 6V19C3 20.1046 3.89543 21 5 21Z" stroke="#1b4332" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3>No Records Found</h3>
                        <p>It looks like there's no data available yet. Get started by adding your first record.</p>

                    </div>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            onClick={() => column.sortable !== false && requestSort(column.key)}
                                            className={column.sortable !== false ? 'sortable' : ''}
                                            aria-sort={
                                                sortConfig.key === column.key
                                                    ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            <div className="th-content">
                                                {column.header}
                                                {sortConfig.key === column.key && (
                                                    sortConfig.direction === 'asc' ?
                                                        <GoSortAsc className="sort-icon asc" /> :
                                                        <GoSortDesc className="sort-icon desc" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length > 0 ? (
                                    currentData.map((row, rowIndex) => (
                                        <tr key={row.id || rowIndex}>
                                            {columns.map((column) => (
                                                <td key={`${row.id || rowIndex}-${column.key}`}>
                                                    {renderCellContent(row, column)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan={columns.length}>
                                            <div className="no-data-message">
                                                No matching records found
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length > rowsPerPage && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="pagination-nav"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>

                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let page;
                                        if (totalPages <= 5) {
                                            page = i + 1;
                                        } else if (currentPage <= 3) {
                                            page = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i;
                                        } else {
                                            page = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                                aria-label={`Page ${page}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <span className="page-ellipsis">...</span>
                                    )}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="page-number"
                                            aria-label={`Page ${totalPages}`}
                                        >
                                            {totalPages}
                                        </button>
                                    )}
                                </div>

                                <button
                                    className="pagination-nav"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={onExport}
                isLoading={loadingStates.export}
                exportFileName={exportFileName}
                columns={columns}
                data={combinedData}
            />

            <FileUploadConfirmationModal
                visible={showUploadConfirmModal}
                fileName={selectedFile?.name}
                previewData={previewData}
                onCancel={handleCancelUpload}
                onConfirm={handleConfirmUpload}
                isLoading={loadingStates.uploadExcel}
            />
        </div>
    );
};

export default DataTable;