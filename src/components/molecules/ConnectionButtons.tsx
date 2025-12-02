import { ButtonProps } from "antd";
import ConnectButton from "../atoms/ConnectButton";
import SwitchDeviceButton from "../atoms/SwitchDeviceButton";
interface ConnectionsButtonsProps {
    connected: boolean;
    connectButtonProps?: ButtonProps
    swithButtonProps?: ButtonProps
}
export default function ConnectionsButtons({ connected, connectButtonProps, swithButtonProps }: ConnectionsButtonsProps) {
    return <>
        <ConnectButton connected={connected} {...connectButtonProps} />
        <SwitchDeviceButton connected={connected} {...swithButtonProps} style={{ marginLeft: 10 }} />
    </>
}