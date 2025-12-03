import { useDevicesStore } from "@/state/devices";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, List, Modal, ModalProps, Row } from "antd";
import axios from "axios";
import { useEffect } from "react";
import ConnectButton from "../atoms/ConnectButton";
import DisconnectButton from "../atoms/DisconnectButton";

interface DevicesModalProps extends ModalProps { }



export default function DevicesModal(props: DevicesModalProps) {
    const { devices, setDevices, setDevicesLoading, devicesLoading } = useDevicesStore()

    function fetchDevices() {
        setDevicesLoading(true);
        axios.get('/api/devices').then(res => {
            setDevices(res.data.devices);
        }).finally(() => {
            setDevicesLoading(false);
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
                <Button icon={<ReloadOutlined />} onClick={fetchDevices} disabled={devicesLoading} />
            </Row>}
            loading={devicesLoading}
            size="small"
            bordered
            dataSource={devices}
            renderItem={item => <List.Item>
                <Row justify={"space-between"} align={"middle"} style={{ width: "100%" }}>
                    <span>{item}</span>
                    <ConnectButton deviceIp={item} />
                    <DisconnectButton deviceIp={item} />
                </Row>
            </List.Item>}
        />

    </Modal>
}