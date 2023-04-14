import { Command } from "commander";

import { create } from "./actions/create.js";
import { destroy } from "./actions/destroy.js";
import { status } from "./actions/status.js";

const program = new Command();

program
  .name("autometrics")
  .description("CLI to add metrics service to your app in one minute")
  .version("0.8.0");

program
  .command("create")
  .description("Create and configure a new autometrics gateway for your app")
  .argument("[name]", "name of project (defaults to name of current dir)")
  .action(create);

program
  .command("destroy")
  .description("Power down the prometheus instance for this app")
  .argument(
    "[name]",
    "name of project (defaults to app_name in autometrics.yaml)"
  )
  .action(destroy);

program
  .command("status")
  .description("Get status of prometheus instance for this app")
  .argument(
    "[name]",
    "name of project (defaults to app_name in autometrics.yaml)"
  )
  .action(status);

// NOTE - use `parseAsync` instead of `parse` since we are using async actions
program.parseAsync();
