import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Building, Users, FileText, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { FiLogIn } from "react-icons/fi";
import { apiRequest } from "../../services/api-helper";
import DoctorIcon from "../../assets/images/undraw_doctors_djoj.svg";
import "./DoctorSignup.css";
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

const DoctorSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialFormState = {
        doctorName: "",
        education: "",
        specialty: "",
        experienceYears: "",
        facilityName: "",
        facilityAddress: "",
        facilityType: "",
        patientsPerDay: "",
        patientsPerWeek: "",
        state: "",
        team: {
            diabetologist: "",
            generalPractitioner: "",
            generalSurgeon: "",
            orthopaedicSurgeon: "",
            podiatricSurgeon: "",
            vascularSurgeon: "",
            infectiousSpecialist: "",
            podiatrist: "",
            diabetesNurse: "",
            pedorthist: "",
        },
        referringPatients: "",
        referringSpecialist: "",
        referringSurgical: "",
        surgicalProcedure: "",
        receivingReferrals: "",
        email: "",
        password: "",
        phone: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleEmail, setIsGoogleEmail] = useState(false); // 👈 Add this here
    // Check for Google login data in URL params
    useEffect(() => {
        const googleDoctorInfo = sessionStorage.getItem("googleDoctorInfo");
        if (googleDoctorInfo) {
            const { email, name, picture } = JSON.parse(googleDoctorInfo);
            setFormData((prev) => ({
                ...prev,
                email,
                doctorName: name || prev.doctorName,
                ...(picture && { picture }),
            }));
            setIsGoogleEmail(true);
        }
    }, []);



    const handleReset = () => {
        setFormData(initialFormState);
        setErrors({});
        setShowPassword(false);
        toast.info("Form has been reset");
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Information
        if (!formData.doctorName.trim()) newErrors.doctorName = "Doctor name is required.";
        if (!formData.education.trim()) newErrors.education = "Education is required.";
        if (!formData.specialty.trim()) newErrors.specialty = "Specialty is required.";
        if (!formData.experienceYears || formData.experienceYears < 0)
            newErrors.experienceYears = "Valid years of experience required.";

        // Facility Information
        if (!formData.facilityName.trim()) newErrors.facilityName = "Facility name is required.";
        if (!formData.facilityAddress.trim()) newErrors.facilityAddress = "Facility address is required.";
        if (!formData.state.trim()) newErrors.state = "Facility state is required.";
        if (!formData.facilityType) newErrors.facilityType = "Facility type is required.";

        // Patients numbers
        if (formData.patientsPerDay < 0) newErrors.patientsPerDay = "Patients per day must be 0 or more.";
        if (formData.patientsPerWeek < 0) newErrors.patientsPerWeek = "Patients per week must be 0 or more.";

        // Referral Information
        if (formData.referringPatients === "Yes" && !formData.referringSpecialist.trim()) {
            newErrors.referringSpecialist = "Please specify the specialists you refer to.";
        }
        if (formData.referringSurgical === "Yes" && !formData.surgicalProcedure.trim()) {
            newErrors.surgicalProcedure = "Please specify the surgical procedure.";
        }

        // Credentials
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter and one number.";
        }

        // Referral Information
        if (!formData.referringPatients) {
            newErrors.referringPatients = "Please select if you are referring patients.";
        } else if (formData.referringPatients === "Yes" && !formData.referringSpecialist.trim()) {
            newErrors.referringSpecialist = "Please specify which specialists you refer to.";
        }

        if (!formData.referringSurgical) {
            newErrors.referringSurgical = "Please select if you are referring for surgical procedures.";
        } else if (formData.referringSurgical === "Yes" && !formData.surgicalProcedure.trim()) {
            newErrors.surgicalProcedure = "Please specify the type of surgical procedure.";
        }

        if (!formData.receivingReferrals) {
            newErrors.receivingReferrals = "Please select if you receive referrals.";
        }

        // Phone validation (optional field)
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSubmitting(true);

        const formattedData = {
            doctors_name: formData.doctorName,
            education: formData.education,
            specialty: formData.specialty,
            experience_years: formData.experienceYears,
            facility_name: formData.facilityName,
            facility_address: formData.facilityAddress,
            facility_state: formData.state,
            facility_type: formData.facilityType,
            patients_per_day: formData.patientsPerDay,
            patients_per_week: formData.patientsPerWeek,
            team: formData.team,
            referring_patients: formData.referringPatients,
            referring_specialist: formData.referringSpecialist,
            referring_surgical: formData.referringSurgical,
            surgical_procedure: formData.surgicalProcedure,
            receiving_referrals: formData.receivingReferrals,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            picture: formData.picture || null,
        };

        try {
            const response = await apiRequest("/doctors/store", {
                method: "POST",
                body: JSON.stringify(formattedData),
            });

            localStorage.setItem(`user_${formData.email}_registered`, 'true');

            toast.success("Registration successful! Please log in.");

            console.log("Redirecting to login with email:", formData.email);
            navigate(`/user-login?email=${encodeURIComponent(formData.email)}`, { replace: true });
            return;
        } catch (error) {
            console.error("Registration error:", error);

            if (error.data?.errors) {
                Object.values(error.data.errors).forEach(errMessages => {
                    errMessages.forEach(message => toast.error(message));
                });
            } else if (error.message.includes("UNIQUE constraint failed")) {
                toast.error("This email is already registered. Please log in instead.");
                navigate(`/user-login?email=${encodeURIComponent(formData.email)}`, { replace: true });
                return;
            } else {
                toast.error(error.message || "Something went wrong.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("team.")) {
            const teamField = name.split(".")[1];
            setFormData((prevData) => ({
                ...prevData,
                team: {
                    ...prevData.team,
                    [teamField]: checked,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: type === "checkbox" ? checked : value,
            }));
        }


        // Clear errors dynamically
        setErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };

            if (name === "email") {
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    delete updatedErrors.email;
                }
            }

            if (name === "password") {
                if (value.length >= 8) {
                    delete updatedErrors.password;
                }
            }

            return updatedErrors;
        });
    };

    return (
        <div className="registration-container">
            <div className="register-form-header">
                <div className="register-header-content">
                    <h1>Doctor Registration</h1>
                    <p>Complete the form to register as a participating doctor for diabetes wound care</p>
                </div>
                <div className="doctor-icon">
                    <img src={DoctorIcon || "/placeholder.svg"} alt="Doctor Icon" className="register-header-icon" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="registration-form">
                <section className="form-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <User size={20} />
                        </div>
                        <h2>Personal Information</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="doctorName">Name of the participating Doctor</label>
                            <input
                                type="text"
                                id="doctorName"
                                name="doctorName"
                                value={formData.doctorName}
                                onChange={handleChange}
                                required
                                className={`form-control ${errors.doctorName ? "input-error" : ""}`}
                                placeholder="Dr. John Smith"
                            />
                            {errors.doctorName && <span className="error-message">{errors.doctorName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="education">Education</label>
                            <input
                                type="text"
                                id="education"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="MD, PhD, etc."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="specialty">Specialty</label>
                            <input
                                type="text"
                                id="specialty"
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="Endocrinology, Surgery, etc."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="experienceYears">Years of experience in diabetes wound care</label>
                            <input
                                type="number"
                                id="experienceYears"
                                name="experienceYears"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="5"
                                min="0"
                            />
                        </div>
                        {/* Add Phone Number Field */}
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`form-control ${errors.phone ? "input-error" : ""}`}
                                placeholder="Enter phone number"
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <Building size={20} />
                        </div>
                        <h2>Health Facility Information</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="facilityName">Name of the Health Facility (clinic/hospital)</label>
                            <input
                                type="text"
                                id="facilityName"
                                name="facilityName"
                                value={formData.facilityName}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="City Medical Center"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="facilityAddress">Address of the Health Facility</label>
                            <textarea
                                id="facilityAddress"
                                name="facilityAddress"
                                value={formData.facilityAddress}
                                onChange={handleChange}
                                required
                                className="form-control"
                                rows="2"
                                placeholder="123 Medical Drive, City, State, ZIP"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="facilityType">State</label>
                            <div className="select-wrapper">
                                <select id="state" name="state" value={formData.state} onChange={handleChange}
                                    required className="form-control">
                                    <option value="">-- Select State --</option>
                                    {indianStates.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="facilityType">Type of Health Facility</label>
                            <div className="select-wrapper">
                                <select
                                    id="facilityType"
                                    name="facilityType"
                                    value={formData.facilityType}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Select facility type</option>
                                    <option value="Primary">Primary</option>
                                    <option value="Secondary">Secondary</option>
                                    <option value="Tertiary">Tertiary</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="patientsPerDay">DFU patients per day</label>
                            <input
                                type="number"
                                id="patientsPerDay"
                                name="patientsPerDay"
                                value={formData.patientsPerDay}
                                onChange={handleChange}
                                min="0"
                                className="form-control"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="patientsPerWeek">DFU patients per week</label>
                            <input
                                type="number"
                                id="patientsPerWeek"
                                name="patientsPerWeek"
                                value={formData.patientsPerWeek}
                                onChange={handleChange}
                                min="0"
                                className="form-control"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <Users size={20} />
                        </div>
                        <h2>Availability of Diabetic Foot Care Team</h2>
                    </div>

                    <div className="team-grid">
                        {[
                            { id: "diabetologist", label: "Diabetologist" },
                            { id: "generalPractitioner", label: "General practitioner" },
                            { id: "generalSurgeon", label: "General surgeon" },
                            { id: "orthopaedicSurgeon", label: "Orthopaedic surgeon" },
                            { id: "podiatricSurgeon", label: "Foot/Podiatric surgeon" },
                            { id: "vascularSurgeon", label: "Vascular surgeon (Endovascular & Open revascularization)" },
                            { id: "infectiousSpecialist", label: "Infectious disease specialist / Clinical microbiologist" },
                            { id: "podiatrist", label: "Podiatrist" },
                            { id: "diabetesNurse", label: "Diabetes Nurse" },
                            { id: "pedorthist", label: "Pedorthist, Ortho or Prosthetist" },
                        ].map((specialist) => (
                            <div className="team-item" key={specialist.id}>
                                <div className="team-label">{specialist.label}</div>
                                <div className="toggle-group">
                                    <label className={`toggle-option ${formData.team[specialist.id] === true ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name={`team.${specialist.id}`}
                                            checked={formData.team[specialist.id] === true}
                                            onChange={() =>
                                                setFormData({
                                                    ...formData,
                                                    team: { ...formData.team, [specialist.id]: true },
                                                })
                                            }
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className={`toggle-option ${formData.team[specialist.id] === false ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name={`team.${specialist.id}`}
                                            checked={formData.team[specialist.id] === false}
                                            onChange={() =>
                                                setFormData({
                                                    ...formData,
                                                    team: { ...formData.team, [specialist.id]: false },
                                                })
                                            }
                                        />
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="form-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <FileText size={20} />
                        </div>
                        <h2>Referral Information</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Are you referring patients for any specialist during treatment of diabetic foot ulcers?</label>
                            <div className="toggle-group horizontal">
                                <label className={`toggle-option lable3 ${formData.referringPatients === "Yes" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="referringPatients"
                                        value="Yes"
                                        checked={formData.referringPatients === "Yes"}
                                        onChange={handleChange}
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className={`toggle-option ${formData.referringPatients === "No" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="referringPatients"
                                        value="No"
                                        checked={formData.referringPatients === "No"}
                                        onChange={handleChange}
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {errors.referringPatients && <span className="error-message">{errors.referringPatients}</span>}
                        </div>

                        {formData.referringPatients === "Yes" && (
                            <div className="form-group full-width conditional-field">
                                <label htmlFor="referringSpecialist">Please specify which specialists</label>
                                <input
                                    type="text"
                                    id="referringSpecialist"
                                    name="referringSpecialist"
                                    value={formData.referringSpecialist}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Vascular surgeon, Endocrinologist, etc."
                                />
                                {errors.referringSpecialist && <span className="error-message">{errors.referringSpecialist}</span>}
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label>Are you referring patients for any surgical procedure to treat diabetic foot ulcers?</label>
                            <div className="toggle-group horizontal">
                                <label className={`toggle-option ${formData.referringSurgical === "Yes" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="referringSurgical"
                                        value="Yes"
                                        checked={formData.referringSurgical === "Yes"}
                                        onChange={handleChange}
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className={`toggle-option ${formData.referringSurgical === "No" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="referringSurgical"
                                        value="No"
                                        checked={formData.referringSurgical === "No"}
                                        onChange={handleChange}
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {errors.referringSurgical && <span className="error-message">{errors.referringSurgical}</span>}
                        </div>

                        {formData.referringSurgical === "Yes" && (
                            <div className="form-group full-width conditional-field">
                                <label htmlFor="surgicalProcedure">Type of surgical procedure</label>
                                <input
                                    type="text"
                                    id="surgicalProcedure"
                                    name="surgicalProcedure"
                                    value={formData.surgicalProcedure}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Debridement, Amputation, etc."
                                />
                                {errors.surgicalProcedure && <span className="error-message">{errors.surgicalProcedure}</span>}
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label>Do you get referrals for diabetic wound care?</label>
                            <div className="toggle-group horizontal">
                                <label className={`toggle-option ${formData.receivingReferrals === "Yes" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="receivingReferrals"
                                        value="Yes"
                                        checked={formData.receivingReferrals === "Yes"}
                                        onChange={handleChange}
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className={`toggle-option ${formData.receivingReferrals === "No" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="receivingReferrals"
                                        value="No"
                                        checked={formData.receivingReferrals === "No"}
                                        onChange={handleChange}
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                            {errors.receivingReferrals && <span className="error-message">{errors.receivingReferrals}</span>}
                        </div>
                    </div>
                </section>
                <section className="form-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <Lock size={20} />
                        </div>
                        <h2>Account Credentials</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`form-control ${errors.email ? "input-error" : ""}`}
                                placeholder="doctor@example.com"
                                readOnly={isGoogleEmail} // 👈 Make read-only if Google login
                            />

                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`form-control ${errors.password ? "input-error" : ""}`}
                                    placeholder="At least 8 characters, uppercase, and number"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength Bar */}
                            <div className="password-strength">
                                <div className={`strength-bar ${formData.password.length > 0 ? "active" : ""}`}></div>
                                <div className={`strength-bar ${formData.password.length > 5 ? "active" : ""}`}></div>
                                <div
                                    className={`strength-bar ${formData.password.length > 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? "active" : ""}`}
                                ></div>
                            </div>
                            {/* Example Password Hint */}
                            <small className="password-hint">
                                Example: <strong>MySecure123</strong> (at least 8 characters, 1 uppercase letter, and 1 number)
                            </small>
                            {/* Show error message if any */}
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <a type="button" className="action-btn secondary-btn" onClick={handleReset} disabled={isSubmitting}>
                        Reset
                    </a>
                    <button type="submit" className="action-btn download-excel" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className="spinner"></span>
                        ) : (
                            <>
                                <span>Register</span>
                                <FiLogIn size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorSignup;
