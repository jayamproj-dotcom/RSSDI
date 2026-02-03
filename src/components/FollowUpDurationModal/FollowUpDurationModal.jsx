import { Modal, Button, Typography, Space } from "antd";

const { Title, Text } = Typography;

const FollowUpDurationModal = ({ show, onClose, onChoice }) => {
    return (
        <Modal
            open={show}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>
            ]}
            centered
        >
            <div className="text-center">
                <Title level={4}>Schedule Follow-up</Title>
                <Text>Please choose the follow-up period for this patient:</Text>
                <div className="mt-5">
                    <Space size="large">
                        <Button
                            type="primary"
                            onClick={() => onChoice('3-month')}
                        >
                            3 Months
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => onChoice('6-month')}
                        >
                            6 Months
                        </Button>
                    </Space>
                </div>
            </div>
        </Modal>
    );
};

export default FollowUpDurationModal;
