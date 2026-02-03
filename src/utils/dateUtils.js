// utils/dateUtils.js

// Format date to DD-MM-YYYY
export const formatToDDMMYYYY = (dateString) => {
    if (!dateString) return "N/A"

    // Handle Excel date objects (serial numbers)
    if (typeof dateString === "number" && dateString > 0) {
        const date = new Date((dateString - (25567 + 1)) * 86400 * 1000)
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    // Handle Date objects
    if (dateString instanceof Date) {
        const day = String(dateString.getDate()).padStart(2, "0")
        const month = String(dateString.getMonth() + 1).padStart(2, "0")
        const year = dateString.getFullYear()
        return `${day}-${month}-${year}`
    }

    // Handle string dates
    if (typeof dateString === "string") {
        const isoDate = new Date(dateString)
        if (!isNaN(isoDate.getTime())) {
            const day = String(isoDate.getDate()).padStart(2, "0")
            const month = String(isoDate.getMonth() + 1).padStart(2, "0")
            const year = isoDate.getFullYear()
            return `${day}-${month}-${year}`
        }

        const parts = dateString.split(/[-/ ]/)
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                const [year, month, day] = parts
                return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
            } else if (parts[2].length === 4) {
                const [day, month, year] = parts
                const monthNum = Number.parseInt(month, 10)
                if (monthNum >= 1 && monthNum <= 12) {
                    return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
                } else {
                    return `${month.padStart(2, "0")}-${day.padStart(2, "0")}-${year}`
                }
            }
        }
    }

    return String(dateString)
}

// Check if follow-up period has passed
export const isFollowUpPassed = (dateString, followUpType = "6-month") => {
    if (!dateString) return false
    const lastVisit = new Date(dateString)
    const followUpDate = new Date(lastVisit)

    const monthsToAdd = followUpType === "3-month" ? 3 : 6
    followUpDate.setMonth(followUpDate.getMonth() + monthsToAdd)

    return new Date() >= followUpDate
}

// Calculate follow-up date based on type (3-month or 6-month)
export const calculateFollowUpDate = (dateString, followUpType = "6-month") => {
    if (!dateString) return null
    const lastVisit = new Date(dateString)
    const followUpDate = new Date(lastVisit)

    const monthsToAdd = followUpType === "3-month" ? 3 : 6
    followUpDate.setMonth(followUpDate.getMonth() + monthsToAdd)

    return followUpDate.toISOString()
}

// 5-day time logic
export const is24HoursPassed = (dateString, currentTime = new Date()) => {
    if (!dateString) return true
    const submissionDate = new Date(dateString)
    const diffMs = currentTime - submissionDate
    return diffMs >= 5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
}

export const calculateRemainingTime = (submissionDate, currentTime) => {
    const submittedAt = new Date(submissionDate).getTime()
    const now = currentTime ? new Date(currentTime).getTime() : Date.now()

    const diffMs = 5 * 24 * 60 * 60 * 1000 - (now - submittedAt) // 5 days in ms
    if (diffMs <= 0) return "0d 00h 00m"

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`
}
