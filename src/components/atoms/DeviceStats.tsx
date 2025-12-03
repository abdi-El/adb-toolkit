import { useDevicesStore } from '@/state/devices';
import { Stats } from '@/types/adb';
import type { DescriptionsProps } from 'antd';
import { Descriptions, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';


export default function DeviceStats() {
    const { connectedDevices } = useDevicesStore()
    const [stats, setStats] = useState<Stats>()
    const fetchDeviceStats = () => {
        axios.get(`/api/stats?ip=${connectedDevices?.[0]}`).then(res => {
            setStats(res.data.result)
        }).catch(err => {
            message.error("Failed to fetch device stats:", err);
        });
    };
    useEffect(fetchDeviceStats, [connectedDevices?.[0]]);
    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Brand',
            children: stats?.brand || 'N/A',
        },
        {
            key: '2',
            label: 'Model',
            children: stats?.model || 'N/A',
        },
        {
            key: '3',
            label: 'Android Version',
            children: stats?.androidVersion || 'N/A',
        },
    ];
    return <Descriptions title="Device Info" bordered items={items} />;
}
