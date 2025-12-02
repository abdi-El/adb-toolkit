import { Modal, ModalProps } from "antd";

interface DevicesModalProps extends ModalProps {
    devices: string[];
}

export default function DevicesModal({ devices, ...props }: DevicesModalProps) {
    return <Modal {...props}>
        <ul>
            {devices.map(device => <li key={device}>{device}</li>)}
        </ul>
    </Modal>
}