// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    errors?: string[];
    result: string[];
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    try {
        const stdout = execCommand("adb devices");
        const connectedDevices = stdout.split("List of devices attached")[1]
        if (!connectedDevices) {
            res.status(200).json({ result: [] });
            return;
        }
        const deviceIps = connectedDevices.split("\n")
        res.status(200).json({ result: deviceIps.map(line => line.trim().split("\t")[0]); });
    } catch (error: any) {
        res.status(500).json({ result: [], errors: [error.message] });
        console.error("Error:", error.message);
    }
}