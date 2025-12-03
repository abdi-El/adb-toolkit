// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  devices: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const stdout = execCommand(`nmap -p 5555 --open 192.168.1.0/24 -oG - | grep "/open/" | awk '{print $2}'`,);
    res.status(200).json({
      devices: stdout.split("\n").filter(line => line.trim() !== "")
    });
  } catch (error: any) {
    res.status(500).json({ devices: [] });
    console.error("Error:", error.message);
  }
}