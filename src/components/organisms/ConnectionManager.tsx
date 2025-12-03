import { useState } from "react";
import SwitchDeviceButton from "../atoms/SwitchDeviceButton";
import DevicesModal from "../molecules/DevicesModal";

interface Props extends React.HTMLAttributes<HTMLDivElement> { }

export default function ConnectionManager(props: Props) {
    const [open, setOpen] = useState(false);
    function closeModal() {
        setOpen(false);
    }
    return <div {...props}>
        <SwitchDeviceButton connected={false} style={{ marginLeft: 10 }}
            onClick={() => {
                setOpen(true)
            }}
        />
        <DevicesModal open={open} onCancel={closeModal} onOk={closeModal} />
    </div>
}