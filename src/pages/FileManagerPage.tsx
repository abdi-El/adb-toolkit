import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  Table,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import {
  IconFolder,
  IconFile,
  IconUpload,
  IconDownload,
  IconRefresh,
  IconArrowUp,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { DeviceSelector } from "../components/DeviceSelector";

interface FileEntry {
  name: string;
  is_dir: boolean;
  size: string;
  permissions: string;
  modified: string;
}

export function FileManagerPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [path, setPath] = useState("/sdcard");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!device) return;
    setLoading(true);
    try {
      const result = await invoke<FileEntry[]>("adb_ls", { address: device, path });
      setFiles(result);
    } catch (err) {
      notifications.show({ title: "Error", message: String(err), color: "red" });
    } finally {
      setLoading(false);
    }
  }, [device, path]);

  useEffect(() => {
    if (device) loadFiles();
  }, [device, path, loadFiles]);

  const navigate = (name: string) => {
    setPath((prev) => `${prev}/${name}`.replace("//", "/"));
  };

  const goUp = () => {
    setPath((prev) => {
      const parts = prev.split("/").filter(Boolean);
      parts.pop();
      return "/" + parts.join("/");
    });
  };

  const navigateTo = (index: number) => {
    const parts = path.split("/").filter(Boolean);
    setPath("/" + parts.slice(0, index + 1).join("/"));
  };

  const handlePush = async () => {
    if (!device) return;
    const file = await open({ title: t("files.selectFile"), multiple: false });
    if (!file) return;
    try {
      const remotePath = `${path}/${String(file).split("/").pop()}`;
      await invoke<string>("adb_push", {
        address: device,
        localPath: file,
        remotePath,
      });
      notifications.show({ title: t("files.uploaded"), message: remotePath, color: "teal" });
      loadFiles();
    } catch (err) {
      notifications.show({ title: t("files.uploadFailed"), message: String(err), color: "red" });
    }
  };

  const handlePull = async (name: string) => {
    if (!device) return;
    const localPath = await save({
      title: t("files.saveAs"),
      defaultPath: name,
    });
    if (!localPath) return;
    try {
      await invoke<string>("adb_pull", {
        address: device,
        remotePath: `${path}/${name}`,
        localPath,
      });
      notifications.show({ title: t("files.downloaded"), message: localPath, color: "teal" });
    } catch (err) {
      notifications.show({ title: t("files.downloadFailed"), message: String(err), color: "red" });
    }
  };

  const pathParts = path.split("/").filter(Boolean);

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>{t("files.title")}</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconUpload size={16} />}
              onClick={handlePush}
              disabled={!device}
            >
              {t("files.upload")}
            </Button>
            <Tooltip label={t("connections.refresh")}>
              <ActionIcon variant="subtle" onClick={loadFiles} loading={loading}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <DeviceSelector value={device} onChange={setDevice} />

        {device && (
          <>
            <Group mb="sm" gap="xs">
              <ActionIcon variant="subtle" onClick={goUp} disabled={path === "/"}>
                <IconArrowUp size={16} />
              </ActionIcon>
              <Breadcrumbs>
                <Anchor size="sm" onClick={() => setPath("/")}>
                  /
                </Anchor>
                {pathParts.map((part, i) => (
                  <Anchor key={i} size="sm" onClick={() => navigateTo(i)}>
                    {part}
                  </Anchor>
                ))}
              </Breadcrumbs>
            </Group>

            {loading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
              </Group>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("files.name")}</Table.Th>
                    <Table.Th>{t("files.size")}</Table.Th>
                    <Table.Th>{t("files.modified")}</Table.Th>
                    <Table.Th w={100}>{t("connections.actions")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {files.map((file) => (
                    <Table.Tr key={file.name}>
                      <Table.Td>
                        <Group gap="xs">
                          {file.is_dir ? (
                            <IconFolder size={16} color="var(--mantine-color-yellow-6)" />
                          ) : (
                            <IconFile size={16} />
                          )}
                          {file.is_dir ? (
                            <Anchor size="sm" onClick={() => navigate(file.name)}>
                              {file.name}
                            </Anchor>
                          ) : (
                            <Text size="sm">{file.name}</Text>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">{file.size}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">{file.modified}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          {!file.is_dir && (
                            <Tooltip label={t("files.download")}>
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => handlePull(file.name)}
                              >
                                <IconDownload size={14} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </>
        )}
      </Paper>
    </Stack>
  );
}
