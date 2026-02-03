import React, { useState } from 'react';
import './StepForm.css'; // Using the same CSS file as previous forms

const StepForm4 = ({formData, handleChange, errors}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="medical-add-container">
      <div className="medical-add-header">
        <h1>Follow-up Information</h1>
      </div>

      <form onSubmit={handleSubmit} className="medical-add-form">
        {/* Wound Debridement */}
        <div className="medical-add-section step-form-4">
          <h2 className="medical-add-section-title">Final Treatment Outcomes (after 6 months)</h2>
          
          <div className="medical-add-section">
          

            <div className="medical-add-row">
              {/* First Column */}
              <div className="col-md-4 medical-add-group">
                <label className='medical-add-label required'>Wound debridement performed?</label>
                <div className="medical-add-radio-group">
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="woundDebridement"
                      value="yes"
                      checked={formData.section4.woundDebridement === 'yes'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Yes</span>
                  </label>
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="woundDebridement"
                      value="no"
                      checked={formData.section4.woundDebridement === 'no'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">No</span>
                  </label>
                </div>
              </div>

              {/* Second Column */}
              <div className="col-md-4 medical-add-group">
                <label className='medical-add-label required'>Amputation performed?</label>
                <div className="medical-add-radio-group">
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="amputation"
                      value="yes"
                      checked={formData.section4.amputation === 'yes'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Yes</span>
                  </label>
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="amputation"
                      value="no"
                      checked={formData.section4.amputation === 'no'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">No</span>
                  </label>
                </div>
              </div>

              {/* Third Column */}
              <div className="col-md-4 medical-add-group">
                <label className="medical-add-label required">Has the wound healed?</label>
                <div className="medical-add-radio-group">
                  <label className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="woundHealed"
                      value="yes"
                      checked={formData.section4.woundHealed === 'yes'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Yes</span>
                  </label>
                  <label className="medical-add-radio-label">
                    <input
                      type="radio"
                      name="woundHealed"
                      value="no"
                      checked={formData.section4.woundHealed === 'no'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">No</span>
                  </label>
                </div>
              </div>

              {/* Show healing time if healed */}
              {formData.section4.woundHealed === 'yes' && (
                <div className="col-md-4 medical-add-group">
                  <label className="medical-add-label required">Healing Time (in days)</label>
                  <input
                    type="number"
                    name="healingTime"
                    className="form-control"
                    value={formData.section4.healingTime || ''}
                    onChange={(e) => handleChange(e, 'section4')}
                    required
                  />
                </div>
              )}

              {/* Show conditional fields if not healed */}
              {formData.section4.woundHealed === 'no' && (
                <>
                  {/* Reason */}
                  <div className="col-md-4 medical-add-group">
                    <label className="medical-add-label required">Reason</label>
                    <select
                      name="nonHealingReason"
                      className="form-control"
                      value={formData.section4.nonHealingReason || ''}
                      onChange={(e) => handleChange(e, 'section4')}
                      required
                    >
                      <option value="">-- Select Reason --</option>
                      <option value="Loss of follow up">Loss of follow up</option>
                      <option value="Non-compliance">Non-compliance</option>
                      <option value="Healed and reoccurrence">Healed and reoccurrence</option>
                    </select>
                  </div>

                  {/* Surgical intervention */}
                  <div className="col-md-4 medical-add-group">
                    <label className="medical-add-label required">Surgical intervention performed</label>
                    <select
                      name="surgicalIntervention"
                      className="form-control"
                      value={formData.section4.surgicalIntervention || ''}
                      onChange={(e) => handleChange(e, 'section4')}
                      required
                    >
                      <option value="">-- Select Intervention --</option>
                      <option value="Callus excision">Callus excision</option>
                      <option value="Sequestectomy">Sequestectomy</option>
                      <option value="Incision and drainage">Incision and drainage</option>
                      <option value="Wound debridement">Wound debridement</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Amputation performed */}
                  <div className="col-md-4 medical-add-group">
                    <label className="medical-add-label required">Amputation performed?</label>
                    <div className="medical-add-radio-group">
                      {['No', 'Minor', 'Major'].map((type) => (
                        <label key={type} className="medical-add-radio-label">
                          <input
                            type="radio"
                            name="amputationPerformed"
                            value={type}
                            checked={formData.section4.amputationPerformed === type}
                            onChange={(e) => handleChange(e, 'section4')}
                            className="medical-add-radio-button"
                            required
                          />
                          <span className="medical-add-radio-button-label">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Conditional Amputation Details */}
            {formData.section4.amputation === 'yes' && (
              <div className="medical-add-row mt-3">
                <div className="col-md-6 medical-add-group">
                  <label className='medical-add-label required'>Amputation type</label>
                  <div className="medical-add-radio-group">
                    <label className='medical-add-radio-label'>
                      <input
                        type="radio"
                        name="amputationType"
                        value="minor"
                        checked={formData.section4.amputationType === 'minor'}
                        onChange={(e) => handleChange(e, 'section4')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">Minor</span>
                    </label>
                    <label className='medical-add-radio-label'>
                      <input
                        type="radio"
                        name="amputationType"
                        value="major"
                        checked={formData.section4.amputationType === 'major'}
                        onChange={(e) => handleChange(e, 'section4')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">Major</span>
                    </label>
                  </div>
                </div>

                <div className="col-md-6 medical-add-group">
                  <label className='medical-add-label required'>Amputation level</label>
                  <div className="medical-add-radio-group">
                    <label className='medical-add-radio-label'>
                      <input
                        type="radio"
                        name="amputationLevel"
                        value="below_knee"
                        checked={formData.section4.amputationLevel === 'below_knee'}
                        onChange={(e) => handleChange(e, 'section4')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">Below knee</span>
                    </label>
                    <label className='medical-add-radio-label'>
                      <input
                        type="radio"
                        name="amputationLevel"
                        value="above_knee"
                        checked={formData.section4.amputationLevel === 'above_knee'}
                        onChange={(e) => handleChange(e, 'section4')}
                        className="medical-add-radio-button"
                        required
                      />
                      <span className="medical-add-radio-button-label">Above knee</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {formData.section4.woundHealed === 'yes' && (
              <div className="medical-add-group">
                <label className='required' style={{ minWidth: "350px" }}>Time of Healing (days)</label>
                <input
                  type="number"
                  name="healingTime"
                  value={formData.section4.healingTime}
                  onChange={(e) => handleChange(e, 'section4')}
                  min="1"
                  className="medical-add-input"
                  style={{ maxWidth: "250px" }}
                  required
                />
              </div>
            )}
         
          

            <div className="medical-add-row">
              {/* First Column */}
              <div className="col-md-6 medical-add-group">
                <label className='required' style={{ minWidth: "350px" }}>Presence of recurrent ulcer?</label>
                <div className="medical-add-radio-group">
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="recurrentUlcer"
                      value="yes"
                      checked={formData.section4.recurrentUlcer === 'yes'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Yes</span>
                  </label>
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="recurrentUlcer"
                      value="no"
                      checked={formData.section4.recurrentUlcer === 'no'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">No</span>
                  </label>
                </div>
              </div>

              {/* Second Column */}
              <div className="col-md-6 medical-add-group">
                <label className='required' style={{ minWidth: "350px" }}>Survival status</label>
                <div className="medical-add-radio-group">
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="survivalStatus"
                      value="alive"
                      checked={formData.section4.survivalStatus === 'alive'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Alive</span>
                  </label>
                  <label className='medical-add-radio-label'>
                    <input
                      type="radio"
                      name="survivalStatus"
                      value="death"
                      checked={formData.section4.survivalStatus === 'death'}
                      onChange={(e) => handleChange(e, 'section4')}
                      className="medical-add-radio-button"
                      required
                    />
                    <span className="medical-add-radio-button-label">Death</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Death Information - Full width below */}
            {formData.section4.survivalStatus === 'death' && (
              <div className="medical-add-row">
                <div className="col-md-6 medical-add-group">
                  <label className='required' style={{ minWidth: "350px" }}>Date of death</label>
                  <input
                    type="date"
                    name="deathDate"
                    value={formData.section4.deathDate}
                    onChange={(e) => handleChange(e, 'section4')}
                    className="medical-add-input"
                    onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                    required
                  />
                </div>
                <div className="col-md-6 medical-add-group">
                  <label className='required' style={{ minWidth: "350px" }}>Reason for death?</label>
                  <textarea
                    type="text"
                    name="deathReason"
                    value={formData.section4.deathReason}
                    onChange={(e) => handleChange(e, 'section4')}
                    className="medical-add-input"
                    placeholder="Enter reason for death"
                    required
                  />
                </div>
              </div>
            )}
        </div>
        </div>
      </form>
    </div>
  );
};

export default StepForm4;