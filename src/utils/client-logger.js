require('winston-daily-rotate-file');
const moment = require('moment');
const winston = require('winston');
const { getLogsDir } = require('../config');

const logsDir = `${getLogsDir()}/client`;
const winstonCfg = winston.config;
const transports = [
  new (winston.transports.DailyRotateFile)({
    filename: `${logsDir}/client_${moment().format('YYYYMMDD_HHmmss')}.log`,
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
logger.level = 'error';

// Log env and paths
logger.info(`Client logs dir: ${logsDir}`);

module.exports = logger;
