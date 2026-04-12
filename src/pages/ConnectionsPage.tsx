import { Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { DeviceList } from "../components/DeviceList";
import { ManualConnect } from "../components/ManualConnect";
import { NetworkScanner } from "../components/NetworkScanner";
import { useAdb } from "../hooks/useAdb";

export function ConnectionsPage() {
  const { t } = useTranslation();
  const {
    devices,
    discovered,
    loading,
    scanning,
    refreshDevices,
    connect,
    disconnect,
    scanNetwork,
    getLocalSubnet,
  } = useAdb();

  const handleConnect = async (address: string) => {
    try {
      const result = await connect(address);
      notifications.show({
        title: t("connections.connectionSuccess"),
        message: result,
        color: "green",
      });
      return result;
    } catch (err) {
      notifications.show({
        title: t("connections.connectionFailed"),
        message: String(err),
        color: "red",
      });
      throw err;
    }
  };

  const handleDisconnect = async (address: string) => {
    try {
      const result = await disconnect(address);
      notifications.show({
        title: t("connections.disconnected"),
        message: result,
        color: "orange",
      });
      return result;
    } catch (err) {
      notifications.show({
        title: t("connections.disconnectFailed"),
        message: String(err),
        color: "red",
      });
      throw err;
    }
  };

  const connectedAddresses = devices.map((d) => d.address);

  return (
    <Stack gap="md">
      <DeviceList
        devices={devices}
        loading={loading}
        onDisconnect={handleDisconnect}
        onRefresh={refreshDevices}
      />
      <ManualConnect onConnect={handleConnect} />
      <NetworkScanner
        discovered={discovered}
        scanning={scanning}
        connectedAddresses={connectedAddresses}
        onScan={scanNetwork}
        onConnect={handleConnect}
        getLocalSubnet={getLocalSubnet}
      />
    </Stack>
  );
}
