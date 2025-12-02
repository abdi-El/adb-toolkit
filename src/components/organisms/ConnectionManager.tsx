import { useState } from "react";
import DevicesModal from "../atoms/DevicesModal";
import ConnectionsButtons from "../molecules/ConnectionButtons";
interface Props extends React.HTMLAttributes<HTMLDivElement> { }
export default function ConnectionManager(props: Props) {
    const [open, setOpen] = useState(false);
    return <div {...props}>
        <ConnectionsButtons connected={false} connectButtonProps={{
            onClick: () => {
                setOpen(true)
            }
        }} />
        <DevicesModal open={open} onCancel={() => {
            setOpen(false)
        }} onOk={() => {
            setOpen(false)
        }} devices={["test", "asd", "asd"]} />
    </div>
}