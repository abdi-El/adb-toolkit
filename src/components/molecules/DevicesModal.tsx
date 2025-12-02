import { List, Modal, ModalProps, Row } from "antd";
import ConnectButton from "../atoms/ConnectButton";

interface DevicesModalProps extends ModalProps {
    devices: string[];
}

export default function DevicesModal({ devices, ...props }: DevicesModalProps) {
    return <Modal {...props} title="Devices Found" footer={null}>
        <List
            size="small"
            bordered
            dataSource={devices}
            renderItem={item => <List.Item>
                <Row justify={"space-between"} align={"middle"} style={{ width: "100%" }}>
                    <span>{item}</span>
                    <ConnectButton deviceIp={item} />
                </Row>
            </List.Item>}
        />

    </Modal>
}