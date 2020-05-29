const inquirer = require("inquirer");
const chalk = require("chalk");
const fse = require("fs-extra");
const path = require("path");
const apiBuilder = require("./apiBuilder");
let fetch = require("node-fetch");
let http = require("http");
let {
    changeOperId
} = require("./utils/formatSwagger");

async function build(args) {
    try {
        let cwd = process.cwd();
        let confPath = path.resolve(cwd, 'api.config.js');
        let config;

        if (fse.pathExistsSync(confPath)) {
            config = require(confPath);
        } else {
            await fse.copy(path.resolve(__dirname, './api.config.js'), confPath);
            console.log(chalk.green('√ 创建配置文件'), chalk.inverse(" api.config.js "), chalk.green('成功'));
            config = require(confPath);
        }
        
        let hostPath = args.host && args.host.trim() || config.apiHost && config.apiHost.trim();
        let swgPath = config.swaggerPath || path.resolve(process.cwd(), ".swagger/swagger.json");
        let hasSwg = fse.pathExistsSync(swgPath);
        if (!hostPath&&!hasSwg) {
            console.log(chalk.yellow('× 未提供生成swagger.json的服务器地址'));
            process.exit(1);
        }
        let res
        try {
            res = await fetch(hostPath);
            if (res.ok) {
                let body = await res.text();
                await fse.outputFile(swgPath, body);
                console.log(chalk.green('√ 获取最新的swagger.json'))
            }
        } catch (err) {
            if (hasSwg) {
                console.log(chalk.yellow('服务器地址无效，无法获取最新swagger.json，将使用旧的swagger.json'));
            } else {
                console.log(chalk.red('请配置有效的swagger.json服务器地址'));
                process.exit(1);
            }
        }
        //await changeOperId(swgPath);
        await apiBuilder(config, swgPath);
        console.log(chalk.green('√ 生成api模块成功'))
        
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = (args) => {
    return build(args).catch(err => {
        process.exit(1);
    })
}