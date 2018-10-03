const _ = require('lodash');
const fs = require('fs-extra');
const { getLogger } = require('../utils/logger');

async function addLanguageField(source) {
  if (fs.existsSync(source)) {
    getLogger().info(`To add language field to ${source}`);
    try {
      const fileContent = await fs.readFileSync(source).toString().trim().split('\n');
      const acc = [];
      for (let i = 0; i < fileContent.length; i++) {
        const cur = JSON.parse(fileContent[i]);
        if (!cur.hasOwnProperty('language') && !cur.hasOwnProperty('$$indexCreated')) {
          cur.language = 'en-US';
        }
        acc.push(JSON.stringify(cur));
      }
      await fs.outputFileSync(`${source}`, acc.join('\n'));
      getLogger().info(`Successful add language field to ${source}`);
    } catch (err) {
      getLogger().error(`DB migration error: ${err.msg}`);
      throw err;
    }
  }
}

module.exports = addLanguageField;
