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
        p.path = p.path.replace(exp, function (a, c, i) {
            paramList.push(c);
            return `\${${op.params}.${c}}`;
        })
        // if (paramList.length) {
        //     op.params=`{${paramList.join(",")}}`
        // }
        p.path = `\`${p.path}\``
    } else {
        p.path = `'${p.path}'`
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

function getPropType(propObj){
    let parseTypeMap = {
        integer:'number',
    }
    
    if(propObj.$ref){
        return  propObj.$ref.slice("#/definitions/".length)
    }else{
        if(propObj.type === 'array'){
            if(propObj.items){
                if(propObj.items.$ref){
                    return  propObj.items.$ref.slice("#/definitions/".length) + '[]';
                }else{
                    //console.log(propObj.items)
                    let type = propObj.items.type
                    return parseTypeMap[type]||type + '[]';
                }
                
            }
        }
        return parseTypeMap[propObj.type]||propObj.type
    }
    
} 
module.exports.getTypeContent = function (typeName, outer) {
    let typeObj = outer.properties;
    let props = Object.keys(typeObj);
    let propsStr = '';
    let required = outer.required ||[];
    let parseTypeMap = {
        integer:'number',
        array:'[]'
    }
    props.forEach(p => {
        propObj = typeObj[p];
        
        
        let propN= required.indexOf(p)!=-1 ? p : p+"?";
        //let propType = propObj.$ref ?  propObj.$ref.slice("#/definitions/".length) : parseTypeMap[propObj.type]||propObj.type;
        //console.log(propObj.description && propObj.description.length);
        let propType = getPropType(propObj);
        if(propObj.description && propObj.description.length < 25){
            let desc ='//'+propObj.description;
            propsStr = propsStr + `        ${propN}: ${propType}, ${desc}
`
        }else{
            //console.log(propObj.description)
            let desc = propObj.description ? `        /** 
         * ${propObj.description}
        **/
`:'';       
            propsStr = propsStr + desc + `        ${propN}:${propType},
`
        }
        
    })
    return `
    ${outer.description   ? '// '+outer.description : ''}
    export interface ${typeName}{
${propsStr}    }`
}