// Service to handle edit requests

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Create a new edit request
export const createEditRequest = async (requestData) => {
  try {
    // Get existing requests from localStorage
    const existingRequests = JSON.parse(localStorage.getItem("editRequests") || "[]")

    // Create new request with ID and pending status
    const newRequest = {
      id: generateId(),
      ...requestData,
      status: "pending",
      requestDate: new Date().toISOString(),
    }

    // Add to existing requests
    const updatedRequests = [...existingRequests, newRequest]

    // Save back to localStorage
    localStorage.setItem("editRequests", JSON.stringify(updatedRequests))

    // Also update the patient record to indicate there's a pending edit request
    updatePatientEditRequestStatus(requestData.patientId, "pending")

    return newRequest
  } catch (error) {
    console.error("Error creating edit request:", error)
    throw error
  }
}

// Approve an edit request
export const approveEditRequest = async (requestId) => {
  try {
    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem("editRequests") || "[]")

    // Find the request to approve
    const requestIndex = existingRequests.findIndex((req) => req.id === requestId)

    if (requestIndex === -1) {
      throw new Error("Edit request not found")
    }

    // Update the request status
    existingRequests[requestIndex].status = "approved"
    existingRequests[requestIndex].approvedDate = new Date().toISOString()

    // Save back to localStorage
    localStorage.setItem("editRequests", JSON.stringify(existingRequests))

    // Update the patient record to allow editing
    const patientId = existingRequests[requestIndex].patientId
    updatePatientEditRequestStatus(patientId, "approved")

    return existingRequests[requestIndex]
  } catch (error) {
    console.error("Error approving edit request:", error)
    throw error
  }
}

// Reject an edit request
export const rejectEditRequest = async (requestId) => {
  try {
    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem("editRequests") || "[]")

    // Find the request to reject
    const requestIndex = existingRequests.findIndex((req) => req.id === requestId)

    if (requestIndex === -1) {
      throw new Error("Edit request not found")
    }

    // Update the request status
    existingRequests[requestIndex].status = "rejected"
    existingRequests[requestIndex].rejectedDate = new Date().toISOString()

    // Save back to localStorage
    localStorage.setItem("editRequests", JSON.stringify(existingRequests))

    // Update the patient record
    const patientId = existingRequests[requestIndex].patientId
    updatePatientEditRequestStatus(patientId, "rejected")

    return existingRequests[requestIndex]
  } catch (error) {
    console.error("Error rejecting edit request:", error)
    throw error
  }
}

// Get all edit requests
export const getAllEditRequests = async () => {
  try {
    return JSON.parse(localStorage.getItem("editRequests") || "[]")
  } catch (error) {
    console.error("Error getting edit requests:", error)
    return []
  }
}

// Get edit requests for a specific patient
export const getPatientEditRequests = async (patientId) => {
  try {
    const allRequests = JSON.parse(localStorage.getItem("editRequests") || "[]")
    return allRequests.filter((req) => req.patientId === patientId)
  } catch (error) {
    console.error("Error getting patient edit requests:", error)
    return []
  }
}

// Check if a patient has an approved edit request
export const hasApprovedEditRequest = (patientId) => {
  try {
    const patientRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")
    const patient = patientRecords.find((p) => p.patientId === patientId)

    return patient && patient.editRequestStatus === "approved"
  } catch (error) {
    console.error("Error checking edit request status:", error)
    return false
  }
}

// Update patient record with edit request status
const updatePatientEditRequestStatus = (patientId, status) => {
  try {
    const patientRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")

    const updatedRecords = patientRecords.map((patient) => {
      if (patient.patientId === patientId) {
        return {
          ...patient,
          editRequestStatus: status,
        }
      }
      return patient
    })

    localStorage.setItem("patientRecords", JSON.stringify(updatedRecords))
  } catch (error) {
    console.error("Error updating patient edit request status:", error)
  }
}
