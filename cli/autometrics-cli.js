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
      // return;
    }
    // - Provision new prometheus instance
    // - Generate an auth token
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
        console.log(`\t* ✅ Appended ${METRICS_URL_NAME}=${url}`);
      }
      if (appendedToken) {
        console.log(`\t* ✅ Appended ${METRICS_TOKEN_NAME}=${token}`);
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

// TODO -
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
    console.log("✅ ...Success!\n");

    return Promise.resolve();
  });

program.parseAsync();

// Subtask helpers

function createAutometricsYaml({ name }) {
  const automericsFilePath = getAutometricsYmlPath();
  if (fs.existsSync(automericsFilePath)) {
    return false;
  }
  fs.writeFileSync(automericsFilePath, YAML_TEMPLATE.replace("<app>", name));
  return true;
}

async function getPrometheusStatus(name) {
  await delay(1500);

  const composeFile = getDockerComposeFilePath();

  // console.log("\t[debug] * Compose file:", composeFile);

  const composeProcess = spawnSync("docker-compose", ["-f", composeFile, "ps"]);

  // TODO - check output
  console.log("OUTPUT::::\n", composeProcess.output.toString());

  return;
}

async function provisionPrometheus(name) {
  await delay(1500);

  const composeFile = getDockerComposeFilePath();

  // console.log("\t[debug] * Compose file:", composeFile);

  // Spawn new Docker Compose subprocess
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

async function destroyPrometheus(name) {
  await delay(1500);

  const composeFile = getDockerComposeFilePath();
  console.log("\t[debug] * Compose file:", composeFile);

  // Spawn new Docker Compose subprocess
  const composeProcess = spawnSync("docker-compose", [
    "-f",
    composeFile,
    "down",
  ]);

  // TODO - check for errors

  return;
}

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

    if (!hasMetricsUrl) {
      fs.appendFileSync(envFilePath, `\n${METRICS_URL_NAME}=${url}\n`);
      appendedUrl = true;
    }

    if (!hasMetricsToken) {
      fs.appendFileSync(envFilePath, `\n${METRICS_TOKEN_NAME}=${token}\n`);
      appendedToken = true;
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
