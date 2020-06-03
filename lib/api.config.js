const Path = require("path");
const resolve = (path) => {
    return Path.resolve(__dirname, path);
}

module.exports = {
    apiHost: "",//"http://10.111.32.74:10212/skyline/v2/api-docs","http://10.9.105.13:8889/v2/api-docs"
    includes:[],  //只生成请求路径中包含includes元素的api
    excludes:[],  //剔除请求路径中包含excludes元素的api
    swaggerPath: resolve(".swagger/swagger.json"),
    api: {
        path: resolve("src/apiModule"),
        fileName: "{moduleName}/index.js",
        requestPath:"@/utils/request",
        comments: {
            show:true,
            //hasResponse:true,
        },
        
    },
    tsSupport: false,
    typePath: resolve("src/typings/api/smartCity.d.ts"),
}