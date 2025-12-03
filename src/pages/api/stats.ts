// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
import { Stats } from "@/types/adb";

import type { NextApiRequest, NextApiResponse } from "next";


type Data = {
    errors?: string[];
    result?: Stats;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    try {
        const ip = req.query.ip as string;
        if (!ip) {
            res.status(400).json({ errors: ["IP address is required"] });
            return;
        }
        const brand = execCommand(`adb -s ${ip}:5555 shell getprop ro.product.brand`);
        const model = execCommand(`adb -s ${ip}:5555 shell getprop ro.product.model`);
        const androidVersion = execCommand(`adb -s ${ip}:5555 shell getprop ro.build.version.release`);
        res.status(200).json({
            result: {
                brand: brand.trim(),
                model: model.trim(),
                androidVersion: androidVersion.trim(),
            }
        });
    } catch (error: any) {
        res.status(500).json({ errors: [error.message] });
        console.error("Error:", error.message);
    }
}