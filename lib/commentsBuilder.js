const getCommentType = require("./template").getCommentType;
const getPropType = require("./template").getPropType;
function getResponse(apiObj){
    let schema = apiObj.responses && apiObj.responses['200'] && apiObj.responses['200']['schema'];
    if(schema){
        return ` *  @return {API_TYPES.${getPropType(schema)}}
`
        //return getCommentType(schema)
        //console.log("no response schema");
    }
    return '';
}
function getCommentContent(apiObj, config,definitions) {
    let parameters = apiObj.parameters;
    if (!parameters) {
        return '';
    }
    let comStr = '';
    parameters.forEach(p => {
        comStr = comStr +
            ` *  @param {${getCommentType(p)}} ${p.name}${!p.required&&'?'||''} -[${p.in}]    ${p.description}
`
    })
    comStr = comStr + getResponse(apiObj);
    if(apiObj.summary||apiObj.description){
        comStr = comStr +
        ` *  ${apiObj.summary||apiObj.description} 
` 
    }
    return `
/**
${comStr}**/`;

}

module.exports.getCommentContent = getCommentContent;