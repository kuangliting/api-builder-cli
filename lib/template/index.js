module.exports.header = function ({
    request
}) {
    return `import request from '${request}';
    `
}
 
module.exports.getApiContent = function (p) {
    let op = {
        params: 'data',
        cnt: 'data',
    }
    if (p.method === "get") {
        op.params = 'query';
        op.cnt = 'params: query';
    }
    let exp = /\{([a-zA-Z]+)\}/g;
    if (p.path.indexOf("{") > -1) {
        let paramList = [];
        p.path = p.path.replace(exp, function (a,c,i) {   
            paramList.push(c);
            return `\${${op.params}.${c}}`;
        })
        // if (paramList.length) {
        //     op.params=`{${paramList.join(",")}}`
        // }
        p.path=`\`${p.path}\``
    }else{
        p.path=`'${p.path}'`
    }

    let paramStr = '';
    return `
export function ${p.funcName}(${op.params}) {
    return request({
        url: ${p.path},
        method: '${p.method}',
        ${op.cnt}
    })
}        
`
}

module.exports.getModuleExport = function (moduleList) {
    return `
export default {${moduleList.map(moduleName=>{
      return '\n  '+moduleName
    })},\n};
`
}