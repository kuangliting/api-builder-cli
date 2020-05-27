module.exports.getConfigContent = function() {

    return `
 let Path = require("path");
 let resolve = (path) => {
     return Path.resolve(__dirname, path);
 }

 module.exports = {
    apiHost: "http://10.111.32.74:10212/skyline/v2/api-docs",  //服务器地址
    includes:["/city-camera"],  //只生成请求路径中包含includes元素的api
    excludes:["/city-camera/add-group"],  //剔除请求路径中包含excludes元素的api
    swaggerPath: resolve(".swagger/swagger.json"), 
    typePath: resolve("src/typings/api/smartCity.d.ts"),
    api: {
        path: resolve("src/api"),
        fileName: "{moduleName}/index.js",
        template: {
            hasNotes:true,  
        }
    }
}         
`
}