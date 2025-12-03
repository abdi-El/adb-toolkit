// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
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
        const stdout = execCommand(`adb diconnect ${ip}`,);
        res.status(200).json({ errors: [], result: stdout });
    } catch (error: any) {
        res.status(500).json({ errors: [error.message] });
        console.error("Error:", error.message);
    }
}