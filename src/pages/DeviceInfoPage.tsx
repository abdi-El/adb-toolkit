import { useState, useEffect } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Text,
  Table,
  Button,
  Loader,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import { IconRefresh, IconPower } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { DeviceSelector } from "../components/DeviceSelector";

interface DeviceInfo {
  model: string;
  manufacturer: string;
  android_version: string;
  sdk_version: string;
  device_name: string;
  serial: string;
  resolution: string;
  ip_address: string;
  total_storage: string;
  available_storage: string;
}

export function DeviceInfoPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInfo = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const result = await invoke<DeviceInfo>("adb_device_info", { address: device });
      setInfo(result);
    } catch (err) {
      notifications.show({ title: "Error", message: String(err), color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (device) loadInfo();
  }, [device]);

  const doReboot = async (mode: string) => {
    try {
      await invoke<string>("adb_reboot", { address: device, mode });
      notifications.show({
        title: t("deviceInfo.rebooting"),
        message: mode === "normal" ? t("deviceInfo.rebootNormal") : mode,
        color: "orange",
      });
    } catch (err) {
      notifications.show({ title: "Error", message: String(err), color: "red" });
    }
  };

  const reboot = (mode: string) => {
    if (!device) return;
    if (mode === "recovery" || mode === "bootloader") {
      const msgKey = mode === "recovery" ? "confirm.rebootRecovery" : "confirm.rebootBootloader";
      modals.openConfirmModal({
        title: t("confirm.title"),
        children: <Text size="sm">{t(msgKey)}</Text>,
        labels: { confirm: t("confirm.confirm"), cancel: t("confirm.cancel") },
        confirmProps: { color: "red" },
        onConfirm: () => doReboot(mode),
      });
    } else {
      doReboot(mode);
    }
  };

  const rows = info
    ? [
        [t("deviceInfo.model"), info.model],
        [t("deviceInfo.manufacturer"), info.manufacturer],
        [t("deviceInfo.androidVersion"), info.android_version],
        [t("deviceInfo.sdkVersion"), info.sdk_version],
        [t("deviceInfo.deviceName"), info.device_name],
        [t("deviceInfo.serial"), info.serial],
        [t("deviceInfo.resolution"), info.resolution],
        [t("deviceInfo.ipAddress"), info.ip_address],
        [t("deviceInfo.totalStorage"), info.total_storage],
        [t("deviceInfo.availableStorage"), info.available_storage],
      ]
    : [];

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>{t("deviceInfo.title")}</Title>
          {device && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={loadInfo}
              loading={loading}
            >
              {t("connections.refresh")}
            </Button>
          )}
        </Group>

        <DeviceSelector value={device} onChange={setDevice} />

        {loading && (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        )}

        {info && !loading && (
          <>
            <Table>
              <Table.Tbody>
                {rows.map(([label, value]) => (
                  <Table.Tr key={label}>
                    <Table.Td w={180}>
                      <Text size="sm" fw={500}>{label}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{value || "—"}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Divider my="md" label={t("deviceInfo.reboot")} labelPosition="center" />

            <Group>
              <Button
                variant="light"
                color="orange"
                leftSection={<IconPower size={16} />}
                onClick={() => reboot("normal")}
              >
                {t("deviceInfo.rebootNormal")}
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconPower size={16} />}
                onClick={() => reboot("recovery")}
              >
                Recovery
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconPower size={16} />}
                onClick={() => reboot("bootloader")}
              >
                Bootloader
              </Button>
            </Group>
          </>
        )}
      </Paper>
    </Stack>
  );
}
