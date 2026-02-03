import AdminLayout from "../../layouts/AdminLayout";
import DataTable from "../../components/DataTable";
import "./ManageData.css";

const ManageData = () => {
    
    // Sample data for the table
    const sampleData = [
        {
            sNo: 1,
            participantId: "PT-001",
            doctorEmail: "dr.smith@hospital.com",
            participantName: "John Doe",
            date: "2023-04-15",
            status: "Completed",
        },
        {
            sNo: 2,
            participantId: "PT-002",
            doctorEmail: "dr.johnson@hospital.com",
            participantName: "Jane Smith",
            date: "2023-04-16",
            status: "Pending",
        },
        {
            sNo: 3,
            participantId: "PT-003",
            doctorEmail: "dr.patel@hospital.com",
            participantName: "Robert Brown",
            date: "2023-04-17",
            status: "Cancelled",
        },
        {
            sNo: 4,
            participantId: "PT-004",
            doctorEmail: "dr.williams@hospital.com",
            participantName: "Sarah Johnson",
            date: "2023-04-18",
            status: "Completed",
        },
        {
            sNo: 5,
            participantId: "PT-005",
            doctorEmail: "dr.garcia@hospital.com",
            participantName: "Michael Davis",
            date: "2023-04-19",
            status: "Pending",
        },
        {
            sNo: 6,
            participantId: "PT-006",
            doctorEmail: "dr.rodriguez@hospital.com",
            participantName: "Emily Wilson",
            date: "2023-04-20",
            status: "Completed",
        },
        {
            sNo: 7,
            participantId: "PT-007",
            doctorEmail: "dr.martinez@hospital.com",
            participantName: "David Thompson",
            date: "2023-04-21",
            status: "Pending",
        },
        {
            sNo: 8,
            participantId: "PT-008",
            doctorEmail: "dr.anderson@hospital.com",
            participantName: "Lisa Martinez",
            date: "2023-04-22",
            status: "Cancelled",
        },
        {
            sNo: 9,
            participantId: "PT-009",
            doctorEmail: "dr.taylor@hospital.com",
            participantName: "James Wilson",
            date: "2023-04-23",
            status: "Completed",
        },
        {
            sNo: 10,
            participantId: "PT-010",
            doctorEmail: "dr.thomas@hospital.com",
            participantName: "Jennifer Garcia",
            date: "2023-04-24",
            status: "Pending",
        },
        {
            sNo: 11,
            participantId: "PT-011",
            doctorEmail: "dr.hernandez@hospital.com",
            participantName: "Daniel Moore",
            date: "2023-04-25",
            status: "Completed",
        },
        {
            sNo: 12,
            participantId: "PT-012",
            doctorEmail: "dr.moore@hospital.com",
            participantName: "Christopher Lee",
            date: "2023-04-26",
            status: "Pending",
        },
    ]

    // Define columns for the DataTable
    const columns = [
        {
            key: 'sNo',
            header: 'S.NO',
            sortable: true
        },
        {
            key: 'participantId',
            header: 'Participant ID',
            sortable: true
        },
        {
            key: 'doctorEmail',
            header: 'Doctor Email',
            sortable: true
        },
        {
            key: 'participantName',
            header: 'Participant Name',
            sortable: true
        },
        {
            key: 'date',
            header: 'Date',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge ${value.toLowerCase()}`}>
                    {value}
                </span>
            )
        },
        //  {
        //     key: 'actions',
        //     header: 'Actions',
        //     actions: [
        //         {
        //             name: 'view',
        //             icon: <FaEye />,
        //             title: 'View Details',
        //             handler: handleView
        //         },
        //         {
        //             name: 'edit',
        //             icon: <FaEdit />,
        //             title: 'Edit Record',
        //             handler: handleEdit
        //         },
        //         {
        //             name: 'delete',
        //             icon: <FaTrash />,
        //             title: 'Delete Participant',
        //             handler: handleDelete,
        //             className: 'delete-action' // Optional custom class
        //         }
        //     ]
        // }
    ];

    const handleAddNew = () => {
        console.log("Add new participant clicked");
        // Implement your add new logic here
    };

    const handleView = (row) => {
        console.log("View participant:", row);
        // Implement your view logic here
    };

    const handleEdit = (row) => {
        console.log("Edit participant:", row);
        // Implement your edit logic here
    };

    const handleDelete = (row) => {
        console.log("Delete participant:", row);
        if (confirm(`Are you sure you want to delete ${row.participantName}?`)) {
            // Implement your delete logic here
        }
    };

    return (
        <AdminLayout>
            <div className="manage-data-page">
                <div className="page-header">
                    <h1>Manage Participant Data</h1>
                    <p>View, manage, and export participant records in the system.</p>
                </div>

                <DataTable
                    data={sampleData}
                    columns={columns}
                    // Button visibility controls
                    showSearch={true}
                    showAddNew={false}
                    showDownloadSample={false}
                    showUploadExcel={false}
                    showExport={true}
                    // Action handlers
                    onAddNew={handleAddNew}
                    onDownloadSample={() => {
                        // Sample download logic
                        console.log("Downloading sample...");
                    }}
                    onUploadExcel={(file) => {
                        // File upload logic
                        console.log("Uploading file:", file);
                    }}
                    // Other props
                    searchPlaceholder="Search participants..."
                    exportFileName="participants"
                    rowsPerPageOptions={[10, 25, 50]}
                    defaultRowsPerPage={10}
                />
            </div>
        </AdminLayout>
    );
};

export default ManageData;