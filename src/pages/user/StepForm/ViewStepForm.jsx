const ViewStepForm = ({ location }) => {
    const { initialData, isReadOnly } = location.state;  // received from handleStepForm
    const handleDownload = () => {
        const data = JSON.stringify(initialData, null, 2); // format data for download
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${initialData.patientId}_assessment.json`;
        link.click();
    };

    return (
        <div>
            <h2>View Assessment - {initialData.patientName}</h2>
            <div>
                <p><strong>Patient ID:</strong> {initialData.patientId}</p>
                <p><strong>Diagnosis:</strong> {initialData.diagnosis}</p>
                <p><strong>Status:</strong> {initialData.status}</p>
                <p><strong>Last Visit:</strong> {new Date(initialData.lastVisit).toLocaleDateString()}</p>
                <p><strong>Follow-up Date:</strong> {new Date(initialData.followUpDate).toLocaleDateString()}</p>
                <p><strong>Form Data:</strong> {JSON.stringify(initialData.formData, null, 2)}</p>
            </div>

            {!isReadOnly && (
                <button onClick={handleDownload}>Download Data</button>
            )}
        </div>
    );
};
