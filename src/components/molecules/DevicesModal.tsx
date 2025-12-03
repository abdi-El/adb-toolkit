import { useDevicesStore } from "@/state/devices";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, List, Modal, ModalProps, Row } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import ConnectButton from "../atoms/ConnectButton";

interface DevicesModalProps extends ModalProps { }



export default function DevicesModal(props: DevicesModalProps) {
    const { devices, setDevices } = useDevicesStore()
    const [loading, setLoading] = useState(false);

    function fetchDevices() {
        setLoading(true);
        axios.get('/api/devices').then(res => {
            setDevices(res.data.devices);
        }).finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        if (!devices.length) {
            fetchDevices()
        }
    }, [props.open])

    return <Modal {...props} title="Devices Found" footer={null} >
        <List
            header={<Row justify="space-between" align="middle">
                <span>Available Devices</span>
                <Button icon={<ReloadOutlined />} onClick={fetchDevices} disabled={loading} />
            </Row>}
            loading={loading}
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