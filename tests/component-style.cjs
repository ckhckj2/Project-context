'use strict';
const fs=require('node:fs');
module.exports=function componentStyle(source){
 const css=fs.readFileSync('app-components.css','utf8');
 const start='/* BEGIN '+source+' */',end='/* END '+source+' */';
 const a=css.indexOf(start),b=css.indexOf(end);
 if(a<0||b<a)throw Error('Missing style section: '+source);
 return css.slice(a+start.length,b);
};
