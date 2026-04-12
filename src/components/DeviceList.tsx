import {
  Table,
  Badge,
  ActionIcon,
  Text,
  Group,
  Tooltip,
  Paper,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconPlugOff, IconRefresh } from "@tabler/icons-react";
import type { AdbDevice } from "../types/device";

interface Props {
  devices: AdbDevice[];
  loading: boolean;
  onDisconnect: (address: string) => Promise<string>;
  onRefresh: () => Promise<void>;
}

function statusColor(status: string): string {
  switch (status) {
    case "device":
      return "green";
    case "offline":
      return "gray";
    case "unauthorized":
      return "yellow";
    default:
      return "red";
  }
}

export function DeviceList({
  devices,
  loading,
  onDisconnect,
  onRefresh,
}: Props) {
  const { t } = useTranslation();

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Title order={4}>{t("connections.connectedDevices")}</Title>
        <Tooltip label={t("connections.refresh")}>
          <ActionIcon variant="subtle" onClick={onRefresh} loading={loading}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {devices.length === 0 ? (
        <Text c="dimmed" size="sm">
          {t("connections.noDevices")}
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("connections.address")}</Table.Th>
              <Table.Th>{t("connections.status")}</Table.Th>
              <Table.Th>{t("connections.info")}</Table.Th>
              <Table.Th>{t("connections.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {devices.map((device) => (
              <Table.Tr key={device.address}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {device.address}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColor(device.status)} variant="light">
                    {device.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {device.info}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={t("connections.disconnect")}>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => onDisconnect(device.address)}
                    >
                      <IconPlugOff size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
