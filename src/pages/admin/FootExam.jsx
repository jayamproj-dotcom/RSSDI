"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DataTable from "../../components/DataTable";
import { CircleCheck, Loader, Eye, ScanEye, CalendarCheck } from "lucide-react";
import { apiGet } from "../../services/api-helper";
import { toast } from "react-toastify";
import { formatToDDMMYYYY } from "../../utils/dateUtils";
import { FaSpinner, FaSync } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";

const FootExam = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayUpdatedCount, setTodayUpdatedCount] = useState(0);
  const [loadingStates, setLoadingStates] = useState({
    refresh: false,
    todayUpdated: false,
    // Add other loading states if needed
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet("patient");
      console.log("FootExam Raw API Response:", response);
      console.log("FootExam API Response Status:", response.status);

      const patientRecords = Array.isArray(response.patients) ? response.patients : [];
      console.log("FootExam Extracted Patient Records:", patientRecords);

      if (patientRecords.length === 0) {
        console.warn("No patient records found in API response");
        toast.warn("No patient records available");
      }
      // Debugging point 4 - Log specific documents for first 3 patients
      patientRecords.slice(0, 3).forEach((patient, index) => {
        console.log(`📄 Patient ${index + 1} documents:`, {
          consentForm: patient.consentForm,
          woundReferenceFile: patient.woundReferenceFile,
          cultureReport: patient.cultureReport,
          cultureReportAvailable: patient.cultureReportAvailable,
          necrosisPhoto: patient.necrosisPhoto
        });
      });

      // Sort records by updated_at (or created_at) descending
      const sorted = [...patientRecords].sort((a, b) =>
        new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      );

      // Calculate today's updated records count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysUpdatedRecords = sorted.filter(record => {
        const updatedDate = new Date(record.updated_at || record.created_at);
        return updatedDate >= today;
      });

      setTodayUpdatedCount(todaysUpdatedRecords.length);

      // Add serial numbers AFTER sorting
      const formattedRecords = sorted.map((record, index) => ({
        sNo: index + 1,
        patientId: String(record.id) || `PAT - ${index + 1} `,
        patientName: record.patient_name || "Unknown",
        doctorEmail: record.doctor_email || "N/A",
        submissionDate: record.created_at || new Date().toISOString(),
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || record.created_at || new Date().toISOString(),
        status: record.status || "Completed",
      }));

      console.log("FootExam Formatted Records:", formattedRecords);
      setRecords(formattedRecords);
    } catch (error) {
      console.error("Error fetching patient records:", error);
      setError("Failed to load patient records. Please try again later.");
      toast.error("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchPatients, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = async () => {
    setLoadingStates(prev => ({ ...prev, refresh: true }));
    await fetchPatients();
    if (!error) {
      toast.success("Patient records refreshed successfully");
    }
    setLoadingStates(prev => ({ ...prev, refresh: false }));
  };

  const handleShowTodayUpdated = () => {
    setLoadingStates(prev => ({ ...prev, todayUpdated: true }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysRecords = records.filter(record => {
      const updatedDate = new Date(record.updated_at || record.created_at);
      return updatedDate >= today;
    });

    toast.info(`Today's updated records: ${todaysRecords.length}`);

    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, todayUpdated: false }));
    }, 1000);
  };

  const columns = [
    { key: "sNo", header: "S.NO", sortable: true },
    { key: "patientId", header: "Participant ID", sortable: true },
    {
      key: "doctorEmail",
      header: "Doctor Email",
      sortable: true,
      render: (value) => value || "N/A",
    },
    {
      key: "patientName",
      header: "Participant Name",
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created Date",
      sortable: true,
      render: (value) => {
        try {
          return formatToDDMMYYYY(value);
        } catch {
          return "N/A";
        }
      },
    },
    {
      key: "updated_at",
      header: "Updated Date",
      sortable: true,
      render: (value, record) => {
        try {
          return formatToDDMMYYYY(value || record.created_at);
        } catch {
          return "N/A";
        }
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (value) => (
        <Tooltip title="Status Completed">
          <span className={`status-badge ${value?.toLowerCase() || "completed"}`}>
            <CircleCheck size={16} />
          </span>
        </Tooltip>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (_, record) => (
        <Tooltip title="View Records">
          <Link
            to={`/admin/patient/${record.patientId || record.id}`}
            className="view-details-link"
          >
            <ScanEye className="view-details" />
          </Link>
        </Tooltip>
      ),
    }
  ];

  const handleAddNew = () => {
    console.log("Add new participant clicked");
  };

  return (
    <AdminLayout>
      <div className="manage-data-page">
        <div className="page-header">
          <h1>RSSDI Save the Feet 2.0</h1>
          <p>View, manage, and export participant records in the system.</p>
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
            data={records}
            columns={columns}
            showSearch={true}
            showAddNew={false}
            showDownloadSample={false}
            showUploadExcel={false}
            showExport={true}
            showDirectExport={false}
            showDownloadSubadmin={false}
            showaddsubadmin={false}
            showTodayUpdated={true}
            todayUpdatedCount={todayUpdatedCount}
            onTodayUpdated={handleShowTodayUpdated}
            loadingStates={loadingStates}
            onAddNew={handleAddNew}
            searchPlaceholder="Search participants..."
            exportFileName="participants"
            rowsPerPageOptions={[10, 25, 50]}
            defaultRowsPerPage={10}
                loading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default FootExam;