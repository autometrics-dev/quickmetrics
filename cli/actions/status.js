import { spawnSync } from "child_process";

import { getDockerComposeFilePath, getAppNameFromConfig } from "../utils.js";

export const status = async (name, options) => {
  const appName = name ?? getAppNameFromConfig();

  console.log(
    "\n📚 Reading autometrics.yaml from the current directory for app:",
    appName,
    "...\n"
  );

  console.log("🪄 Checking metrics instance output...");
  const output = await getPrometheusStatus(appName);
  console.log("\n", trimCommas(output));

  return output;
};

/**
 * Executes `docker-compose ps` for the service folder
 *
 * Returns the output of the docker compose command
 */
async function getPrometheusStatus(name) {
  const composeFile = getDockerComposeFilePath();
  const composeProcess = spawnSync("docker-compose", ["-f", composeFile, "ps"]);

  return composeProcess.output.toString();
}

function trimCommas(str) {
  return str.replace(/^\s*,/g, "").replace(/\s*,\s*$/g, "");
}
