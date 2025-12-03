// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execSync } from "child_process";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    errors: string[];
    result?: string;
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
        const stdout = execSync(
            `adb connect ${ip}:5555`,
            { encoding: "utf-8" }
        );

        if (stdout.includes("failed")) {
            res.status(500).json({ errors: [stdout] });
            return;
        }
        res.status(200).json({ errors: [], result: stdout });
    } catch (error: any) {
        res.status(500).json({ errors: [error.message] });
        console.error("Error:", error.message);
    }
}