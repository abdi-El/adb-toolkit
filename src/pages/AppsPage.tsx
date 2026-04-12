import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  Table,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import {
  IconTrash,
  IconUpload,
  IconRefresh,
  IconSearch,
  IconPlayerStop,
  IconEraser,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { DeviceSelector } from "../components/DeviceSelector";

export function AppsPage() {
  const { t } = useTranslation();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [packages, setPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [filter, setFilter] = useState("");

  const loadPackages = useCallback(async () => {
    if (!selectedDevice) return;
    setLoading(true);
    try {
      const pkgs = await invoke<string[]>("adb_list_packages", {
        address: selectedDevice,
      });
      setPackages(pkgs.sort());
    } catch (err) {
      notifications.show({
        title: t("apps.loadFailed"),
        message: String(err),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDevice, t]);

  useEffect(() => {
    if (selectedDevice) loadPackages();
  }, [selectedDevice, loadPackages]);

  const handleUninstall = (pkg: string) => {
    if (!selectedDevice) return;
    modals.openConfirmModal({
      title: t("confirm.title"),
      children: <Text size="sm">{t("confirm.uninstall", { package: pkg })}</Text>,
      labels: { confirm: t("confirm.confirm"), cancel: t("confirm.cancel") },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await invoke<string>("adb_uninstall", {
            address: selectedDevice,
            package: pkg,
          });
          notifications.show({
            title: t("apps.uninstalled"),
            message: pkg,
            color: "teal",
          });
          setPackages((prev) => prev.filter((p) => p !== pkg));
        } catch (err) {
          notifications.show({
            title: t("apps.uninstallFailed"),
            message: String(err),
            color: "red",
          });
        }
      },
    });
  };

  const handleForceStop = async (pkg: string) => {
    if (!selectedDevice) return;
    try {
      await invoke<string>("adb_force_stop", { address: selectedDevice, package: pkg });
      notifications.show({ title: t("apps.forceStopped"), message: pkg, color: "orange" });
    } catch (err) {
      notifications.show({ title: "Error", message: String(err), color: "red" });
    }
  };

  const handleClearData = (pkg: string) => {
    if (!selectedDevice) return;
    modals.openConfirmModal({
      title: t("confirm.title"),
      children: <Text size="sm">{t("confirm.clearData", { package: pkg })}</Text>,
      labels: { confirm: t("confirm.confirm"), cancel: t("confirm.cancel") },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await invoke<string>("adb_clear_data", { address: selectedDevice, package: pkg });
          notifications.show({ title: t("apps.dataCleared"), message: pkg, color: "orange" });
        } catch (err) {
          notifications.show({ title: "Error", message: String(err), color: "red" });
        }
      },
    });
  };

  const handleBulkInstall = async () => {
    if (!selectedDevice) return;
    const files = await open({
      title: t("apps.selectApk"),
      filters: [{ name: "APK", extensions: ["apk"] }],
      multiple: true,
    });
    if (!files || files.length === 0) return;

    setInstalling(true);
    let success = 0;
    for (const file of files) {
      try {
        await invoke<string>("adb_install", { address: selectedDevice, apkPath: file });
        success++;
      } catch (_) { /* continue */ }
    }
    notifications.show({
      title: t("apps.installed"),
      message: `${success}/${files.length} APK`,
      color: success === files.length ? "teal" : "orange",
    });
    await loadPackages();
    setInstalling(false);
  };

  const handleInstall = async () => {
    if (!selectedDevice) return;
    const file = await open({
      title: t("apps.selectApk"),
      filters: [{ name: "APK", extensions: ["apk"] }],
      multiple: false,
    });
    if (!file) return;

    setInstalling(true);
    try {
      await invoke<string>("adb_install", {
        address: selectedDevice,
        apkPath: file,
      });
      notifications.show({
        title: t("apps.installed"),
        message: String(file).split("/").pop() ?? "APK",
        color: "teal",
      });
      await loadPackages();
    } catch (err) {
      notifications.show({
        title: t("apps.installFailed"),
        message: String(err),
        color: "red",
      });
    } finally {
      setInstalling(false);
    }
  };

  const filtered = filter
    ? packages.filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
    : packages;

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Title order={4}>{t("apps.title")}</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconUpload size={16} />}
              onClick={handleBulkInstall}
              loading={installing}
              disabled={!selectedDevice}
            >
              {t("apps.bulkInstall")}
            </Button>
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={handleInstall}
              loading={installing}
              disabled={!selectedDevice}
            >
              {t("apps.installApk")}
            </Button>
          </Group>
        </Group>

        <DeviceSelector value={selectedDevice} onChange={setSelectedDevice} />

        {selectedDevice && (
          <>
            <Group mb="sm">
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder={t("apps.filterPackages")}
                value={filter}
                onChange={(e) => setFilter(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Tooltip label={t("connections.refresh")}>
                <ActionIcon
                  variant="subtle"
                  onClick={loadPackages}
                  loading={loading}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {loading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  {t("apps.loadingPackages")}
                </Text>
              </Group>
            ) : filtered.length === 0 ? (
              <Text c="dimmed" size="sm">
                {filter ? t("apps.noMatch") : t("apps.noPackages")}
              </Text>
            ) : (
              <>
                <Text size="xs" c="dimmed" mb="xs">
                  {t("apps.packagesCount", { count: filtered.length })}
                  {filter ? ` ${t("apps.matching")}` : ""}
                </Text>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t("apps.package")}</Table.Th>
                      <Table.Th w={120}>{t("connections.actions")}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((pkg) => (
                      <Table.Tr key={pkg}>
                        <Table.Td>
                          <Text size="sm">{pkg}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <Tooltip label={t("apps.forceStop")}>
                              <ActionIcon
                                color="orange"
                                variant="subtle"
                                onClick={() => handleForceStop(pkg)}
                              >
                                <IconPlayerStop size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t("apps.clearData")}>
                              <ActionIcon
                                color="yellow"
                                variant="subtle"
                                onClick={() => handleClearData(pkg)}
                              >
                                <IconEraser size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t("apps.uninstall")}>
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => handleUninstall(pkg)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </>
        )}
      </Paper>
    </Stack>
  );
}
