"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DataTable from "../../components/DataTable";
import { FaTrash } from "react-icons/fa";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FaSync } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ManageData.css";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { apiGet, apiPost } from "../../services/api-helper";
import { apiRequest } from "../../services/api-helper"

const SubAdminList = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        subAdmin: null,
        isLoading: false,
    });

    const fetchSubAdmins = async () => {
        setLoading(true);
        try {
            const response = await apiGet("/subadmins");
            const data = response.data || [];

            const sorted = [...data].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
            const withSerial = sorted.map((sub, index) => ({ ...sub, sNo: index + 1 }));

            setSubAdmins(withSerial);
        } catch (err) {
            console.error("Error fetching sub-admins:", err);
            setError(err.message || "Failed to fetch data.");
            toast.error("Failed to fetch sub-admins.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const toggleStatus = async (subAdmin) => {
        const newStatus = subAdmin.status === "Enabled" ? "Disabled" : "Enabled";

        try {
            await apiPost(`/subadmins/${subAdmin.id}/status`, { status: newStatus });

            setSubAdmins(prev =>
                prev.map(sa => sa.id === subAdmin.id ? { ...sa, status: newStatus } : sa)
            );

            // Separate toasts
            if (newStatus === "Enabled") {
                toast.success(`${subAdmin.name}'s status enabled successfully`);
            } else {
                toast.info(`${subAdmin.name}'s status disabled`);
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status");

            // Revert UI if API fails
            setSubAdmins(prev =>
                prev.map(sa => sa.id === subAdmin.id ? { ...sa, status: subAdmin.status } : sa)
            );
        }
    };


    const updateSubAdminPermission = async (subAdminId, permissionType, newValue) => {
        try {
            let endpoint = '';
            let requestBody = {};

            // Determine endpoint and request body based on permission type
            switch (permissionType) {
                case 'download_patient_data':
                    endpoint = `/subadmins/${subAdminId}/download-patient-data`;
                    requestBody = { download_patient_data: newValue };
                    break;
                case 'download_doctor_data':
                    endpoint = `/subadmins/${subAdminId}/download-doctor-data`;
                    requestBody = { download_doctor_data: newValue };
                    break;
                case 'delete_doctors':
                    endpoint = `/subadmins/${subAdminId}/delete-doctors`;
                    requestBody = { delete_doctors: newValue };
                    break;
                default:
                    throw new Error('Invalid permission type');
            }

            await apiPost(endpoint, requestBody);
            return true;
        } catch (err) {
            console.error(`Error updating ${permissionType}:`, err);
            toast.error(`Failed to update ${permissionType.replace(/_/g, ' ')}`);
            return false;
        }
    };;

    const handlePermissionToggle = async (row, key) => {
        const currentValue = row[key];
        const newValue = currentValue === "Disabled" ? "Enabled" : "Disabled";
        const permissionNames = {
            download_patient_data: "Download Patient Data",
            download_doctor_data: "Download Doctor Data",
            delete_doctors: "Delete Doctors"
        };

        // Optimistic UI update
        setSubAdmins(prev =>
            prev.map(sa =>
                sa.id === row.id ? { ...sa, [key]: newValue } : sa
            )
        );

        const success = await updateSubAdminPermission(row.id, key, newValue);

        if (!success) {
            // Revert if API call fails
            setSubAdmins(prev =>
                prev.map(sa =>
                    sa.id === row.id ? { ...sa, [key]: currentValue } : sa
                )
            );
            toast.error(`Failed to update ${permissionNames[key]}  for ${row.name}`);
        } else {
            if (newValue === "Enabled") {
                toast.success(`${permissionNames[key]} Option enabled for ${row.name}`);
            } else {
                toast.info(`${permissionNames[key]} Option disabled for ${row.name}`);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            // Make DELETE request to backend API
            await apiRequest(`/subadmins/${deleteModal.subAdmin.id}`, {
                method: "DELETE"
            });

            // Refetch subadmins list after successful delete
            await fetchSubAdmins();

            // Notify user of success
            toast.success(`${deleteModal.subAdmin?.name} has been deleted`);
        } catch (error) {
            console.error("Error deleting sub-admin:", error);
            toast.error(`Error deleting sub-admin: ${error.message}`);
        } finally {
            // Close modal and reset state
            setDeleteModal({
                visible: false,
                subAdmin: null,
                isLoading: false,
            });
        }
    };
    
    const showDeleteConfirmation = (subAdmin) => {
        setDeleteModal({ visible: true, subAdmin, isLoading: false });
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ visible: false, subAdmin: null, isLoading: false });
    };

    const handleAddNew = () => {
        toast.info("Redirecting to Sub Admin creation form...");
    };

    const columns = [
        { key: "sNo", header: "S.NO", sortable: true },
        { key: "id", header: "ID", sortable: true },
        { key: "name", header: "Name", sortable: true },
        { key: "username", header: "Email", sortable: true },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (value, row) => (
                <div
                    className={`status-toggle ${value?.toLowerCase?.() || ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(row);
                    }}
                >
                    <div className="status-toggle-track">
                        <div className={`status-toggle-thumb ${value === "Enabled" ? "enabled" : "disabled"}`}>
                            {value === "Enabled" ? (
                                <IoMdCheckmark className="status-icon" />
                            ) : (
                                <IoMdClose className="status-icon" />
                            )}
                        </div>
                    </div>
                    <span className="status-label">{value}</span>
                </div>
            ),
        },
        {
            key: "access",
            header: "Sub Admin Access",
            sortable: false,
            render: (value, row) => (
                <div className="access-permissions">
                    {[
                        { label: "Download Patient Data", key: "download_patient_data" },
                        { label: "Download Doctor Data", key: "download_doctor_data" },
                        { label: "Delete Doctors", key: "delete_doctors" },
                    ].map(({ label, key }, idx) => {
                        const isEnabled = row[key] !== "Disabled";

                        return (
                            <div key={idx} className="access-toggle">
                                <label>{label}</label>
                                <div
                                    className={`status-toggle ${isEnabled ? "enabled" : "disabled"}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePermissionToggle(row, key);
                                    }}
                                >
                                    <div className="status-toggle-track">
                                        <div
                                            className={`status-toggle-thumb ${isEnabled ? "enabled" : "disabled"}`}
                                        >
                                            {isEnabled ? (
                                                <IoMdCheckmark className="status-icon" />
                                            ) : (
                                                <IoMdClose className="status-icon" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="action-btn delete-action"
                        onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirmation(row);
                        }}
                        title="Delete sub-admin"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="manage-doctors-page">
                <div className="page-header">
                    <h1>Sub-Admin Management</h1>
                    <p>Manage and monitor all sub-admins in the system</p>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="loader"></div>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <div className="error-content">
                            <p>{error}</p>
                            <button onClick={fetchSubAdmins} className="retry-button">
                                <FaSync className="retry-icon" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={subAdmins}
                        columns={columns}
                        onAddNew={handleAddNew}
                        showSearch={true}
                        showAddNew={false}
                        showDownloadSample={false}
                        showUploadExcel={false}
                        showExport={false}
                        showDirectExport={false}
                        showDownloadSubadmin={true}
                        searchPlaceholder="Search sub-admins..."
                        exportFileName="sub_admins_list"
                        rowsPerPageOptions={[10, 25, 50]}
                        defaultRowsPerPage={10}
                    />
                )}

                <DeleteConfirmationModal
                    visible={deleteModal.visible}
                    itemName={deleteModal.subAdmin?.name || ""}
                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteModal.isLoading}
                />
            </div>
        </AdminLayout>
    );
};

export default SubAdminList;