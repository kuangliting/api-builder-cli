function getCommentContent(paramList) {
    let comStr = '';
    paramList.forEach( p => {
        comStr = comStr + 
` *  必填:${p.required}  ${p.name}${p.type ? ":"+p.type : ''}  ${p.description? "描述:"+p.description : ''}
`
    })
    return `
/**
${comStr} **/`;

}

module.exports.getCommentContent = getCommentContent;