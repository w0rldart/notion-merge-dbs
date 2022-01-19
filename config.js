import "dotenv/config";
import { Client } from "@notionhq/client";
import winston from "winston";

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
export const SOURCE_DATABASES = JSON.parse(process.env.SOURCE_DATABASES);

/**
 * Target database where to inster the records from SOURCE_DATABASES
 */
export const TARGET_DB = process.env.TARGET_DB;

/**
 * Initialise Notion SDK Client
 */
export const notion = new Client({ auth: process.env.NOTION_API_KEY });
