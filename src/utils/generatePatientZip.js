import JSZip from "jszip";
import { saveAs } from "file-saver";
import { apiGet } from "../services/api-helper";

// List of all fields to include
const documentFields = [
    "consentForm",
    "woundReferenceFile",
    "arterialReport",
    "cultureReport",
    "footScan",
    "labReport"
];

export const generatePatientZip = async (patientId) => {
    try {
        const response = await apiGet("patient");
        const patients = Array.isArray(response.data) ? response.data : [];
        const patient = patients.find((p) => String(p.id) === String(patientId));

        if (!patient) {
            alert("Patient not found.");
            return;
        }

        const zip = new JSZip();
        const name = (patient.name || "Unknown").replace(/\s+/g, "");
        const id = patient.id;
        const date = new Date(patient.created_at || "").toISOString().split("T")[0];
        const zipName = `${name}_${id}_${date}.zip`;

        const fileTasks = documentFields.map(async (field) => {
            const fileUrl = patient[field];
            if (!fileUrl) return;

            try {
                const res = await fetch(fileUrl);
                const blob = await res.blob();
                const ext = fileUrl.split(".").pop().split("?")[0] || "pdf";
                const fileName = `${name}_${id}_${field}.${ext}`;
                zip.file(fileName, blob);
            } catch (err) {
                console.warn(`Failed to fetch ${field}: ${fileUrl}`, err);
            }
        });

        await Promise.all(fileTasks);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, zipName);
    } catch (error) {
        console.error("ZIP generation failed:", error);
        alert("Failed to download documents. Please try again.");
    }
};
