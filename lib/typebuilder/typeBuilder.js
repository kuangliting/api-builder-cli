const fse = require("fs-extra");
const Path = require("path");
const getTypeContent = require("../template").getTypeContent;

async function builder(config, swgPath) {
    let definitions = require(swgPath).definitions;
    let allTypes = Object.keys(definitions);
    let typeCnt = `declare namespace API_TYPES {`;
    allTypes.forEach(type => {
        if(definitions[type]){
            //console.log('hhshsh');
            typeCnt = typeCnt + getTypeContent(type,definitions[type])
        }else{
            console.log(definitions[type])
        }
        //console.log()   
    })
    typeCnt = typeCnt+"}"
    let outPath = config.typePath || Path.resolve(process.cwd(),"src/typings/apiTypes.ts");
    fse.outputFileSync(outPath,typeCnt);
    return {outPath:"src/typings/apiTypes.ts"}
}

module.exports = builder;