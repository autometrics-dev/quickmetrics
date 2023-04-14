import { spawnSync } from "child_process";

import { getDockerComposeFilePath, getAppNameFromConfig } from "../utils.js";

export const destroy = async (name, options) => {
  const appName = name ?? getAppNameFromConfig();

  console.log(
    "\n📚 Reading autometrics.yaml from the current directory for app:",
    appName,
    "...\n"
  );

  console.log("🦖 Destroying metrics instance...");
  const output = await destroyPrometheus(appName);
  console.log("✅ ...Success! It is gone\n");
  // Uncomment to print the output of Docker compose command... but it could be super long
  // console.log("\n", output.toString());

  return output;
};

/**
 * Executes `docker-compose down` for the service folder
 *
 * Returns the output of the docker compose command
 */
async function destroyPrometheus(name) {
  const composeFile = getDockerComposeFilePath();

  const composeProcess = spawnSync("docker-compose", [
    "-f",
    composeFile,
    "down",
  ]);

  return composeProcess.output.toString();
}
