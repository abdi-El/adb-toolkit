import axios from "axios";
import { useEffect, useState } from "react";
import SwitchDeviceButton from "../atoms/SwitchDeviceButton";
import DevicesModal from "../molecules/DevicesModal";

interface Props extends React.HTMLAttributes<HTMLDivElement> { }
export default function ConnectionManager(props: Props) {
    const [open, setOpen] = useState(false);
    const [devices, setDevices] = useState<string[]>([]);
    const [loading, setLoading] = useState(false)
    function fetchDevices() {
        setLoading(true);
        axios.get('/api/devices').then(res => {
            setDevices(res.data.devices);
        }).finally(() => {
            setLoading(false);
        })
    }
    useEffect(fetchDevices, [])
    function closeModal() {
        setOpen(false);
    }
    return <div {...props}>
        <SwitchDeviceButton connected={false} style={{ marginLeft: 10 }}
            onClick={() => {
                setOpen(true)
            }}
            loading={loading}
        />
        <DevicesModal loading={loading} open={open} onCancel={closeModal} onOk={closeModal} devices={devices} />
    </div>
}