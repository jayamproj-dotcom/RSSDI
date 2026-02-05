import React from 'react';
import './StepForm.css';
import doctorrefference from '../../../assets/images/doctorrefference.png';
import { FiDownloadCloud, FiFileText } from 'react-icons/fi';
import { IMAGE_BASE_URL } from "../../../config/api"

const StepForm2 = ({ formData, handleChange, errors, setErrors }) => {

  console.log('Form Data in StepForm2:', formData.section2);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleWoundReferenceUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, woundReferenceFile: 'Only JPG, PNG, or PDF files are allowed' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, woundReferenceFile: 'File size exceeds 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Update both the file and preview
      handleChange(
        { target: { name: 'woundReferenceFile', value: file } },
        'section2'
      );
      handleChange(
        { target: { name: 'woundReferenceFilePreview', value: reader.result } },
        'section2'
      );
    };

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    }
  };



  const handleRemoveWoundReference = () => {
    if (formData.section2.woundReferencePreview) {
      URL.revokeObjectURL(formData.section2.woundReferencePreview);
    }

    handleChange({ target: { name: 'woundReferenceFile', value: null } }, 'section2');
    handleChange({ target: { name: 'woundReferencePreview', value: null } }, 'section2');

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.woundReference;
      return newErrors;
    });
  };

  // Culture Report Handlers (unchanged)
  const handleCultureReportUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        cultureReport: 'File exceeds 5MB limit',
      }));
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cultureReport: 'Only PDF, JPG, or PNG files are allowed',
      }));
      return;
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    handleChange(
      { target: { name: 'cultureReport', value: file } },
      'section2'
    );
    handleChange(
      { target: { name: 'cultureReportPreview', value: previewUrl } },
      'section2'
    );

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cultureReport;
      return newErrors;
    });
  };

  const handleRemoveCultureReport = () => {
    if (formData.section2.cultureReportPreview) {
      URL.revokeObjectURL(formData.section2.cultureReportPreview);
    }

    handleChange({ target: { name: 'cultureReport', value: null } }, 'section2');
    handleChange({ target: { name: 'cultureReportPreview', value: null } }, 'section2');

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cultureReport;
      return newErrors;
    });
  };
  const handleRemovearterialReport = () => {
    if (formData.section2.cultureReportPreview) {
      URL.revokeObjectURL(formData.section2.cultureReportPreview);
    }

    handleChange({ target: { name: 'arterialReport', value: null } }, 'section2');
    handleChange({ target: { name: 'arterialReportPreview', value: null } }, 'section2');

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cultureReport;
      return newErrors;
    });
  };

  return (
    <div className="medical-add-container">
      <form onSubmit={handleSubmit} className="medical-add-form">
        {/* Section 1: Referral Details */}

        <div className="medical-add-section">
          <div className="medical-add-row">

            <div className="medical-add-group">
              <label className="medical-add-label required">Date of assessment (dd/mm/yy)</label>
              <input
                type="date"
                name="Assessment"
                value={formData.section2.Assessment}
                onChange={(e) => handleChange(e, 'section2')}
                required
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                className={`medical-add-input ${errors.Assessment ? 'medical-add-error-field' : ''}`}
              />
              {errors.Assessment && <span className="error-message">{errors.Assessment}</span>}
            </div>
          </div>


        </div>

        {/* Section 2: Assessment */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Assessment of Wound</h2>

          {/* Site Title */}
          <label className="medical-add-label subtittle2 ">Site</label>

          <div className="medical-add-row">
            {/* Leg Dropdown - independent selection */}
            <div className="medical-add-group ">
              <label className="medical-add-label required">Leg</label>
              <select
                name="leg"
                className={`medical-add-input ${errors.leg ? 'medical-add-error-field' : ''}`}
                value={formData.section2.leg}
                onChange={(e) => handleChange(e, 'section2')}
                required
              >
                <option value="">Select Leg</option>
                <option value="right">Right Leg</option>
                <option value="left">Left Leg</option>
                <option value="both">Both</option>
                <option value="na">Not Applicable</option>
              </select>
              {errors.leg && <span className="error-message">{errors.leg}</span>}
            </div>

            {/* Foot Dropdown - controls which foot sections are shown */}
            <div className="medical-add-group ">
              <label className="medical-add-label required">Foot</label>
              <select
                name="foot"
                className={`medical-add-input ${errors.foot ? 'medical-add-error-field' : ''}`}
                value={formData.section2.foot}
                onChange={(e) => handleChange(e, 'section2')}
                required
              >
                <option value="">Select Foot</option>
                <option value="right">Right Foot</option>
                <option value="left">Left Foot</option>
                <option value="both">Both </option>
                <option value="na">Not Applicable</option>
              </select>
              {errors.foot && <span className="error-message">{errors.foot}</span>}
            </div>



            <div className="medical-add-group ">
              <label className="medical-add-label">Image of wound on the date of assessment <br></br>(if available)</label>

              <div className={`medical-add-radio-group ${errors.woundReferenceConsent ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`woundReferenceConsent-${val}`}>
                    <input
                      type="radio"
                      name="woundReferenceConsent"
                      value={val}
                      checked={formData.section2.woundReferenceConsent === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button "


                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>

              {errors.woundReferenceConsent && (
                <span className="error-message">{errors.woundReferenceConsent}</span>
              )}

              {formData.section2.woundReferenceConsent === 'yes' && (
                <div className="medical-upload-container" style={{ marginTop: '1rem' }}>
                  {formData.section2.woundReferenceFile ? (
                    <div className="medical-image-preview-card">
                      <div className="medical-image-preview-wrapper">
                        {/* // In your JSX render section: */}
                        {formData.section2.woundReferenceFilePreview ? (
                          formData.section2.woundReferenceFilePreview.startsWith('data:') ? (
                            // Handle data URLs (new uploads)
                            formData.section2.woundReferenceFilePreview.includes('application/pdf') ? (
                              <div className="pdf-preview-container">
                                <iframe
                                  src={formData.section2.woundReferenceFilePreview}
                                  width="100%"
                                  height="400px"
                                  title="PDF Preview"
                                />
                              </div>
                            ) : (
                              <img
                                src={formData.section2.woundReferenceFilePreview}
                                alt="Wound reference preview"
                                className="medical-image-preview"
                              />
                            )
                          ) : (
                            // Handle URL paths (from API)
                            formData.section2.woundReferenceFilePreview.toLowerCase().endsWith('.pdf') ? (
                              <div className="pdf-preview-container">
                                <iframe
                                  src={formData.section2.woundReferenceFilePreview}
                                  width="100%"
                                  height="400px"
                                  title="PDF Preview"
                                />
                                <a
                                  href={formData.section2.woundReferenceFilePreview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pdf-download-link"
                                >
                                  Open PDF in new tab
                                </a>
                              </div>
                            ) : (
                              <img
                                src={formData.section2.woundReferenceFilePreview}
                                alt="Wound reference preview"
                                className="medical-image-preview"
                                onError={(e) => {
                                  console.error("Failed to load image:", formData.section2.woundReferenceFilePreview);
                                  e.target.onerror = null;
                                  e.target.src = '/path-to-fallback-image.png';
                                }}
                              />
                            )
                          )
                        ) : (
                          <p>No preview available</p>
                        )}



                        <div className="medical-image-actions">
                          <button
                            type="button"
                            className="medical-image-remove-btn"
                            onClick={handleRemoveWoundReference}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path
                                fill="currentColor"
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="medical-upload-card">
                      <input
                        type="file"
                        name="woundReferenceFile"
                        accept="image/*,application/pdf"
                        onChange={handleWoundReferenceUpload}
                        className="medical-upload-input"
                      />
                      <div className="medical-upload-content">
                        <div className="medical-upload-icon-wrapper">
                          <svg
                            className="medical-upload-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <div className="medical-upload-text">
                          <p className="medical-upload-title">Upload Image or PDF of Wound</p>
                          <p className="medical-upload-subtitle">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                      </div>
                    </label>
                  )}

                  {errors.woundReferenceFile && (
                    <p className="medical-error-message">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm0 18a8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8z"
                        />
                      </svg>
                      {errors.woundReferenceFile}
                    </p>
                  )}
                </div>
              )}

            </div>

            <div className=" medical-add-group ">
              <label className="medical-add-label required">Ulcer/wound size (cm²)</label>
              <input
                type="number"
                name="woundSize"
                value={formData.section2.woundSize}
                onChange={(e) => handleChange(e, 'section2')}
                step="0.01"
                className={`medical-add-input ${errors.woundSize ? 'medical-add-error-field' : ''}`}
                required
              />
              {errors.woundSize && <span className="error-message">{errors.woundSize}</span>}
            </div>
            {/* Right Foot Section - shown when foot is right or both (and not NA) */}
            {['right', 'both'].includes(formData.section2.foot) && formData.section2.foot !== 'na' && (
              <div className="medical-add-foot-section">
                <h4 className="foot-title">Right Foot</h4>
                {[
                  { key: "forefoot", options: ["Fore foot Dorsal", "Fore foot Plantar", "Nil"] },
                  { key: "midfoot", options: ["Mid foot Dorsal", "Mid foot Plantar", , "Nil"] },
                  { key: "hindfoot", options: ["Hind foot Dorsal", "Hind Foot Plantar", , "Nil"] },
                  // { key: "notApplicable", options: ["Not Applicable"] }
                ].map((section, index) => (
                  <div key={`right-${section.key}`} className="medical-add-group">
                    <div className="medical-add-radio-group">
                      {section.options.map((option) => {
                        const value = option.toLowerCase().replace(/\s+/g, '_');
                        const name = `rightFoot_${section.key}`;
                        const isChecked = formData.section2[name] === value;

                        return (
                          <label className="medical-add-radio-label" key={`right-${section.key}-${value}`}>
                            <input
                              type="radio"
                              name={name}
                              value={value}
                              checked={isChecked}
                              onChange={(e) => handleChange(e, "section2")}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors[`rightFoot_${section.key}`] && (
                      <span className="error-message">{errors[`rightFoot_${section.key}`]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Left Foot Section - shown when foot is left or both (and not NA) */}
            {['left', 'both'].includes(formData.section2.foot) && formData.section2.foot !== 'na' && (
              <div className="medical-add-foot-section">
                <h4 className="foot-title">Left Foot</h4>
                {[
                  { key: "forefoot", options: ["Fore foot Dorsal", "Fore foot Plantar", "Nil"] },
                  { key: "midfoot", options: ["Mid foot Dorsal", "Mid foot Plantar", "Nil"] },
                  { key: "hindfoot", options: ["Hind foot Dorsal", "Hind Foot Plantar", "Nil",] },
                  // { key: "notApplicable", options: ["Not Applicable"] }
                ].map((section, index) => (
                  <div key={`left-${section.key}`} className="medical-add-group">
                    <div className="medical-add-radio-group">
                      {section.options.map((option) => {
                        const value = option.toLowerCase().replace(/\s+/g, '_');
                        const name = `leftFoot_${section.key}`;
                        const isChecked = formData.section2[name] === value;

                        return (
                          <label className="medical-add-radio-label" key={`left-${section.key}-${value}`}>
                            <input
                              type="radio"
                              name={name}
                              value={value}
                              checked={isChecked}
                              onChange={(e) => handleChange(e, "section2")}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors[`leftFoot_${section.key}`] && (
                      <span className="error-message">{errors[`leftFoot_${section.key}`]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className=" medical-add-group ">
              <label className="medical-add-label required">Duration of wound (days)</label>
              <input
                type="number"
                name="woundDuration"
                value={formData.section2.woundDuration}
                onChange={(e) => handleChange(e, 'section2')}
                className={`medical-add-input ${errors.woundDuration ? 'medical-add-error-field' : ''}`}
                required
              />
              {errors.woundDuration && <span className="error-message">{errors.woundDuration}</span>}
            </div>
          </div>


        </div>






        {/* Section 3: Infection Details */}
        <div className="infection-details medical-add-section">
          <h2 className="medical-add-section-title">Infection Details:</h2>
          <div className="medical-add-row3">

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Infection</label>
              <div className={`medical-add-radio-group ${errors.infection ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`infection-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="infection"
                      value={val}
                      checked={
                        val === 'yes'
                          ? ['yes', 1, '1', true].includes(formData?.section2?.infection)
                          : ['no', 0, '0', false].includes(formData?.section2?.infection)
                      }
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.infection && <span className="error-message">{errors.infection}</span>}
            </div>

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Local swelling or induration</label>
              <div className={`medical-add-radio-group ${errors.swelling ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`swelling-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="swelling"
                      value={val}
                      checked={formData?.section2?.swelling === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.swelling && <span className="error-message">{errors.swelling}</span>}
            </div>



            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Erythema around the ulcer</label>
              <div className={`medical-add-radio-group ${errors.erythema ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`erythema-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="erythema"
                      value={val}
                      checked={formData?.section2?.erythema === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.erythema && <span className="error-message">{errors.erythema}</span>}
            </div>



            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Local tenderness or pain</label>
              <div className={`medical-add-radio-group ${errors.tenderness ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`tenderness-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="tenderness"
                      value={val}
                      checked={formData?.section2?.tenderness === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.tenderness && <span className="error-message">{errors.tenderness}</span>}
            </div>

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Is there any warmth/swelling/redness in the foot which is suggestive of cellulitis</label>
              <div className={`medical-add-radio-group ${errors.warmth ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`warmth-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="warmth"
                      value={val}
                      checked={formData?.section2?.warmth === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.warmth && <span className="error-message">{errors.warmth}</span>}
            </div>

            <div className=" medical-add-group medical-add-group2">
              <label className="medical-add-label required">Purulent discharge (thick, opaque to white or sanguineous secretion)</label>
              <div className={`medical-add-radio-group ${errors.purulentDischarge ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((option) => (
                  <label key={option} className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="purulentDischarge"
                      value={option}
                      checked={formData.section2.purulentDischarge === option}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">{option === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.purulentDischarge && (
                <span className="error-message">{errors.purulentDischarge}</span>
              )}
            </div>

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Culture report (if available)</label>
              <div className={`medical-add-radio-group ${errors.cultureReportAvailable ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`cultureReportAvailable-${val}`}>
                    <input
                      type="radio"
                      name="cultureReportAvailable"
                      value={val}
                      checked={formData.section2.cultureReportAvailable === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>

              {formData.section2.cultureReportAvailable === 'yes' && (
                <div className="medical-upload-container">
                  {formData.section2.cultureReportPreview || formData.section2.cultureReport?.type === 'application/pdf' ? (
                    <div className="medical-image-preview-card">
                      <div className="medical-image-preview-wrapper">
                        {formData.section2.cultureReportPreview?.toLowerCase().endsWith(".pdf") ? (
                          <div className="pdf-preview">
                            <FiFileText size={48} />
                            <span>{formData.section2.cultureReportPreview.split("/").pop()}</span>
                            <a href={`${formData.section2.cultureReportPreview}`} target="_blank" class="view-pdf" rel="noopener noreferrer">
                              View PDF
                            </a>
                          </div>
                        ) : (
                          <img
                            src={formData.section2.cultureReportPreview}
                            alt=" Report Preview"
                            className="medical-image-preview"
                          />
                        )}

                        <div className="medical-image-actions">
                          <button
                            type="button"
                            className="medical-image-remove-btn"
                            onClick={handleRemoveCultureReport}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="medical-upload-card">
                      <input
                        type="file"
                        name="cultureReport"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCultureReportUpload}
                        className="medical-upload-input"
                      />
                      <div className="medical-upload-content">
                        <div className="medical-upload-icon-wrapper">
                          <svg
                            className="medical-upload-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <div className="medical-upload-text">
                          <p className="medical-upload-title">Upload Culture report</p>
                          <p className="medical-upload-subtitle">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                      </div>
                    </label>
                  )}
                  {errors.cultureReport && (
                    <p className="medical-error-message">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm0 18a8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8z"
                        />
                      </svg>
                      {errors.cultureReport}
                    </p>
                  )}
                </div>
              )}
              {errors.cultureReportAvailable && <span className="error-message">{errors.cultureReportAvailable}</span>}
            </div>
            {/* Bone Exposure */}

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Probe to Bone</label>
              <div className={`medical-add-radio-group ${errors.probetobone ? 'medical-add-error-group' : ''}`}>
                {[
                  { value: 'positive', label: '+ve' },
                  { value: 'negative', label: '-ve' }
                ].map((option) => (
                  <label className="medical-add-radio-label" key={`probetobone-${option.value}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="probetobone"
                      value={option.value}
                      checked={formData?.section2?.probetobone === option.value}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.probetobone && <span className="error-message">{errors.probetobone}</span>}

            </div>


            {/* 
            <div className="col-md-4">
              <div className="medical-add-group">
                <label className="medical-add-label required">Infection</label>
                <div className={`medical-add-radio-group ${errors.infection ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`infection-${val}`}>
                      <input
                        type="radio"
                        className="medical-add-radio-button"
                        name="infection"
                        value={val}
                        checked={formData?.section2?.infection === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.infection && <span className="error-message">{errors.infection}</span>}
              </div>
            </div>

            <div className="col-md-4">
              <div className="medical-add-group">
                <label className="medical-add-label required">Local swelling or induration</label>
                <div className={`medical-add-radio-group ${errors.swelling ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`swelling-${val}`}>
                      <input
                        type="radio"
                        className="medical-add-radio-button"
                        name="swelling"
                        value={val}
                        checked={formData?.section2?.swelling === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.swelling && <span className="error-message">{errors.swelling}</span>}
              </div>
            </div>

            <div className="col-md-4">
              <div className="medical-add-group">
                <label className="medical-add-label required">Erythema around the ulcer</label>
                <div className={`medical-add-radio-group ${errors.erythema ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`erythema-${val}`}>
                      <input
                        type="radio"
                        className="medical-add-radio-button"
                        name="erythema"
                        value={val}
                        checked={formData?.section2?.erythema === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.erythema && <span className="error-message">{errors.erythema}</span>}
              </div>
            </div>

            <div className="col-md-4">
              <div className="medical-add-group">
                <label className="medical-add-label required">Local tenderness or pain</label>
                <div className={`medical-add-radio-group ${errors.tenderness ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`tenderness-${val}`}>
                      <input
                        type="radio"
                        className="medical-add-radio-button"
                        name="tenderness"
                        value={val}
                        checked={formData?.section2?.tenderness === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.tenderness && <span className="error-message">{errors.tenderness}</span>}
              </div>
            </div>

            <div className="col-md-4">
              <div className="medical-add-group">
                <label className="medical-add-label required">Warmth</label>
                <div className={`medical-add-radio-group ${errors.warmth ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`warmth-${val}`}>
                      <input
                        type="radio"
                        className="medical-add-radio-button"
                        name="warmth"
                        value={val}
                        checked={formData?.section2?.warmth === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.warmth && <span className="error-message">{errors.warmth}</span>}
              </div>
            </div>
          
           */}






          </div>
          <div className="medical-add-row3">
            {/* Osteomyelitis */}

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Osteomyelitis in x-ray foot</label>
              <div className={`medical-add-radio-group ${errors.osteomyelitis ? 'medical-add-error-group' : ''}`}>
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'xray_not_available', label: 'X-ray not available' }// X-ray not available
                ].map((option) => (
                  <label className="medical-add-radio-label" key={`osteomyelitis-${option.value}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="osteomyelitis"
                      value={option.value}
                      checked={formData?.section2?.osteomyelitis === option.value}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.osteomyelitis && <span className="error-message">{errors.osteomyelitis}</span>}

            </div>


            {/* Sepsis */}

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Fever or other signs of sepsis</label>
              <div className={`medical-add-radio-group ${errors.sepsis ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`sepsis-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="sepsis"
                      value={val}
                      checked={formData?.section2?.sepsis === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.sepsis && <span className="error-message">{errors.sepsis}</span>}
            </div>


            {/* Arterial Issues */}

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">
                Presence of arterial stenosis/occlusions (documented by DSA/arterial color doppler/ABI/MRI, if needed)
              </label>
              <div className={`medical-add-radio-group ${errors.arterialStenosis ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`arterialStenosis-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="arterialStenosis"
                      value={val}
                      checked={formData?.section2?.arterialStenosis === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.arterialStenosis && <span className="error-message">{errors.arterialStenosis}</span>}

              {formData.section2.arterialStenosis === 'yes' && (
                <div className="medical-upload-container" style={{ marginTop: '1rem' }}>
                  {formData.section2.arterialReportPreview ? (
                    <div className="medical-image-preview-card">
                      <div className="medical-image-preview-wrapper">
                        {formData.section2.arterialReportPreview.toLowerCase().endsWith('.pdf') ? (
                          <div className="pdf-preview">
                            <FiFileText size={48} />
                            <span>{formData.section2.arterialStenosis.split('/').pop()}</span>
                            <a
                              href={formData.section2.arterialReportPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className='view-pdf'
                            >
                              View PDF
                            </a>
                          </div>
                        ) : (
                          <img
                            src={formData.section2.arterialReportPreview}
                            alt=" Report Preview"
                            className="medical-image-preview"
                          />
                        )}

                        <div className="medical-image-actions">
                          <button
                            type="button"
                            className="medical-image-remove-btn"
                            onClick={handleRemovearterialReport}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path
                                fill="currentColor"
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="medical-upload-card">
                      <input
                        type="file"
                        name="arterialReport"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const isPdf = file.type === 'application/pdf';
                            const previewUrl = isPdf ? URL.createObjectURL(file) : null;

                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleChange(
                                { target: { name: 'arterialReport', value: file } },
                                'section2'
                              );
                              handleChange(
                                {
                                  target: {
                                    name: 'arterialReportPreview',
                                    value: isPdf ? previewUrl : reader.result,
                                  },
                                },
                                'section2'
                              );
                            };

                            if (!isPdf) {
                              reader.readAsDataURL(file);
                            } else {
                              reader.onloadend(); // directly invoke for PDF
                            }
                          }
                        }}
                        className="medical-upload-input"
                      />
                      <div className="medical-upload-content">
                        <div className="medical-upload-icon-wrapper">
                          <svg className="medical-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <div className="medical-upload-text">
                          <p className="medical-upload-title">Upload arterial Report</p>
                          <p className="medical-upload-subtitle">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                      </div>
                    </label>
                  )}

                  {errors.cultureReport && (
                    <p className="medical-error-message">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          fill="currentColor"
                          d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm0 18a8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8z"
                        />
                      </svg>
                      {errors.cultureReport}
                    </p>
                  )}
                </div>
              )}


            </div>



            {/* Necrosis */}

            <div className="medical-add-group medical-add-group2">
              <label className="medical-add-label required">Necrosis of soft tissue</label>
              <div className={`medical-add-radio-group ${errors.necrosis ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`necrosis-${val}`}>
                    <input
                      type="radio"
                      name="necrosis"
                      value={val}
                      checked={formData.section2.necrosis === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.necrosis && <span className="error-message">{errors.necrosis}</span>}

              {/* {formData.section2.necrosis === 'yes' && (
                  <div className="medical-upload-container">
                    {formData.section2.necrosisPhotoPreview ? (
                      <div className="medical-image-preview-card">
                        <div className="medical-image-preview-wrapper">
                          <img
                            src={formData.section2.necrosisPhotoPreview}
                            alt="Necrosis Preview"
                            className="medical-image-preview"
                          />
                          <div className="medical-image-actions">
                            <button
                              type="button"
                              className="medical-image-remove-btn"
                              onClick={() => {
                                handleChange(
                                  { target: { name: 'necrosisPhoto', value: null } },
                                  'section2'
                                );
                                handleChange(
                                  { target: { name: 'necrosisPhotoPreview', value: null } },
                                  'section2'
                                );
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="medical-upload-card">
                        <input
                          type="file"
                          name="necrosisPhoto"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleChange(
                                  { target: { name: 'necrosisPhoto', value: file } },
                                  'section2'
                                );
                                handleChange(
                                  { target: { name: 'necrosisPhotoPreview', value: reader.result } },
                                  'section2'
                                );
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="medical-upload-input"
                          required
                        />
                        <div className="medical-upload-content">
                          <div className="medical-upload-icon-wrapper">
                            <svg
                              className="medical-upload-icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeWidth="2"
                                strokeLinecap="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div className="medical-upload-text">
                            <p className="medical-upload-title">Upload Necrosis Photo</p>
                            <p className="medical-upload-subtitle">JPG, PNG (Max 5MB)</p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                )} */}
            </div>


            {/* Gangrene */}

            <div className="medical-add-group medical-add-group2" >
              <label className="medical-add-label required">Gangrene</label>
              <div className={`medical-add-radio-group ${errors.gangrene ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((val) => (
                  <label className="medical-add-radio-label" key={`gangrene-${val}`}>
                    <input
                      type="radio"
                      className="medical-add-radio-button"
                      name="gangrene"
                      value={val}
                      checked={formData?.section2?.gangrene === val}
                      onChange={(e) => handleChange(e, 'section2')}
                      required
                    />
                    <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.gangrene && <span className="error-message">{errors.gangrene}</span>}

              {formData.section2.gangrene === 'yes' && (
                <div className={`medical-add-radio-group mt-2 ${errors.gangreneType ? 'medical-add-error-group' : ''}`}>
                  {['Wet', 'Dry'].map((val) => (
                    <label className="medical-add-radio-label" key={`gangreneType-${val}`}>
                      <input
                        type="radio"
                        name="gangreneType"
                        value={val}
                        checked={formData.section2.gangreneType === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">{val} gangrene</span>
                    </label>
                  ))}
                  {errors.gangreneType && <span className="error-message">{errors.gangreneType}</span>}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* <div className="infection-details medical-add-section">
          <label className="medical-add-section-title">Wound Classification & Treatment Details (Refer the document and enter details)</label>
          <div className="medical-label-download-wrapper">
            <label className="medical-add-label">Please refer to the picture</label>
            <a href={doctorrefference} download="Wound_Reference.jpg" className="action-btn download-excel">
              <FiDownloadCloud className="download-icon download-icon2" />
              Download Image
            </a>
          </div>

          <div className="Wound-Classification-image">
            <a href={doctorrefference} download="Wound_Reference.jpg">
              <img src={doctorrefference} alt="Reference" style={{ cursor: 'pointer' }} />
            </a>
          </div>

          <div className="medical-add-group">
            <label className="medical-add-label">Wound Classification</label>
            <div className={`medical-add-radio-group ${errors.woundClassification ? 'medical-add-error-group' : ''}`}>
              {['Uncomplicated', 'Complicated', 'Severely complicated'].map((type) => (
                <label key={type} className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="woundClassification"
                    value={type}
                    checked={formData.section2.woundClassification === type}
                    onChange={(e) => handleChange(e, 'section2')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">{type}</span>
                </label>
              ))}
            </div>
            {errors.woundClassification && <span className="error-message">{errors.woundClassification}</span>}
          </div>

         
        </div> */}

        {/* Section 4: Treatment */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Treatment Details</h2>

          <div className="medical-add-row">
            <div className="col-md-4 medical-add-group ">
              <label className="medical-add-label required">Antibiotics given</label>
              <div className={`medical-add-radio-group ${errors.antibioticsGiven ? 'medical-add-error-group' : ''}`}>
                {['no', 'oral', 'iv'].map((option) => (
                  <label key={option} className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="antibioticsGiven"
                      value={option}
                      checked={formData.section2.antibioticsGiven === option}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">
                      {option === 'no' ? 'No' : option === 'oral' ? 'Yes Oral' : 'Yes IV'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.antibioticsGiven && <span className="error-message">{errors.antibioticsGiven}</span>}
            </div>

            <div className="col-md-4 medical-add-group ">
              <label className="medical-add-label required">Surgical Procedure</label>
              <select
                name="surgicalProcedure"
                className={`medical-add-input ${errors.surgicalProcedure ? 'medical-add-error-field' : ''}`}
                value={formData.section2.surgicalProcedure}
                onChange={(e) => handleChange(e, 'section2')}
                required
              >
                <option value="" disabled>Select Procedure</option>
                <option value="callus_excision">Callus Excision</option>
                <option value="sequestectomy">Sequestectomy</option>
                <option value="incision_drainage">Incision & Drainage</option>
                <option value="wound_debridement">Wound Debridement</option>
                <option value="other">Others</option>
              </select>
              {errors.surgicalProcedure && <span className="error-message">{errors.surgicalProcedure}</span>}

              {/* Show additional input field when "Others" is selected */}
              {formData.section2.surgicalProcedure === 'other' && (
                <div className="medical-add-group" style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    name="surgicalProcedureOther"
                    value={formData.section2.surgicalProcedureOther || ''}
                    onChange={(e) => handleChange(e, 'section2')}
                    className={`medical-add-input ${errors.surgicalProcedureOther ? 'medical-add-error-field' : ''}`}
                    placeholder="Please specify other procedure"
                  />
                  {errors.surgicalProcedureOther && (
                    <span className="error-message">{errors.surgicalProcedureOther}</span>
                  )}
                </div>
              )}

            </div>


            <div className="col-md-4 medical-add-group ">
              <label className="medical-add-label required">Amputation</label>
              <div className={`medical-add-radio-group ${errors.amputation ? 'medical-add-error-group' : ''}`}>
                {['no', 'minor', 'major'].map((option) => (
                  <label key={option} className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="amputation"
                      value={option}
                      checked={formData.section2.amputation === option}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">
                      {option === 'no' ? 'No' : option === 'minor' ? 'Minor' : 'Major'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.amputation && <span className="error-message">{errors.amputation}</span>}
              {formData.section2.amputation === 'major' && (
                <div className="medical-add-group">
                  <label className="medical-add-label required">Major amputation level</label>
                  <div className={`medical-add-radio-group ${errors.amputationLevel ? 'medical-add-error-group' : ''}`}>
                    {['Below knee', 'Above knee'].map((option) => (
                      <label key={option} className="medical-add-radio-label">
                        <input
                          type="radio"
                          name="amputationLevel"
                          value={option}
                          checked={formData.section2.amputationLevel === option}
                          onChange={(e) => handleChange(e, 'section2')}
                          className="medical-add-radio-button"
                          required
                        />
                        <span className="medical-add-radio-button-label">{option}</span>
                      </label>
                    ))}
                    {errors.amputationLevel && <span className="error-message">{errors.amputationLevel}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* <div className="col-md-4 medical-add-group">
              <label className="medical-add-label required">Which dressing material was used</label>
              <input
                type="text"
                name="dressingMaterial"
                value={formData.section2.dressingMaterial}
                onChange={(e) => {
                  const newValue = e.target.value;

                  if (/\d/.test(newValue)) {
                    // show error, but don't update state with invalid value
                    setErrors((prev) => ({
                      ...prev,
                      dressingMaterial: "Numbers are not allowed"
                    }));
                  } else {
                    // clear error + update state
                    setErrors((prev) => ({
                      ...prev,
                      dressingMaterial: ""
                    }));

                    handleChange(
                      { target: { name: e.target.name, value: newValue } },
                      "section2"
                    );
                  }
                }}
                className={`medical-add-input ${errors.dressingMaterial ? "medical-add-error-field" : ""}`}
                required
              />
              {errors.dressingMaterial && (
                <span className="error-message">{errors.dressingMaterial}</span>
              )}
            </div> */}

            <div className="col-md-4 medical-add-group">
              <label className="medical-add-label required">
                Which dressing material was used
              </label>
              <select
                name="dressingMaterial"
                value={formData.section2.dressingMaterial}
                onChange={(e) =>
                  handleChange(
                    { target: { name: e.target.name, value: e.target.value } },
                    "section2"
                  )
                }
                className="medical-add-input"
                required
              >
                <option value="">Select dressing material</option>
                <option value="Traditional Dressing">Traditional Dressing</option>
                <option value="Modern Dressing">Modern Dressing</option>
              </select>
              {errors.dressingMaterial && (
                <span className="error-message">{errors.dressingMaterial}</span>
              )}
            </div>


            <div className="col-md-4 medical-add-group ">
              <label className="medical-add-label required">Offloading device</label>
              <input
                type="text"
                name="offloadingDevice"
                value={formData.section2.offloadingDevice}
                onChange={(e) => {
                  const newValue = e.target.value;

                  if (/\d/.test(newValue)) {
                    // Show error, don’t update state with invalid value
                    setErrors((prev) => ({
                      ...prev,
                      offloadingDevice: "Numbers are not allowed"
                    }));
                  } else {
                    // Clear error + update state
                    setErrors((prev) => ({
                      ...prev,
                      offloadingDevice: ""
                    }));

                    handleChange(
                      { target: { name: e.target.name, value: newValue } },
                      "section2"
                    );
                  }
                }}
                className={`medical-add-input ${errors.offloadingDevice ? "medical-add-error-field" : ""}`}
                required
              />
              {errors.offloadingDevice && (
                <span className="error-message">{errors.offloadingDevice}</span>
              )}
            </div>

            <div className="col-md-4">
              <div className="medical-add-group ">
                <label className="medical-add-label required">Other Treatment details, if any</label>
                <div className={`medical-add-radio-group ${errors.other_treatment ? 'medical-add-error-group' : ''}`}>
                  {['yes', 'no'].map((val) => (
                    <label className="medical-add-radio-label" key={`other_treatment-${val}`}>
                      <input
                        type="radio"
                        name="other_treatment"
                        value={val}
                        checked={formData.section2.other_treatment === val}
                        onChange={(e) => handleChange(e, 'section2')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
                {errors.other_treatment && <span className="error-message">{errors.other_treatment}</span>}
              </div>
            </div>

          </div>

          {formData.section2.other_treatment === 'yes' && (
            <div className="medical-add-form-group">
              <label className="medical-add-label required">If Yes, details</label>
              <textarea
                name="other_treatment_details"
                value={formData.section2.other_treatment_details}
                onChange={(e) => handleChange(e, 'section2')}
                rows={3}
                className={`medical-add-input ${errors.other_treatment_details ? 'medical-add-error-field' : ''}`}
                required
              />
              {errors.other_treatment_details && <span className="error-message">{errors.other_treatment_details}</span>}
            </div>
          )}
        </div>

        {/* Section 5: Treatment Outcomes */}
        {/* <div className="medical-add-section">
          <h2 className="medical-add-section-title">Treatment Status (at baseline)</h2>

          <div className="medical-add-row">
            <div className="col-md-4 medical-add-form-group">
              <label className="medical-add-label required">Hospitalization (days)</label>
              <input
                type="number"
                name="hospitalization"
                value={formData.section2.hospitalization}
                onChange={(e) => handleChange(e, 'section2')}
                className={`medical-add-input ${errors.hospitalization ? 'medical-add-error-field' : ''}`}
                required
              />
              {errors.hospitalization && <span className="error-message">{errors.hospitalization}</span>}
            </div>
          </div>

          <div className="medical-add-row">
          

            <div className="col-md-4 medical-add-group">
              <label className="medical-add-label required">Wound debridement</label>
              <div className={`medical-add-radio-group ${errors.debridementWithAmputation ? 'medical-add-error-group' : ''}`}>
                {['yes', 'no'].map((option) => (
                  <label key={option} className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="debridementWithAmputation"
                      value={option}
                      checked={formData.section2.debridementWithAmputation === option}
                      onChange={(e) => handleChange(e, 'section2')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">{option === 'yes' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
              {errors.debridementWithAmputation && (
                <span className="error-message">{errors.debridementWithAmputation}</span>
              )}
            </div>
          </div>

        
        </div> */}
      </form>
    </div>
  );
};

export default StepForm2;