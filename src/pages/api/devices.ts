// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { execCommand } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  devices?: string[];
  connecredDevices?: string[];
  errors?: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const stdout = execCommand(`nmap -p 5555 --open 192.168.1.0/24 -oG - | grep "/open/" | awk '{print $2}'`,);
    const connctedStdout = execCommand("adb devices");
    const connectedDevices = connctedStdout.split("List of devices attached")[1]

    res.status(200).json({
      devices: stdout.split("\n").filter(line => line.trim() !== ""),
      connecredDevices: connectedDevices.split("\n").map(line => line.trim().split(":")[0]).filter(ip => ip)
    });

  } catch (error: any) {
    res.status(500).json({ errors: [error.message] });
    console.error("Error:", error.message);
  }
}