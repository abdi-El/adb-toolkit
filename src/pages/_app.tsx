import ConnectionManager from "@/components/organisms/ConnectionManager";
import "@/styles/globals.css";
import {
  AndroidOutlined,
  MenuOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, MenuProps, theme, Typography } from "antd";
import type { AppProps } from "next/app";
import { useState } from "react";
const { Header, Content, Footer, Sider } = Layout;


const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}
const items: MenuItem[] = [
  getItem('Dashboard', '1', <PieChartOutlined />),
  // getItem('User', 'sub1', <UserOutlined />, [
  //   getItem('Tom', '3'),
  //   getItem('Bill', '4'),
  //   getItem('Alex', '5'),
  // ]),
];


export default function App({ Component, pageProps }: AppProps) {
  const [collapsed, setCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return <Layout style={{ minHeight: '100vh' }}>
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      onCollapse={setCollapsed}
      collapsedWidth={0}
      width={200}
      style={{
        position: 'fixed',
        zIndex: 10000,
        height: '100vh',
      }}>
      <div className="demo-logo-vertical" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={() => {
      }} />
    </Sider>
    <Layout onClick={() => {
      setCollapsed(true)
    }}
      style={
        {
          display: 'flex',
          flexDirection: 'column',
        }
      }
    >
      <Header style={{ padding: 0, background: colorBgContainer, position: "fixed", width: "100%", height: 60, zIndex: 99, display: "flex", alignItems: "center", justifyContent: "space-between" }} >
        <div>

          <Button onClick={(e) => {
            e.stopPropagation()
            setCollapsed(false)
          }
          }
            style={{
              marginLeft: 10
            }} icon={<MenuOutlined />} />
          <Title level={3} style={{ display: "inline-block", margin: "0 0 0 10px" }}>Adb Toolkit <AndroidOutlined /> </Title>
        </div>
        <ConnectionManager style={{
          marginRight: 10
        }} />

      </Header>
      <Content style={{ margin: '60px 10px', flexGrow: 1, }}>
        <div
          style={{
            marginTop: 10,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            height: '100%',
          }}
        >
          <Component {...pageProps} />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Made with love by AB {new Date().getFullYear()}
      </Footer>
    </Layout>
  </Layout >
}
