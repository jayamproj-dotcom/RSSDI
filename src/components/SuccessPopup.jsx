"use client";
import { Modal, Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SuccessPopup = ({
  visible,
  onClose,
  type = "save",
  showSubmitOption = false,
  showEditOption = false, // New prop for edit button
  message = "",
  onContinueToSubmit,
  onEdit, // New prop for edit handler
  redirectAfterClose = false,
  redirectUrl = "/user/dashboard",
  redirectDelay = 3000,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (visible && redirectAfterClose) {
      const timer = setTimeout(() => {
        onClose();
        navigate(redirectUrl);
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, redirectAfterClose, onClose, navigate, redirectUrl, redirectDelay]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      closable={false}
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <CheckCircleFilled style={{ fontSize: 64, color: "#52c41a", marginBottom: 16 }} />
        <h3 style={{ fontSize: 20, marginBottom: 16 }}>
          {type === "save" ? "Saved Successfully!" : "Form Submitted!"}
        </h3>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
          {message ||
            (type === "save"
              ? "Your progress has been saved."
              : "Your form has been submitted successfully.")}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Button onClick={onClose} size="large">
            {showEditOption ? "Return to Dashboard" : "Close"}
          </Button>
          {showSubmitOption && (
            <Button type="primary" size="large" onClick={onContinueToSubmit}>
              Submit Form
            </Button>
          )}
          {showEditOption && (
            <Button type="primary" size="large" onClick={onEdit}>
              Edit Form
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessPopup;