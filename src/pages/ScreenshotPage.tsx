import { useState } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  Image,
  Text,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { IconCamera, IconDownload } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { DeviceSelector } from "../components/DeviceSelector";


export function ScreenshotPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const base64 = await invoke<string>("adb_screenshot", { address: device });
      setScreenshot(`data:image/png;base64,${base64}`);
    } catch (err) {
      notifications.show({
        title: t("screenshot.captureFailed"),
        message: String(err),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveScreenshot = async () => {
    if (!screenshot) return;
    const path = await save({
      title: t("screenshot.save"),
      filters: [{ name: "PNG", extensions: ["png"] }],
      defaultPath: `screenshot-${Date.now()}.png`,
    });
    if (!path) return;

    try {
      const base64Data = screenshot.split(",")[1];
      await invoke("adb_screenshot_save", {
        screenshotBase64: base64Data,
        savePath: path,
      });
      notifications.show({
        title: t("screenshot.saved"),
        message: path,
        color: "teal",
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: String(err),
        color: "red",
      });
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>{t("screenshot.title")}</Title>
          <Group>
            {screenshot && (
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={saveScreenshot}
              >
                {t("screenshot.save")}
              </Button>
            )}
            <Button
              leftSection={<IconCamera size={16} />}
              onClick={capture}
              loading={loading}
              disabled={!device}
            >
              {t("screenshot.capture")}
            </Button>
          </Group>
        </Group>

        <DeviceSelector value={device} onChange={setDevice} />

        {loading && (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">{t("screenshot.capturing")}</Text>
          </Group>
        )}

        {screenshot && !loading && (
          <Image
            src={screenshot}
            fit="contain"
            mah={500}
            radius="md"
          />
        )}
      </Paper>
    </Stack>
  );
}
