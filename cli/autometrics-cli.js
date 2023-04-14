import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, spawnSync } from "child_process";
import { Command } from "commander";

// NOTE - ES Modules no longer support __dirname, so we need to do this to get the path to the current file's directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name("autometrics")
  .description("CLI to add metrics service to your app in one minute")
  .version("0.8.0");

const METRICS_URL_NAME = "FP_METRICS_URL";
const METRICS_TOKEN_NAME = "FP_METRICS_TOKEN";
const METRICS_URL = "http://localhost:8063";
const METRICS_TOKEN = "fp-Ooyoo-mei6a-egh4u-xooke";

const YAML_TEMPLATE = `app_name: "<app>" # Becomes the job name when pushing to aggregation gateway
publish_method: "push"
scrape_config:
  scrape_interval: 500ms
  static_configs: # ignored when "publish_method" is "push" 
    - targets: ["localhost:8080"] # or wherever your app runs
`;

program
  .command("create")
  .description("Create new autometrics engine (?)")
  .argument("<name>", "name of project")
  .action(async (name, options) => {
    await delay(1000);

    // - Create `autometrics.yaml` if it does not exist
    console.log(
      "\n🧑‍🎨 Creating autometrics.yaml in current directory for app:",
      name,
      "...\n"
    );
    const wasCreated = createAutometricsYaml({ name });
    if (wasCreated) {
      console.log("\t* autometrics.yaml created for app:", name);
    } else {
      console.log("\t* autometrics.yaml already exists");
    }

    // - Provision new prometheus instance
    // - Generate an auth token
    await delay(2500);
    console.log("\n💾 Provisioning metrics instance...");
    const { token, url, composeProcess } = await provisionPrometheus(name);
    console.log("✅ ...Success!\n");
    console.log("\t* Endpoint:", url);
    console.log("\t* Token:", token);

    // - Add url and token to app environment
    if (getHasEnvFile()) {
      console.log(
        "\n📝 Adding the following environment variables to .env file (if it exists):\n"
      );
      console.log(`\t* ${METRICS_URL_NAME}=${url}`);
      console.log(`\t* ${METRICS_TOKEN_NAME}=${token}`);

      const { hasEnvFile, appendedUrl, appendedToken } = appendToEnvFile({
        token,
        url,
      });

      if (appendedUrl) {
        await delay(1500);
        console.log(`✅ Appended ${METRICS_URL_NAME}=${url} to .env file`);
      }
      if (appendedToken) {
        await delay(1500);
        console.log(`✅ Appended ${METRICS_TOKEN_NAME}=${token} to .env file`);
      }
    } else {
      console.log("\n🚨 .env file does not exist\n");
      console.log(
        "\n👉 You need to add the following environment variables to your project:\n"
      );
      console.log(`\t* ${METRICS_URL_NAME}=${url}`);
      console.log(`\t* ${METRICS_TOKEN_NAME}=${token}`);
    }

    // HACK - allows process to terminate (but not working rn...)
    composeProcess.unref();

    return Promise.resolve();
  });

program
  .command("destroy")
  .description("Create new autometrics engine (?)")
  .argument("<name>", "name of project")
  .action(async (name, options) => {
    console.log(
      "\n📚 Reading autometrics.yaml from the current directory for app:",
      name,
      "...\n"
    );

    // - Destroy prometheus instance
    console.log("\n🦖 Destroying metrics instance...");
    const output = await destroyPrometheus(name);
    console.log("✅ ...Success! It is gone\n");

    return Promise.resolve();
  });

program
  .command("status")
  .description("Create new autometrics engine (?)")
  .argument("<name>", "name of project")
  .action(async (name, options) => {
    console.log(
      "\n📚 Reading autometrics.yaml from the current directory for app:",
      name,
      "...\n"
    );

    // - Destroy prometheus instance
    console.log("\n🪄 Checking metrics instance output...");
    const output = await getPrometheusStatus(name);

    return Promise.resolve();
  });

program.parseAsync();

// Subtask helpers

/**
 * Creates an `autometrics.yml` file in the current directory, if it doesn't already exist
 */
function createAutometricsYaml({ name }) {
  const automericsFilePath = getAutometricsYmlPath();
  if (fs.existsSync(automericsFilePath)) {
    return false;
  }
  fs.writeFileSync(automericsFilePath, YAML_TEMPLATE.replace("<app>", name));
  return true;
}

/**
 * Executes `docker-compose ps` for the service folder
 */
async function getPrometheusStatus(name) {
  const composeFile = getDockerComposeFilePath();
  const composeProcess = spawnSync("docker-compose", ["-f", composeFile, "ps"]);

  // NOTE - Just prints the output of Docker compose command
  console.log("\n", composeProcess.output.toString());

  return;
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
 * Executes `docker-compose down` for the service folder
 */
async function destroyPrometheus(name) {
  const composeFile = getDockerComposeFilePath();

  const composeProcess = spawnSync("docker-compose", [
    "-f",
    composeFile,
    "down",
  ]);

  // Uncomment to print the output of Docker compose command... but it could be super long
  // console.log("\n", composeProcess.output.toString());

  return;
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
      toAppend.push(`\n${METRICS_URL_NAME}=${url}\n`);
      appendedUrl = true;
    }

    if (!hasMetricsToken) {
      toAppend.push(`\n${METRICS_TOKEN_NAME}=${token}\n`);
      appendedToken = true;
    }

    if (toAppend.length > 0) {
      fs.appendFileSync(envFilePath, `\n${toAppend.join("\n")}\n`);
    }
  }

  return { hasEnvFile, appendedUrl, appendedToken };
}

// Generic Utils

function getDockerComposeFilePath() {
  return path.resolve(__dirname, "..", "service", "docker-compose.yml");
}

function getAutometricsYmlPath() {
  return path.resolve(process.cwd(), "autometrics.yaml");
}

function getHasEnvFile() {
  const envFilePath = path.resolve(process.cwd(), ".env");
  return fs.existsSync(envFilePath);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
