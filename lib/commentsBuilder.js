function getResponse(apiObj,definitions){
    let schema = apiObj.responses && apiObj.responses['200'] && apiObj.responses['200']['schema'];
    if(!schema){
        console.log("no response schema");
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
            ` *  必填:${p.required}  ${p.name}${p.type ? ":"+p.type : ''}  ${p.description? "描述:"+p.description : ''}
`
    })
    return `
/**
${comStr} **/`;

}

module.exports.getCommentContent = getCommentContent;