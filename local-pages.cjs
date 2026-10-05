const path=require('node:path');
const {pathToFileURL}=require('node:url');
// Keep navigation restricted to the three authored entry points in this app.
function isLocalPage(url,root){return ['index.html','map-test.html','screening-center.html'].some(file=>url===pathToFileURL(path.join(root,file)).href);}
module.exports={isLocalPage};
