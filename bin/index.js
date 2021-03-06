#!/usr/bin/env node

const {
  program
} = require('commander');
const version = require("../package.json").version;
program
  .version(version)
  .usage('<command> [options]')
  .option('-host, --host <host>', ' swagger文件服务器地址')
  .option('-ap, --api-path <apiPath>', 'api生成路径')
  .option('-sp, --s-path <swaggerPath>', 'swagger.json保存路径')
  .option('-tp, --t-path <typesPath>', 'ts 接口生成路径')
  .action(function ({
    host,
    apiPath,
    sPath,
    tPath
  }) {
    let args = {
      host,
      apiPath,
      sPath,
      tPath
    };
    require("../lib/build")(args)
  })

program
  .command('init')
  .description('run setup commands for all envs')
  .action(function () {
    require("../lib/init")()
  });

program.parse(process.argv);