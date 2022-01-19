import Bottleneck from "bottleneck";

import { notion, logger, SOURCE_DATABASES, TARGET_DB } from "./config.js";
import {
  getPagesFromDatabase,
  extractDatabaseProperties,
  updateDbProperties,
  createPage,
} from "./helpers.js";

const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000, // milliseconds to wait before launching a new job
});

/**
 * 
 */
export let newDatabase = {
  properties: {},
  pages: [],
};

/**
 *
 */
async function main() {
  const search_result = await notion.search({
    filter: {
      value: "database",
      property: "object",
    },
  });

  logger.debug("search_result", search_result);

  if (search_result.results.length === 0) {
    throw new Error("This bot doesn't have access to any databases!");
  }

  for (const SOURCE_DATABASE of SOURCE_DATABASES) {
    let dbTitle = await extractDatabaseProperties(SOURCE_DATABASE)
    let dbPages = await getPagesFromDatabase(SOURCE_DATABASE, dbTitle)
  }

  logger.debug("newDatabase", newDatabase);

  const response = await updateDbProperties(TARGET_DB, newDatabase.properties);

  limiter.schedule(() => {
    const totalPages = newDatabase.pages.length
    const pages = newDatabase.pages.map((page, index) => {
      let realIndex = index + 1;
      logger.info(`Creating page ${realIndex} out of ${totalPages}`)
      createPage(TARGET_DB, page)
    });

    return Promise.all(pages);
  });
}

main();
