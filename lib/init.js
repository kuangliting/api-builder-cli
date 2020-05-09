const fse = require("fs-extra");
const Path = require("path");
const template = require("./template/configTmp.js");

module.exports = function () {

   fse.outputFile(Path.resolve(process.cwd(),"./api.config.js"),template.getConfigContent())
}