require('winston-daily-rotate-file');
const moment = require('moment');
const winston = require('winston');
const { CONFIG, getLogsDir } = require('../config');

const logsDir = getLogsDir();
const winstonCfg = winston.config;
const transports = [
  new (winston.transports.Console)({
    timestamp() {
      return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    formatter(options) {
      return `${options.timestamp()} `
        + `${winstonCfg.colorize(options.level, options.level.toUpperCase())} `
        + `${(options.message ? options.message : '')} `
        + `${(options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '')}`;
    },
  }),
  new (winston.transports.DailyRotateFile)({
    filename: `${logsDir}/server.log`,
    timestamp() {
      return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    formatter(options) {
      return `${options.timestamp()} `
        + `${winstonCfg.colorize(options.level, options.level.toUpperCase())} `
        + `${(options.message ? options.message : '')} `
        + `${(options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '')}`;
    },
    json: false,
    maxFiles: '14d',
  }),
];

const logger = new (winston.Logger)({ transports, exitOnError: false });
logger.level = process.env.LOG_LEVEL || CONFIG.DEFAULT_LOG_LEVEL;

// Log env and paths
logger.info(`Logs dir: ${logsDir}`);

module.exports = logger;
