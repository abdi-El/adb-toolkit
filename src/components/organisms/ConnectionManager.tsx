import axios from "axios";
import { useEffect, useState } from "react";
import DevicesModal from "../atoms/DevicesModal";
import ConnectionsButtons from "../molecules/ConnectionButtons";
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
        <ConnectionsButtons connected={true}
            connectButtonProps={{
                loading: loading
            }}
            swithButtonProps={{
                onClick: () => {
                    setOpen(true)
                },
                loading: loading
            }}
        />
        <DevicesModal loading={loading} open={open} onCancel={closeModal} onOk={closeModal} devices={devices} />
    </div>
}