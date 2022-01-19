import "dotenv/config";
import { Client } from "@notionhq/client";
import winston from "winston";
import minimist from "minimist";

const argvs = minimist(process.argv.slice(2));

/**
 * Advanced logging
 */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.prettyPrint({ colorize: true })
  ),
  transports: [new winston.transports.Console()],
});

/**
 * Source database or databases to process
 */
export const SOURCE_DATABASES = argvs.source || JSON.parse(process.env.SOURCE_DATABASES);

/**
 * Target database where to inster the records from SOURCE_DATABASES
 */
export const TARGET_DB = argvs.target || process.env.TARGET_DB;

/**
 * Initialise Notion SDK Client
 */
export const notion = new Client({ auth: process.env.NOTION_API_KEY });
