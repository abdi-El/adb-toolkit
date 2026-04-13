import { useState, useMemo, useEffect } from "react";
import {
  AppShell,
  NavLink,
  Title,
  Group,
  MantineProvider,
  DirectionProvider,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import {
  IconPlug,
  IconApps,
  IconSettings,
  IconDeviceGamepad,
  IconInfoCircle,
  IconCamera,
  IconFolder,
  IconTerminal,
  IconFileText,
} from "@tabler/icons-react";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { AppsPage } from "./pages/AppsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { RemoteControlPage } from "./pages/RemoteControlPage";
import { DeviceInfoPage } from "./pages/DeviceInfoPage";
import { ScreenshotPage } from "./pages/ScreenshotPage";
import { FileManagerPage } from "./pages/FileManagerPage";
import { ShellPage } from "./pages/ShellPage";
import { LogcatPage } from "./pages/LogcatPage";
import { OnboardingModal } from "./components/OnboardingModal";
import { useSettings } from "./hooks/useSettings";
import { settingsStore, KEYS } from "./lib/store";

type Section =
  | "connections"
  | "remote"
  | "apps"
  | "files"
  | "screenshot"
  | "shell"
  | "logcat"
  | "deviceInfo"
  | "settings";

function App() {
  const { t } = useTranslation();
  const {
    language,
    colorScheme,
    accentColor,
    setLanguage,
    setColorScheme,
    setAccentColor,
  } = useSettings();
  const [active, setActive] = useState<Section>("connections");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingShowSetup, setOnboardingShowSetup] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seen = await settingsStore.get<boolean>(KEYS.onboardingSeen);
      if (!cancelled && !seen) {
        setOnboardingShowSetup(true);
        setOnboardingOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeOnboarding = () => {
    void settingsStore.set(KEYS.onboardingSeen, true);
    setOnboardingOpen(false);
  };

  const openOnboarding = () => {
    setOnboardingShowSetup(false);
    setOnboardingOpen(true);
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  const theme = useMemo(
    () =>
      createTheme({
        primaryColor: accentColor,
        defaultRadius: "md",
      }),
    [accentColor],
  );

  const sections: {
    key: Section;
    label: string;
    icon: typeof IconPlug;
  }[] = [
    { key: "connections", label: t("nav.connections"), icon: IconPlug },
    { key: "remote", label: t("nav.remote"), icon: IconDeviceGamepad },
    { key: "apps", label: t("nav.apps"), icon: IconApps },
    { key: "files", label: t("nav.files"), icon: IconFolder },
    { key: "screenshot", label: t("nav.screenshot"), icon: IconCamera },
    { key: "shell", label: t("nav.shell"), icon: IconTerminal },
    { key: "logcat", label: t("nav.logcat"), icon: IconFileText },
    { key: "deviceInfo", label: t("nav.deviceInfo"), icon: IconInfoCircle },
    { key: "settings", label: t("nav.settings"), icon: IconSettings },
  ];

  return (
    <DirectionProvider initialDirection={dir}>
      <MantineProvider
        theme={theme}
        defaultColorScheme={colorScheme}
        forceColorScheme={colorScheme === "dark" ? "dark" : "light"}
      >
        <ModalsProvider>
        <Notifications position="top-right" />
        <AppShell navbar={{ width: 220, breakpoint: 0 }} padding="md">
          <AppShell.Navbar p="xs">
            <AppShell.Section>
              <Group px="xs" py="md">
                <Title order={4}>ADB Toolkit</Title>
              </Group>
            </AppShell.Section>
            <AppShell.Section grow>
              {sections.map((section) => (
                <NavLink
                  key={section.key}
                  label={section.label}
                  leftSection={<section.icon size={18} />}
                  active={active === section.key}
                  onClick={() => setActive(section.key)}
                />
              ))}
            </AppShell.Section>
          </AppShell.Navbar>
          <AppShell.Main>
            {active === "connections" && <ConnectionsPage />}
            {active === "remote" && <RemoteControlPage />}
            {active === "apps" && <AppsPage />}
            {active === "files" && <FileManagerPage />}
            {active === "screenshot" && <ScreenshotPage />}
            {active === "shell" && <ShellPage />}
            {active === "logcat" && <LogcatPage />}
            {active === "deviceInfo" && <DeviceInfoPage />}
            {active === "settings" && (
              <SettingsPage
                language={language}
                colorScheme={colorScheme}
                accentColor={accentColor}
                onLanguageChange={setLanguage}
                onColorSchemeChange={setColorScheme}
                onAccentColorChange={setAccentColor}
                onShowTutorial={openOnboarding}
              />
            )}
          </AppShell.Main>
        </AppShell>
        <OnboardingModal
          opened={onboardingOpen}
          onClose={closeOnboarding}
          showSetup={onboardingShowSetup}
          language={language}
          colorScheme={colorScheme}
          accentColor={accentColor}
          onLanguageChange={setLanguage}
          onColorSchemeChange={setColorScheme}
          onAccentColorChange={setAccentColor}
        />
        </ModalsProvider>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default App;
