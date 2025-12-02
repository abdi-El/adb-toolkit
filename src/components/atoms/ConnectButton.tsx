import { Button, ButtonProps } from "antd";

interface ConnectButtonProps extends ButtonProps {
    connected: boolean;
}
export default function ConnectButton({ connected, ...props }: ConnectButtonProps) {
    return <Button type={connected ? "default" : "primary"} {...props}>
        {connected ? "Disconnect" : "Connect to Device"}
    </Button>
}