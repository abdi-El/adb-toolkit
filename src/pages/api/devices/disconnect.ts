// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    errors?: string[];
    result: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const ip = req.query.ip as string;
    try {
        const stdout = execCommand("adb disconnect " + ip);
        stdout.split("List of devices attached")[1]
        res.status(200).json({ result: "disconnected correctly" });
    } catch (error: any) {
        res.status(500).json({ result: "", errors: [error.message] });
        console.error("Error:", error.message);
    }
}