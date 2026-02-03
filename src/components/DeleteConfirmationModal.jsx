import React from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({
    visible,
    itemName,
    onCancel,
    onConfirm,
    isLoading = false,
    itemType = 'item'
}) => {
    return (
        <Modal
            title="Confirm Delete"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="delete"
                    type="primary"
                    danger
                    onClick={onConfirm}
                    loading={isLoading}
                >
                    Delete
                </Button>,
               
            ]}
            centered
            className="delete-confirmation-modal"
        >
            <div className="confirmation-content">
                <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
                <p>This {itemType} will be permanently removed.</p>
            </div>
        </Modal>
    );
};

DeleteConfirmationModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    itemName: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    itemType: PropTypes.string
};

export default DeleteConfirmationModal;