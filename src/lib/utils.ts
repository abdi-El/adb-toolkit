import { execSync } from "child_process";

export function execCommand(command: string) {
    return execSync(
        command,
        { encoding: "utf-8" }
    );
}