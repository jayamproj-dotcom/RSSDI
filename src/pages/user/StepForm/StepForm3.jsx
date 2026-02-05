import React, { useState, useRef } from 'react';
import './StepForm.css';
import LeftFoot from '../../../assets/images/leftfoot.jpg'
import RightFoot from '../../../assets/images/rightfoot.jpg'
import { FiDownloadCloud } from 'react-icons/fi';
import DocumentforTest from '.././../../assets/DocumentforTest.pdf';

const StepForm3 = ({ formData, handleChange, errors }) => {

  console.log('formData', formData.section3);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };
  const fileInputRef = useRef(null);

  const monofilamentPoints = ['A', 'B', 'C'];
  const tuningForkPoints = ['Big Toe', 'Medial Malleolus', 'Lateral Malleolus'];

  const [previewImage, setPreviewImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');


  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setErrorMsg(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB");
      return;
    }

    setErrorMsg(null);

    // If it's an image, create a preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleChange(
          { target: { name: "footImagePreview", value: reader.result } },
          "section3"
        );
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or other non-previewable file types
      setPreviewImage(null);
      handleChange(
        { target: { name: "footImagePreview", value: null } },
        "section3"
      );
    }

    handleChange(
      { target: { name: "footImage", value: file } },
      "section3"
    );
  };

  const handleRemoveFootImage = () => {
    if (formData.section3.footImagePreview) {
      URL.revokeObjectURL(formData.section3.footImagePreview);
    }

    handleChange({ target: { name: 'footImage', value: null } }, 'section3');
    handleChange({ target: { name: 'footImagePreview', value: null } }, 'section3');
    setPreviewImage(null);

    // Optionally clear file input if you're using a ref
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // const handleTestTypeChange = (e) => { 
  //   const selectedTestType = e.target.value;
  //   handleChange(e, "section3");
  //   if (selectedTestType === "monofilament") {
  //     TUNING_FORK_FIELDS.forEach((field) => {
  //       handleChange({ target: { name: field, value: null } }, "section3");
  //     });
  //   }
  //   if (selectedTestType === "tuningFork") {
  //     MONOFILAMENT_FIELDS.forEach((field) => {
  //       handleChange({ target: { name: field, value: null } }, "section3");
  //     });
  //   }
  // }; 

  const handleTestTypeChange = (e) => {
    handleChange(e, "section3");
  };

  const normalize = (val) => val?.toString().trim().toLowerCase();


  return (
    <div className="medical-add-container">
      {/* <div className="medical-add-header">
        <h1>3-Minute Foot Examination</h1>
      </div> */}

      <form onSubmit={handleSubmit} className="medical-add-form">
        {/* Presence of Symptoms Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Presence of Symptoms</h2>

          <div className="medical-add-row3">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Do you have burning or tingling sensation in feet or leg?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="burningSensation"
                    value="yes"
                    checked={normalize(formData.section3.burningSensation) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />

                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="burningSensation"
                    value="no"
                    checked={normalize(formData.section3.burningSensation) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.burningSensation && <span className="error-message">{errors.burningSensation}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Does your leg or foot pain while walking?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="painWhileWalking"
                    value="yes"
                    checked={normalize(formData.section3.painWhileWalking) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="painWhileWalking"
                    value="no"
                    checked={normalize(formData.section3.painWhileWalking) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.painWhileWalking && <span className="error-message">{errors.painWhileWalking}</span>}
            </div>
            <div className="medical-add-group">
              <label className='medical-add-label required'>Are there changes in skin color or skin lesions?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinChanges"
                    value="yes"
                    checked={normalize(formData.section3.skinChanges) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinChanges"
                    value="no"
                    checked={normalize(formData.section3.skinChanges) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.skinChanges && <span className="error-message">{errors.skinChanges}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Is there any loss of lower extremity sensation in the leg/foot?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="sensationLoss"
                    value="yes"
                    checked={normalize(formData.section3.sensationLoss) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="sensationLoss"
                    value="no"
                    checked={normalize(formData.section3.sensationLoss) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.sensationLoss && <span className="error-message">{errors.sensationLoss}</span>}
            </div>
          </div>

        </div>

        {/* Dermatologic Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Dermatologic Exam</h2>

          <div className="medical-add-row3">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have discolored, ingrown, or elongated nails?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="nailProblems"
                    value="yes"
                    checked={normalize(formData.section3.nailProblems) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="nailProblems"
                    value="no"
                    checked={normalize(formData.section3.nailProblems) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.nailProblems && <span className="error-message">{errors.nailProblems}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Are there signs of fungal infection especially in between the toes?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="fungalInfection"
                    value="yes"
                    checked={normalize(formData.section3.fungalInfection) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="fungalInfection"
                    value="no"
                    checked={normalize(formData.section3.fungalInfection) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.fungalInfection && <span className="error-message">{errors.fungalInfection}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have discolored and/or hypertrophic skin lesions, calluses, or corns?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinLesions"
                    value="yes"
                    checked={normalize(formData.section3.skinLesions) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinLesions"
                    value="no"
                    checked={normalize(formData.section3.skinLesions) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.skinLesions && <span className="error-message">{errors.skinLesions}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have open cracks or heel fissure?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="openCrack"
                    value="yes"
                    checked={normalize(formData.section3.openCrack) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="openCrack"
                    value="no"
                    checked={normalize(formData.section3.openCrack) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.openCrack && <span className="error-message">{errors.openCrack}</span>}
            </div>

            {/* <div className="medical-add-group">
              <label className='required'>Is there any warmth/swelling/redness in the foot which is suggestive of cellulitis?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="cellulitis"
                    value="yes"
                    checked={formData.section3.cellulitis === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="cellulitis"
                    value="no"
                    checked={formData.section3.cellulitis === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
                {errors.cellulitis && <span className="error-message">{errors.cellulitis}</span>}
            </div> */}
          </div>


        </div>

        {/* Neurologic Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Neurologic Exam</h2>
          {/* Download PDF Link */}
          <div className="medical-label-download-wrapper medical-label-download-wrapper2 pdfdownlaod">
            <label className="medical-add-label label-with-arrow">
              Download & Refer the document for tests

            </label>

            <a
              href={DocumentforTest}
              download="DocumentforTest.pdf"
              className="action-btn download-excel"
            >
              <FiDownloadCloud className="download-icon download-icon2" />
              Download document for tests
            </a>
          </div>

          {/* Always show test type selection */}
          <div className="test-type-selector mb-4">
            <label className="subtitle required">Select Test Type:</label>
            <div className="medical-add-radio-group">
              <label className='medical-add-radio-label'>
                <input
                  type="radio"
                  name="testType"
                  value="monofilament"
                  checked={normalize(formData.section3.testType) === 'monofilament'}
                  onChange={handleTestTypeChange}
                  className="medical-add-radio-button"
                />
                <span className="medical-add-radio-button-label">10g Monofilament Test</span>
              </label>

              <label className='medical-add-radio-label'>
                <input
                  type="radio"
                  name="testType"
                  value="tuningFork"
                  checked={normalize(formData.section3.testType) === 'tuningfork'}
                  onChange={handleTestTypeChange}   // ✅ FIXED
                  className="medical-add-radio-button"
                />
                <span className="medical-add-radio-button-label">128Hz Tuning Fork Test</span>
              </label>

              {errors.testType && <span className="error-message">{errors.testType}</span>}
            </div>
          </div>



          {/* Conditionally show selected test fields */}
          {formData.section3.testType === 'monofilament' && (
            <>
              <label className="subtitle required">Is the patient responsive to 10g monofilament?</label>

              {/* First Row - Left Foot */}
              <div className="medical-add-row align-items-center ">
                <div className="">
                  <div className="foot-image-container medical-add-group text-center">
                    <label className="subtitle required right-foot">Right Foot</label>
                    <img
                      src={LeftFoot}
                      alt="Foot monofilament test points 1"
                      className="img-fluid foot-diagram"
                    />
                  </div>
                </div>
                <div className="medical-add-group">
                  <div className="monofilament-test-options">
                    {monofilamentPoints.map((point) => (
                      <div className="monofilament-point" key={`left-${point}`}>
                        <span className="point-label">{point}</span>
                        <div className="medical-add-radio-group">
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentLeft${point}`}
                              value="yes"
                              checked={normalize(formData.section3[`monofilamentLeft${point}`]) === 'yes'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Yes</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentLeft${point}`}
                              value="no"
                              checked={normalize(formData.section3[`monofilamentLeft${point}`]) === 'no'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">No</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentLeft${point}`}
                              value="not_tested"
                              checked={normalize(formData.section3[`monofilamentLeft${point}`]) === 'not_tested'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Not tested due to ulcer</span>
                          </label>
                          {errors[`monofilamentLeft${point}`] && (
                            <span className="error-message">{errors[`monofilamentLeft${point}`]}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Row - Right Foot */}
              <div className="row align-items-center medical-add-row">
                <div className="col-md-6">
                  <div className="foot-image-container text-center medical-add-group">
                    <label className="subtitle required right-foot">Left Foot</label>
                    <img
                      src={RightFoot}
                      alt="Foot monofilament test points 2"
                      className="img-fluid foot-diagram"
                    />
                  </div>
                </div>
                <div className="col-md-6 medical-add-group">
                  <div className="monofilament-test-options">
                    {monofilamentPoints.map((point) => (
                      <div className="monofilament-point" key={`right-${point}`}>
                        <span className="point-label">{point}</span>
                        <div className="medical-add-radio-group">
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentRight${point}`}
                              value="yes"
                              checked={normalize(formData.section3[`monofilamentRight${point}`]) === 'yes'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Yes</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentRight${point}`}
                              value="no"
                              checked={normalize(formData.section3[`monofilamentRight${point}`]) === 'no'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">No</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`monofilamentRight${point}`}
                              value="not_tested"
                              checked={normalize(formData.section3[`monofilamentRight${point}`]) === 'not_tested'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Not tested due to ulcer</span>
                          </label>
                          {errors[`monofilamentRight${point}`] && (
                            <span className="error-message">{errors[`monofilamentRight${point}`]}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.section3.testType === 'tuningFork' && (
            <>
              <label className="subtitle required">Is the patient responsive to 128 Hz Tuning Fork?</label>
              {/* <label className="point-label required">128Hz Tuning Fork Test Results</label> */}

              {/* Right Foot */}
              <div className="medical-add-row">
                <div className="col-md-6 medical-add-group">
                  <h4 className="foot-title right-foot">Right Foot</h4>
                  <div className="tuning-fork-test-options">
                    {tuningForkPoints.map((point) => (
                      <div className="tuning-fork-point subtitle" key={`right-${point}`}>
                        <span className="point-label">{point}</span>
                        <div className="medical-add-radio-group">
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkRight${point.replace(/\s+/g, '')}`}
                              value="yes"
                              checked={normalize(formData.section3[`tuningForkRight${point.replace(/\s+/g, '')}`]) === 'yes'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Yes</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkRight${point.replace(/\s+/g, '')}`}
                              value="no"
                              checked={normalize(formData.section3[`tuningForkRight${point.replace(/\s+/g, '')}`]) === 'no'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">No</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkRight${point.replace(/\s+/g, '')}`}
                              value="not_tested"
                              checked={normalize(formData.section3[`tuningForkRight${point.replace(/\s+/g, '')}`]) === 'not_tested'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Not tested</span>
                          </label>
                          {errors[`tuningForkRight${point.replace(/\s+/g, '')}`] && (
                            <span className="error-message">{errors[`tuningForkRight${point.replace(/\s+/g, '')}`]}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-6 medical-add-group">
                  <h4 className="foot-title right-foot">Left Foot</h4>
                  <div className="tuning-fork-test-options">
                    {tuningForkPoints.map((point) => (
                      <div className="tuning-fork-point" key={`left-${point}`}>
                        <span className="point-label">{point}</span>
                        <div className="medical-add-radio-group">
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkLeft${point.replace(/\s+/g, '')}`}
                              value="yes"
                              checked={normalize(formData.section3[`tuningForkLeft${point.replace(/\s+/g, '')}`]) === 'yes'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Yes</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkLeft${point.replace(/\s+/g, '')}`}
                              value="no"
                              checked={normalize(formData.section3[`tuningForkLeft${point.replace(/\s+/g, '')}`]) === 'no'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">No</span>
                          </label>
                          <label className='medical-add-radio-label'>
                            <input
                              type="radio"
                              name={`tuningForkLeft${point.replace(/\s+/g, '')}`}
                              value="not_tested"
                              checked={normalize(formData.section3[`tuningForkLeft${point.replace(/\s+/g, '')}`]) === 'not_tested'}
                              onChange={(e) => handleChange(e, 'section3')}
                              className="medical-add-radio-button"
                            />
                            <span className="medical-add-radio-button-label">Not tested</span>
                          </label>
                          {errors[`tuningForkLeft${point.replace(/\s+/g, '')}`] && (
                            <span className="error-message">{errors[`tuningForkLeft${point.replace(/\s+/g, '')}`]}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Left Foot */}
              <div className="medical-add-row">

              </div>
            </>
          )}
        </div>


        {/* Musculoskeletal Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Musculoskeletal Exam</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have obvious deformities in the feet?</label>
              <div className={`medical-add-radio-group ${errors.footDeformities ? 'medical-add-error-group' : ''}`}>
                {[
                  { value: 'no', label: 'No' },
                  { value: 'minor', label: 'Minor' },
                  { value: 'major', label: 'Major' }
                ].map((option) => (
                  <label className='medical-add-radio-label' key={`footDeformities-${option.value}`}>
                    <input
                      type="radio"
                      name="footDeformities"
                      value={option.value}
                      checked={normalize(formData.section3.footDeformities) === normalize(option.value)}
                      onChange={(e) => handleChange(e, 'section3')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.footDeformities && <span className="error-message">{errors.footDeformities}</span>}
            </div>
            {/* {formData.section3.footDeformities === 'yes' && (
              <div className="medical-add-group">
                <label className='required medical-add-radio-label'>If yes, for how long?</label>
                <input
                  type="text"
                  name="deformityDuration"
                  value={formData.section3.deformityDuration}
                  onChange={(e) => handleChange(e, 'section3')}
                  placeholder="Duration (e.g. 2 years)"
                  className="medical-add-input"
                  required
                />
                {errors.deformityDuration && <span className="error-message">{errors.deformityDuration}</span>}
              </div>
            )} */}
          </div>
        </div>

        {/* Vascular Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Vascular Exam</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Is there hair loss on the lower limb ?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="hairLoss"
                    value="yes"
                    checked={normalize(formData.section3.hairLoss) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="hairLoss"
                    value="no"
                    checked={normalize(formData.section3.hairLoss) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.hairLoss && <span className="error-message">{errors.hairLoss}</span>}
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Are the dorsalis pedis and posterior tibial pulses palpable?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="pulsesPalpable"
                    value="yes"
                    checked={normalize(formData.section3.pulsesPalpable) === 'yes'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="pulsesPalpable"
                    value="no"
                    checked={normalize(formData.section3.pulsesPalpable) === 'no'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
              </div>
              {errors.pulsesPalpable && <span className="error-message">{errors.pulsesPalpable}</span>}
            </div>
            <div className="medical-add-group">
              <label className='medical-add-label required'>Is the temperature of the skin cold/warm/normal?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="cold"
                    checked={normalize(formData.section3.skinTemperature) === 'cold'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Cold</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="warm"
                    checked={normalize(formData.section3.skinTemperature) === 'warm'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Warm</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="normal"
                    checked={normalize(formData.section3.skinTemperature) === 'normal'}
                    onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Normal</span>
                </label>
              </div>
              {errors.skinTemperature && <span className="error-message">{errors.skinTemperature}</span>}
            </div>
          </div>
          {/* <div className="medical-add-group">
            <label className="medical-add-label required">Select Follow-up Duration</label>
            <div className="medical-add-radio-group">
              <label className="medical-add-radio-label">
                <input
                  type="radio"
                  name="followUpDuration"
                  value="3-month"
                  checked={formData.section3.followUpDuration === '3-month'}
                  onChange={(e) => handleChange(e, 'section3')}
                  className="medical-add-radio-button"
                  required
                />
                <span className="medical-add-radio-button-label">3 Months</span>
              </label>
              <label className="medical-add-radio-label">
                <input
                  type="radio"
                  name="followUpDuration"
                  value="6-month"
                  checked={formData.section3.followUpDuration === '6-month'}
                  onChange={(e) => handleChange(e, 'section3')}
                  className="medical-add-radio-button"
                  required
                />
                <span className="medical-add-radio-button-label">6 Months</span>
              </label>
            </div>
            {errors.followUpDuration && (
              <span className="error-message">{errors.followUpDuration}</span>
            )}
          </div> */}

        </div>

        {/* Foot Image Upload */}
        {/* <div className="medical-add-section">
          <h2 className="medical-add-section-title">Patient's Foot Image (Optional)</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <div className="medical-image-preview-card">
                {previewImage || formData.section3.footImagePreview ? (
                  <div className="medical-image-preview-wrapper">
                    <img
                      src={previewImage || formData.section3.footImagePreview}
                      alt="Foot preview"
                      className="medical-image-preview"
                    />
                    <div className="medical-image-actions">
                      <button
                        type="button"
                        className="medical-image-remove-btn"
                        onClick={handleRemoveFootImage}
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
                ) : (
                  <label className="medical-upload-card">
                    <input
                      type="file"
                      name="footImage"
                      accept="image/*,application/pdf"
                      onChange={handleImageChange}
                      className="medical-upload-input"
                      ref={fileInputRef}
                    />

                    <div className="medical-upload-content">
                      <div className="medical-upload-icon-wrapper">
                        <svg className="medical-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="medical-upload-text">
                        <p className="medical-upload-title">Click to Upload foot image</p>
                        <p className="medical-upload-subtitle">JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  </label>
                )}
                {errorMsg && (
                  <div className="medical-add-image-upload-error">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
                    </svg>
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>  */}
      </form>
    </div>
  );
};

export default StepForm3;