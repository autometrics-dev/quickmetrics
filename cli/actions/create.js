import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import {
  delay,
  getAutometricsYmlPath,
  getDockerComposeFilePath,
  getHasEnvFile,
} from "../utils.js";
import {
  YAML_TEMPLATE,
  METRICS_TOKEN,
  METRICS_TOKEN_NAME,
  METRICS_URL,
  METRICS_URL_NAME,
} from "../constants.js";

export const create = async (name, options) => {
  await delay(1000);

  // - Get name of project
  const appName = name ?? path.basename(process.cwd());

  // - Create `autometrics.yaml` if it does not exist
  console.log(
    "\n🧑‍🎨 Creating autometrics.yaml in current directory for app:",
    appName,
    "...\n"
  );
  const wasCreated = createAutometricsYaml({ appName });
  if (wasCreated) {
    console.log("\t* autometrics.yaml created for app:", appName);
  } else {
    console.log("\t* autometrics.yaml already exists");
  }

  // - Provision new prometheus instance
  // - Generate an auth token
  await delay(2500);
  console.log("\n💾 Provisioning metrics instance...");
  const { token, url, composeProcess } = await provisionPrometheus(appName);
  console.log("✅ ...Success!\n");
  console.log("\t* Endpoint:", url);
  console.log("\t* Token:", token);

  // - Add url and token to app environment
  if (getHasEnvFile()) {
    console.log(
      "\n📝 Adding the following environment variables to .env file (if it exists):\n"
    );
    console.log(`\t* ${METRICS_URL_NAME}=${url}`);
    console.log(`\t* ${METRICS_TOKEN_NAME}=${token}\n`);

    const { appendedUrl, appendedToken } = appendToEnvFile({
      token,
      url,
    });

    if (appendedUrl) {
      await delay(1500);
      console.log(`🪄 Appended ${METRICS_URL_NAME}=${url} to .env file`);
    }
    if (appendedToken) {
      await delay(1500);
      console.log(`🪄 Appended ${METRICS_TOKEN_NAME}=${token} to .env file`);
    }
  } else {
    console.log("\n🚨 .env file does not exist\n");
    console.log(
      "\n👉 You need to add the following environment variables to your project:\n"
    );
    console.log(`\t* ${METRICS_URL_NAME}=${url}`);
    console.log(`\t* ${METRICS_TOKEN_NAME}=${token}`);
  }

  // HACK - Should allow the process to terminate (but not working right now...)
  composeProcess.unref();

  return;
};

/**
 * Creates an `autometrics.yml` file in the current directory, if it doesn't already exist
 */
function createAutometricsYaml({ appName }) {
  const automericsFilePath = getAutometricsYmlPath();
  if (fs.existsSync(automericsFilePath)) {
    return false;
  }
  fs.writeFileSync(automericsFilePath, YAML_TEMPLATE.replace("<app>", appName));
  return true;
}

/**
 * Executes `docker-compose up --build` for the service folder.
 * Returns the hardcoded URL used by the service, as well as a "token",
 * which isn't actually used for anything at the moment.
 */
async function provisionPrometheus(name) {
  await delay(1500);

  const composeFile = getDockerComposeFilePath();

  // Spawn new Docker Compose subprocess
  // NOTE - Could put this in the background, then pull status with `ps`
  const composeProcess = spawn(
    "docker-compose",
    ["-f", composeFile, "up", "--build"],
    {
      detached: true, // detach subprocess from parent process
    }
  );

  // Log output from subprocess to console
  // composeProcess.stdout.on("data", (data) => {
  //   // console.log(`[docker-compose] stdout: ${data}`);
  // });

  // composeProcess.stderr.on("data", (data) => {
  //   // console.error(`[docker-compose] stderr: ${data}`);
  // });

  return { token: METRICS_TOKEN, url: METRICS_URL, composeProcess };
}

/**
 * If a dotenv file exists in the current directory, appends the url and token to it.
 * If the file already contains the url or token, does NOT overwrite the values
 */
function appendToEnvFile({ token, url }) {
  const envFilePath = path.resolve(process.cwd(), ".env");

  let appendedUrl = false;
  let appendedToken = false;
  const hasEnvFile = getHasEnvFile();

  if (hasEnvFile) {
    const envConfig = fs.readFileSync(envFilePath, "utf8");
    const envVars = envConfig
      .split("\n")
      .map((line) => line.split("=").slice(0, 2));
    const hasMetricsUrl = envVars.some(([key]) => key === METRICS_URL_NAME);
    const hasMetricsToken = envVars.some(([key]) => key === METRICS_TOKEN_NAME);

    const toAppend = [];

    if (!hasMetricsUrl) {
      toAppend.push(`${METRICS_URL_NAME}=${url}`);
      appendedUrl = true;
    }

    if (!hasMetricsToken) {
      toAppend.push(`${METRICS_TOKEN_NAME}=${token}`);
      appendedToken = true;
    }

    if (toAppend.length > 0) {
      fs.appendFileSync(envFilePath, `\n${toAppend.join("\n")}\n`);
    }
  }

  return { hasEnvFile, appendedUrl, appendedToken };
}
