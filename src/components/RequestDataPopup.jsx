import React from 'react';
import { Modal, Button, List, Typography, Space, Badge } from 'antd';
import { AlertCircle, ArrowRight } from 'lucide-react';

const { Title, Text } = Typography;

const RequestDataPopup = ({ visible, onClose, requestedPatients }) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={[
                <Button
                    key="continue"
                    type="primary"
                    onClick={onClose}
                    size="large"
                    style={{
                        backgroundColor: '#2d6a4f',
                        borderColor: '#2d6a4f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                    }}
                >
                    Continue <ArrowRight size={18} />
                </Button>
            ]}
            width={600}
            centered
            closable={false}
            maskClosable={false}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc3545' }}>
                    <AlertCircle size={24} />
                    <Title level={4} style={{ margin: 0, color: '#dc3545' }}>Requesting data for – Musculoskeletal Exam </Title>
                </div>
            }
        >
            {/* <div style={{ marginBottom: '20px' }}>
                <Text style={{ fontSize: '16px' }}>
                    The following patients have data correction requests from the administrator. Please update the musculoskeletal exam for these records.
                </Text>
            </div>

            <List
                bordered
                dataSource={requestedPatients}
                renderItem={(patient) => (
                    <List.Item
                        key={patient.patientId}
                        style={{ padding: '12px 16px' }}
                    >
                        <List.Item.Meta
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong style={{ fontSize: '15px' }}>{patient.patient_name}</Text>
                                    <Badge status="error" text="Correction Needed" />
                                </div>
                            }
                            description={
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary">Patient ID: {patient.patientId}</Text>
                                    <Text type="secondary">Status: {patient.status}</Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    borderRadius: '8px',
                    borderColor: '#f5f5f5'
                }}
            /> */}

            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff8f8', borderRadius: '6px', border: '1px solid #ffe3e3' }}>
                <Text type="danger" size="small">
                    * Note: You can find these requests in the "Request Data" column on your dashboard.
                </Text>
            </div>
        </Modal>
    );
};

export default RequestDataPopup;
