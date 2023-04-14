import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";

// NOTE - ES Modules no longer support __dirname, so we need to do this to get the path to the current file's directory
// NOTE - Moving this utils.js file to a different directly will break CLI functionality
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * NOTE - This function will break if you move the utils.js file to a different directory
 *
 * @returns {string} - the path to the docker-compose.yml file in `services`
 */
export function getDockerComposeFilePath() {
  return path.resolve(__dirname, "..", "service", "docker-compose.yml");
}

/**
 * @returns {string} - the path to where the autometrics.yaml file should be (in the current working directory)
 */
export function getAutometricsYmlPath() {
  return path.resolve(process.cwd(), "autometrics.yaml");
}

/**
 * @returns {boolean} - true if a .env file exists in the current directory
 */
export function getHasEnvFile() {
  const envFilePath = path.resolve(process.cwd(), ".env");
  return fs.existsSync(envFilePath);
}

/**
 * Returns the app_name from the autometrics.yaml file, if it exists
 */
export function getAppNameFromConfig() {
  const config = getAutometricsYmlPath();
  const configContents = fs.existsSync(config)
    ? fs.readFileSync(config, "utf8")
    : "";
  const re = /app_name: \"([^"]*)\"/;
  const match = configContents.match(re);
  return match ? match[1] : null;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
