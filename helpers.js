import { notion, logger } from "./config.js";
import { newDatabase } from "./index.js";

/**
 * Inspiration https://stackoverflow.com/a/31729267
 *
 * @param {Object} dict
 * @param {String} key
 */
const removeKeyInDict = (dict, key) => {
  for (const prop in dict) {
    if (prop === key) {
      delete dict[prop];
    } else if (typeof dict[prop] === "object") {
      removeKeyInDict(dict[prop], key);
    }
  }
};

/**
 *
 * @param {*} dbTitle
 * @param {*} properties
 * @returns
 */
// export const createDb = async (dbTitle, properties) => {
//   try {
//     const { id } = await notion.databases.create({
//       parent: {
//         type: 'page_id',
//         page_id: "b8595b75-abd1-4cad-8dfe-f935a8ef57cb"
//       },
//       title: [
//         {
//           type: "text",
//           text: {
//             content: dbTitle,
//             link: null
//           }
//         }
//       ],
//       properties: properties,
//     });

//     return id;
//   } catch (error) {
//     logger.debug(error);
//     throw new Error(`Error retrieving database ${error.message}`);
//   }
// };

/**
 * 
 * @param {String} dbId 
 * @param {Object} properties 
 * @returns 
 */
export const updateDbProperties = async (id, properties) => {
  try {
    const response = await notion.databases.update({
      database_id: id,
      properties: properties,
    });

    return { ...response };
  } catch (error) {
    logger.debug(error);
    throw new Error(`Error updating database ${error.message}`);
  }
};

/**
 * 
 * @param {String} dbId 
 * @param {Object} properties 
 * @returns 
 */
export const createPage = async (dbId, page) => {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: dbId,
      },
      properties: page.properties,
      icon: page.icon,
      cover: page.cover,
      // children: page.children
    });

    return { ...response };
  } catch (error) {
    logger.debug(error);
    throw new Error(`Error creating page ${error.message}`);
  }
}

/**
 *
 * @param {String} id
 * @returns {Object}
 */
const getDatabaseById = async (id) => {
  try {
    const response = await notion.databases.retrieve({
      database_id: id,
    });

    return { ...response };
  } catch (error) {
    logger.debug(error);
    throw new Error(`Error retrieving database ${error.message}`);
  }
};

/**
 * Gets pages from the database.
 *
 * @returns {Promise<Array<{ source_db: string, cover: string, icon: string, properties: object}>>}
 */
export const getPagesFromDatabase = async (databaseId, databaseTitle) => {
  const pages = [];
  let cursor = undefined;

  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });

    pages.push(...results);

    if (!next_cursor) {
      break;
    }

    cursor = next_cursor;
  }

  logger.debug(
    "getPagesFromDatabase",
    `${pages.length} pages successfully fetched.`
  );

  return pages.map((page) => {
    logger.info("++++PAGE++++", page);
    for (const entry of Object.keys(page.properties)) {
      removeKeyInDict(page.properties[entry], "id");
    }

    const pageData = {
      // source_db: databaseTitle,
      children: page.children,
      cover: page.cover,
      icon: page.icon,
      properties: page.properties,
    };

    logger.info("++++RESULTS++++", pageData);

    newDatabase["pages"].push(pageData);

    return pageData;
  });
};

/**
 * 
 * @param {String} id 
 * @returns 
 */
export const extractDatabaseProperties = async (id) => {
  const { title, properties } = await getDatabaseById(id);
  logger.info("extractDatabaseProperties", properties);
  for (const entry of Object.keys(properties)) {
    removeKeyInDict(properties[entry], "id");

    logger.info(
      "extractDatabaseProperties - properties entry",
      properties[entry]
    );

    logger.info("extractDatabaseProperties - newDatabase before", newDatabase);

    // Object.assign(newDatabase.properties, {entry: properties[entry]});
    newDatabase["properties"][entry] = properties[entry];

    logger.info("extractDatabaseProperties - newDatabase after", newDatabase);
  }

  return title[0].plain_text;
};
