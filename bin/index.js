#!/usr/bin/env node

const path = require("path");
const fse = require("fs-extra");

const {
  program
} = require('commander');

program
  .version('0.1.0')
  .usage('<command> [options]')
  
  program
  .command('create')
  .option('-host, --host <host>',' swagger文件服务器地址')
  .option('-a, --apiPath <apiPath>', 'api生成路径')
  .option('-s, --sPath <swaggerPath>', 'swagger.json生成路径')
  .option('-t, --tPath <typesPath>', 'ts 接口生成路径')
  .action(function () {
    require("../lib/build")()
  })

  program
  .command('init')
  .description('run setup commands for all envs')
  .action(function(){
    require("../lib/init")()
  });

program.parse(process.argv);