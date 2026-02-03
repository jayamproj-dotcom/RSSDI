import { useState } from 'react';
import { Modal, Button, Upload, List, Typography, Space, Divider, message } from 'antd';
import { CloseOutlined, UploadOutlined, DownloadOutlined, CheckCircleOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { ListTodo } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

const UploadPopup = ({
    onClose,
    handleFileUpload,
    handleDownloadForm,
    uploadedFiles,
    handleRemoveFile,
    handleSaveForLater,
    handleUploadComplete,
    isSaving,
    consentFormPdf,
    updatePatientStatus,
    currentPatientId,
    patientName, 
    patientId
}) => {
    const [saveSuccess, setSaveSuccess] = useState(false);
   
    const handleFileChange = (info) => {
        if (info.file.status !== 'uploading') {
            const event = { target: { files: [info.file.originFileObj] } };
            handleFileUpload(event);
        }
    };

    const handleSaveLater = async () => {
        try {
            const success = await handleSaveForLater();
            if (success) {
                updatePatientStatus(currentPatientId, 'Pending', {
                    consentFormStatus: 'saved_for_later',
                    lastUpdated: new Date().toISOString()
                });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            message.error('Failed to save progress');
        }
    };


    const handleCompleteSubmission = async () => {
        try {
            const success = await handleUploadComplete();
            if (success) {
                updatePatientStatus(currentPatientId, 'Completed', {
                    consentFormStatus: 'uploaded',
                    lastUpdated: new Date().toISOString()
                });
                onClose();
            }
        } catch (error) {
            message.error('Failed to complete submission');
        }
    };
    const customRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess('ok');
        }, 0);
    };
    return (
        <Modal
            open={true}
            onCancel={onClose}
            footer={[
                <Button
                    key="save"
                    onClick={handleSaveLater}
                    loading={isSaving}
                    type="default"
                >
                    Save for Later
                </Button>,
                <Button
                    key="complete"
                    type="primary"
                    onClick={handleCompleteSubmission}
                    disabled={uploadedFiles.length === 0 || isSaving}
                    icon={<ListTodo size={16} />}
                    loading={isSaving}
                >
                    Complete Submission
                </Button>
            ]}
            width={600}
            closeIcon={<CloseOutlined />}
            title={<Title level={4} className="title-custom" style={{ margin: 0, color:'#2d6a4f' }}>Upload Concern Form For : {patientName} ({patientId}) </Title>}
        >
            <Paragraph style={{ marginBottom: 20 }}>
                Please upload the signed consent form and any supporting documents.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space direction="horizontal" size="middle" align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Upload
                        customRequest={customRequest}
                        showUploadList={false}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    >
                        <Button
                            icon={<UploadOutlined />}
                            size="large"
                            style={{
                                height: 100,
                                width: 250,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderStyle: 'dashed',
                            }}
                        >
                            <div>Upload Consent Form</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>PDF, DOC, JPG, PNG</Text>
                        </Button>
                    </Upload>

                    <Button
                        icon={<DownloadOutlined />}
                        size="large"
                        onClick={handleDownloadForm}
                        style={{
                            height: 100,
                            width: 250,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div>Click To Download</div>
                        <div>Consent Form</div>
                    </Button>
                </Space>

                {uploadedFiles.length > 0 && (
                    <>
                        <Divider orientation="left">Uploaded Files</Divider>
                        <List
                            size="small"
                            bordered
                            dataSource={uploadedFiles}
                            renderItem={(file, index) => (
                                <List.Item
                                    key={index}
                                    actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveFile(index)} />]}
                                >
                                    <List.Item.Meta avatar={<FileTextOutlined />} title={file.name} />
                                </List.Item>
                            )}
                        />
                    </>
                )}

                {saveSuccess && (
                    <div style={{
                        padding: '10px',
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text>Progress saved successfully!</Text>
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default UploadPopup;