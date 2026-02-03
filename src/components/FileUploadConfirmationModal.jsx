import React from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import './FileUploadConfirmationModal.css';
// import './DeleteConfirmationModal.css';
const FileUploadConfirmationModal = ({
    visible,
    fileName,
    previewData,
    onCancel,
    onConfirm,
    isLoading = false,
}) => {
    return (
        <Modal
            title="Confirm File Upload"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="upload"
                    // type="primary"
                    onClick={onConfirm}
                    loading={isLoading}
                    className='fileconformation-upload'
                >
                    Upload
                </Button>,
            ]}
            centered
            className="file-upload-confirmation-modal"
        >
            <div className="confirmation-content">
                <p className='conformation'>Are you sure you want to upload the file <strong>{fileName}</strong>?</p>

                {/* Preview few records */}
                {/* <div className="preview-table">
                    {previewData.slice(0, 5).map((row, idx) => (
                        <div key={idx} className="preview-row">
                            {Object.values(row).map((cell, index) => (
                                <div key={index} className="preview-cell">{cell}</div>
                            ))}
                        </div>
                    ))}
                    {previewData.length > 5 && <p>...and {previewData.length - 5} more rows</p>}
                </div> */}
            </div>
        </Modal>
    );
};

FileUploadConfirmationModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    fileName: PropTypes.string.isRequired,
    previewData: PropTypes.array.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default FileUploadConfirmationModal;
