import { execSync } from "node:child_process";

execSync("npm run knex migrate:rollback --all");
execSync("npm run knex migrate:latest");
