import * as XLSX from "xlsx";
import { apiGet } from "../services/api-helper";
import { toast } from "react-toastify";
import { IMAGE_BASE_URL } from "../config/api";
import { useState } from "react";

export const handleExport = async (
  filters,
  exportFileName,
  setShowExportModal
) => {


  try {

    const { gender, ageRange, dateRange } = filters;

    const formatDate = (dateString, isEndDate = false) => {
      if (!dateString) return "";
      const date = new Date(dateString);

      if (isEndDate) {
        // For end date, set to end of day (23:59:59)
        date.setHours(23, 59, 59, 999);
      } else {
        // For start date, set to beginning of day (00:00:00)
        date.setHours(0, 0, 0, 0);
      }

      return date.toISOString();
    };

    const params = {
      gender,
      minAge: ageRange?.min || "",
      maxAge: ageRange?.max || "",
      startDate: formatDate(dateRange?.[0], false), // Start of day
      endDate: formatDate(dateRange?.[1], true),    // End of day
    };


    // 1. Fetch all patients
    const query = new URLSearchParams(params).toString();

    console.log("Time Filter :" + query);

    const response = await apiGet(`/download?${query}`);

    console.log("response:", JSON.stringify(response, null, 3));
    console.log("filters:", JSON.stringify(filters, null, 2));


    const allPatients = Array.isArray(response.patients)
      ? response.patients
      : [];


    if (allPatients.length === 0) {
      toast.warn("No patient data available to export.");
      return;
    }

    // 2. Filter patients on frontend
    let filteredData = [...allPatients];

    if (filteredData.length === 0) {
      toast.warn("No records match the selected filters.");
      return;
    }

    // 3. Define follow-up columns
    const followUpColumns = [
      "survival_status",
      "wound_healed",
      "healing_time_days",
      "non_healing_reason",
      "surgical_intervention",
      "amputation_performed",
      "hospital_visits",
      "hospital_stay_days",
      "was_hospitalized",
      "death_date",
      "death_reason",
      "active_ulcer",
    ];

    // 4. Prepare Excel data with follow-up columns
    const baseFields = Array.from(
      new Set(filteredData.flatMap((patient) => Object.keys(patient)))
    ).filter(field => field !== 'follow_up'); // Remove nested follow_up object

    // Combine base fields with follow-up columns and document links
    const allFields = [...baseFields, ...followUpColumns, "Document Links"];

    const headerRow = allFields;

    const dataRows = filteredData.map((patient) =>
      allFields.map((field) => {
        // Handle Document Links column
        if (field === "Document Links") {
          if (patient.id) {
            const docUrl = `${IMAGE_BASE_URL}patient-documents/${patient.id}`;
            return {
              t: "s",
              v: docUrl,
              l: { Target: docUrl },
              h: docUrl,
            };
          }
          return "No documents";
        }

        // Handle follow-up columns
        if (followUpColumns.includes(field)) {
          const followUpField = field.replace('follow_up_', '');


          // Map the follow-up field names to the actual nested object structure
          const fieldMapping = {
            survival_status: "survival_status",
            wound_healed: "has_wound_healed",
            healing_time_days: "time_of_healing_days",
            non_healing_reason: "reason_for_non_healing",
            surgical_intervention: "surgical_intervention",
            amputation_performed: "amputation_performed",
            hospital_visits: "number_of_hospital_visits",
            hospital_stay_days: "length_of_hospital_stay_days",
            was_hospitalized: "was_hospitalized",
            death_date: "date_of_death",
            death_reason: "reason_for_death",
            active_ulcer: "active_ulcer",
          };

          const actualField = fieldMapping[followUpField];
          const value = patient.follow_up?.[actualField];

          // Handle date fields in follow-up data
          if (
            (followUpField.includes("date") ||
              followUpField.includes("created") ||
              followUpField.includes("updated")) &&
            value
          ) {
            const date = new Date(value);
            return !isNaN(date.getTime()) ? date : "Invalid date";
          }

          // Handle boolean/null values for follow-up data
          if (value === null || value === undefined) return "Not Filled";
          if (typeof value === "object") return JSON.stringify(value);

          // Standardize boolean-like values for follow-up
          if (typeof value === "string") {
            const lowerVal = value.toLowerCase().trim();
            if (["false", "no", "off", "disabled"].includes(lowerVal))
              return "No";
            if (["true", "yes", "on", "enabled"].includes(lowerVal)) return "Yes";
          }

          return value === false ? "No" : value === true ? "Yes" : value;
        }

        // Handle regular patient fields (your existing logic)
        const value = patient[field];

        // Handle date fields
        if (
          (field.toLowerCase().includes("date") ||
            ["created_at", "updated_at", "timestamp"].includes(field)) &&
          value
        ) {
          const date = new Date(value);
          return !isNaN(date.getTime()) ? date : "Invalid date";
        }

        const fieldDurationMap = {
          renal: "renalDuration",
          retinal: "retinalDuration",
          cardiovascular: "cardiovascularDuration",
          heartFailure: "heartFailureDuration",
          cerebrovascular: "cerebrovascularDuration",
          limbIschemia: "limbIschemiaDuration",
          hypertension: "hypertensionDuration",
          gangrene: "gangreneType",
          other_treatment: "other_treatment_details",
        };

        function getDurationStatus(field, patient) {
          const parentField = Object.keys(fieldDurationMap).find(
            (key) => fieldDurationMap[key] === field
          );
          if (!parentField) return patient[field]; // not a duration field

          const parentValue = patient[parentField];
          const durationValue = patient[field];

          if (parentValue === 0 || parentValue === '0' || parentValue === null || parentValue === "No" || parentValue === 'no') {
            return "No Data applicable";
          }
          if (
            (parentValue === 1 || parentValue === '1' || parentValue === 'Yes') &&
            (durationValue === null || durationValue === "")
          ) {
            return "Not Filled";
          }
          return durationValue;
        }

        // 🔑 Call duration logic for duration fields
        if (Object.values(fieldDurationMap).includes(field)) {
          return getDurationStatus(field, patient);
        }

        // 🔑 Neurologic Exam Fields (Monofilament & Tuning Fork)
        const neurologicFields = [
          "monofilamentLeftA", "monofilamentLeftB", "monofilamentLeftC",
          "monofilamentRightA", "monofilamentRightB", "monofilamentRightC",
          "tuningForkRightMedialMalleolus", "tuningForkRightLateralMalleolus", "tuningForkRightBigToe",
          "tuningForkLeftMedialMalleolus", "tuningForkLeftLateralMalleolus", "tuningForkLeftBigToe"
        ];

        if (neurologicFields.includes(field)) {
          if (value === "" || value === null || value === undefined) {
            return "No Data applicable";
          }
          const val = String(value).toLowerCase().trim();
          if (val === "yes" || val === "1") return "Yes";
          if (val === "no" || val === "0") return "No";
          if (val === "not_tested") {
            return field.toLowerCase().includes("monofilament")
              ? "Not tested due to ulcer"
              : "Not tested";
          }
        }

        if (field === "amputationLevel") {
          const amputation = patient.amputation ? String(patient.amputation).trim().toLowerCase() : null;
          return amputation !== "major" ? "No Data applicable" : patient.amputationLevel || "major";
        }

        if (
          field === "woundReferenceFile" &&
          (patient.woundReferenceFile === null ||
            patient.woundReferenceFile === undefined)
        ) {
          const consentYes = [1, "1", "yes", "Yes", true].includes(
            patient.woundReferenceConsent
          );
          const consentNo = [0, "0", "no", "No", false].includes(
            patient.woundReferenceConsent
          );

          if (consentYes) {
            return "Not Filled";
          } else if (consentNo) {
            return "No Data applicable";
          }
        }

        // For cultureReport
        if (
          field === "cultureReport" &&
          (patient.cultureReport === null ||
            patient.cultureReport === undefined)
        ) {
          const reportYes = [1, "1", "yes", "Yes", true].includes(
            patient.cultureReportAvailable
          );
          const reportNo = [0, "0", "no", "No", false].includes(
            patient.cultureReportAvailable
          );

          if (reportYes) {
            return "Not Filled";
          } else if (reportNo) {
            return "No Data applicable";
          }
        }


        if (
          [
            "hasUlcer",
            "hasAngioplasty",
            "renal",
            "retinal",
            "cardiovascular",
            "heartFailure",
            "limbIschemia",
            "hypertension",
            "cerebrovascular",
            "infection",
            "swelling",
            "erythema",
            "warmth",
            "tenderness",
            // "osteomyelitis",
            "sepsis",
            "arterialStenosis",
            "necrosis",
            "burningSensation",
            "painWhileWalking",
            "skinChanges",
            "sensationLoss",
            "nailProblems",
            "fungalInfection",
            "skinLesions",
            "openCrack",
            // "footDeformities",
            "hairLoss",
            "gangrene",
            "pulsesPalpable",
            "survival_status",
          ].includes(field)
        ) {

          // ✅ Foot deformities (enum field)
          if (field === "footDeformities") {
            const map = {
              no: "No",
              minor: "Minor",
              major: "Major",
            };

            return map[value] ?? "Not Filled";
          }

          const val =
            typeof value === "string" ? value.toLowerCase().trim() : value;

          if (val === 0 || val === "0" || val === "no") return "No";
          if (val === 1 || val === "1" || val === "yes") return "Yes";

          return "Not Filled";
        }


        // ✅ Osteomyelitis (enum field)
        if (field === "osteomyelitis") {
          if (value === null || value === undefined || value === "")
            return "Not Filled";

          if (typeof value === "string") {
            return value
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
          }

          return value;
        }


        // Handle boolean/null values
        if (value === null || value === undefined) return "Not Filled";
        if (typeof value === "object") return JSON.stringify(value);

        // For yes/no radio fields → keep exact value
        if (typeof value === "string") {
          const lowerVal = value.toLowerCase().trim();

          if (lowerVal === "yes") return "Yes";
          if (lowerVal === "no") return "No";
        }

        // Standardize boolean-like values
        if (typeof value === "string") {
          const lowerVal = value.toLowerCase().trim();
          if (["false", "no", "off", "disabled"].includes(lowerVal))
            return "No";
          if (["true", "yes", "on", "enabled"].includes(lowerVal)) return "Yes";
        }

        if (typeof value === "number") {
          return value;
        }

        return value === false ? "No" : value === true ? "Yes" : value;
      })
    );

    // 5. Create and format Excel file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

    // Set column widths - wider for follow-up columns for better readability
    ws["!cols"] = allFields.map((field) => {
      let width = 12; // Default width

      if (field === "Document Links") width = 50;
      else if (field.toLowerCase().includes("date")) width = 15;
      else if (field.startsWith("follow_up_")) width = 20; // Wider for follow-up columns
      else if (field.length > 15) width = 18;
      else width = Math.min(30, Math.max(10, field.length));

      return { wch: width };
    });

    // 6. Export the file
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(
      wb,
      `${exportFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    toast.success(`Exported ${filteredData.length} records successfully!`);
    setShowExportModal(false);
  } catch (error) {
    console.error("Export failed:", error);
    toast.error(`Export failed: ${error.message}`);
  }
};