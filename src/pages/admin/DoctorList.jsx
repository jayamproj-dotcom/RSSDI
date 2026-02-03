"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import DataTable from "../../components/DataTable"
import { FaTrash } from "react-icons/fa"
import { IoMdCheckmark, IoMdClose } from "react-icons/io"
import "./ManageData.css"
import { toast } from "react-toastify"
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal"
import { apiRequest } from "../../services/api-helper"
import { FaSync, FaSpinner } from "react-icons/fa"
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];
const DoctorList = () => {
    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        doctor: null,
        isLoading: false,
    })
    const [deletePermission, setDeletePermission] = useState("Disabled");




    const fetchDeletePermission = async () => {
        try {
            const adminId = sessionStorage.getItem("adminId");
            const response = await apiRequest(`/subadmins/${adminId}/permissions`);
            console.log("Fetched permission from API:", response); // ✅ Confirm in console
            // ✅ Safely access the nested `permissions` object
            setDeletePermission(response.permissions?.delete_doctors || "Disabled");
        } catch (error) {
            console.error("Failed to fetch delete permission:", error);
            setDeletePermission("Disabled");
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchDeletePermission();
    }, []);


    // Fetch all doctors from API
    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const response = await apiRequest("/doctors");
            console.log("API Response:", response);

            const data = response.data || response;

            // Sort by updated_at in descending order (latest first)
            const sorted = Array.isArray(data)
                ? [...data].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                : [];

            // Add serial numbers after sorting
            const doctorsWithSNo = sorted.map((doc, index) => ({ ...doc, sNo: index + 1 }));

            setDoctors(doctorsWithSNo);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setError(error.message);
            toast.error(`Error fetching doctors: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    const updateDoctorStateAPI = async (doctorId, newState) => {

        return await apiRequest(`/doctors/${doctorId}/updatestate`, {
            method: "PUT",
            body: JSON.stringify({ state: newState }),
        });

    };


    useEffect(() => {
        fetchDoctors()
    }, [])

    // Toggle doctor status
    const toggleStatus = async (doctor) => {
        const newStatus = doctor.status === "Enabled" ? "Disabled" : "Enabled"

        try {
            // Optimistic UI update
            setDoctors(prevDoctors =>
                prevDoctors.map(d =>
                    d.id === doctor.id ? { ...d, status: newStatus } : d
                )
            )

            await apiRequest(`/doctors/${doctor.id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus }),
            })

            if (newStatus === "Enabled") {
                toast.success(`${doctor.doctors_name} has been enabled`)
            } else {
                toast.info(`${doctor.doctors_name} has been disabled`)
            }

        } catch (error) {
            console.error("Error toggling status:", error)

            // Revert UI if API call fails
            setDoctors(prevDoctors =>
                prevDoctors.map(d =>
                    d.id === doctor.id ? { ...d, status: doctor.status } : d
                )
            )

            toast.error(`Error updating status: ${error.message}`)
        }
    }



    // Delete doctor
    const handleDeleteConfirm = async () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }))
        try {
            await apiRequest(`/doctors/${deleteModal.doctor.id}`, {
                method: "DELETE",
            })

            fetchDoctors()
            toast.success(`${deleteModal.doctor?.doctors_name} has been deleted`)
        } catch (error) {
            console.error("Error deleting doctor:", error)
            toast.error(`Error deleting doctor: ${error.message}`)
        } finally {
            setDeleteModal({
                visible: false,
                doctor: null,
                isLoading: false,
            })
        }
    }
    const showDeleteConfirmation = (doctor) => {
        setDeleteModal({
            visible: true,
            doctor,
            isLoading: false,
        })
    }

    const handleDeleteCancel = () => {
        setDeleteModal({
            visible: false,
            doctor: null,
            isLoading: false,
        })
    }

    const handleAddNew = () => {
        toast.success("Add new doctor form opened")
        // You would typically navigate to an add doctor form here
        // navigate('/admin/doctors/add');
    }

    const columns = [
        {
            key: "sNo",
            header: "S.NO",
            sortable: true,
        },

        {
            key: "id",
            header: "ID",
            sortable: true,
        },
        {
            key: "doctors_name",
            header: "Name",
            sortable: true,
        },
        {
            key: "email", // This should match the field in your data object
            header: "Email",
            sortable: true,
            render: (value) => (
                <span>{value || 'No email'}</span> // Display email or a default text
            ),
        },

        {
            key: "phone",
            header: "Phone",
            sortable: true,
        },
        {
            key: 'facility_state',
            header: 'State',
            sortable: true,
            render: (value, row) => (
                <select className="state-dropdown "
                    value={value || ''}
                    onChange={(e) => {
                        const newState = e.target.value;
                        updateDoctorStateAPI(row.id, newState)
                            .then(() => {
                                toast.success(`Dr. ${row.doctors_name} state updated`);
                                console.log(`State updated to "${newState}" for Dr. ${row.doctors_name}`);

                                // Optionally: update local row value in table state
                                // ✅ Update local data so UI refreshes
                                setDoctors(prevDoctors =>
                                    prevDoctors.map(doc =>
                                        doc.id === row.id
                                            ? { ...doc, facility_state: newState }
                                            : doc
                                    )
                                )
                            })
                            .catch(() => toast.error('Update failed'));
                    }}
                >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            )
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (value, row) => (
                <div
                    className={`status-toggle ${value?.toLowerCase?.() || ''}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleStatus(row)
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
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="action-btn delete-action"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (deletePermission === "Disabled") {
                                toast.error("You don't have access to delete. Please contact admin.");
                                return;
                            }
                            showDeleteConfirmation(row);
                        }}
                        title="Delete doctor"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            )

        }
    ]

    return (
        <AdminLayout>
            <div className="manage-doctors-page">
                <div className="page-header">
                    <h1>Doctors Management</h1>
                    <p>Manage and monitor all registered doctors in the system</p>
                </div>

                {isLoading ? (
                    <div className="loading-indicator">
                        <div class="loader"></div>
                        {/* <span className="loader">Loading doctors data...</span> */}
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <div className="error-content">
                            <p>{error}</p>
                            <button onClick={fetchDoctors} className="retry-button">
                                <FaSync className="retry-icon" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={doctors}
                        columns={columns}
                        onAddNew={handleAddNew}
                        showSearch={true}
                        showAddNew={false}
                        showDownloadSample={false}
                        showUploadExcel={false}
                        showaddsubadmin={false}
                        showExport={false}
                        showDirectExport={true}
                        showDownloadSubadmin={false}
                        searchPlaceholder="Search doctors..."
                        exportFileName="doctors_list"
                        rowsPerPageOptions={[10, 25, 50]}
                        defaultRowsPerPage={10}
                    />
                )}

                <DeleteConfirmationModal
                    visible={deleteModal.visible}
                    itemName={deleteModal.doctor?.doctors_name || ""}

                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteModal.isLoading}
                />
            </div>
        </AdminLayout>
    )
}

export default DoctorList
