/**
 * replace image url script.
 * you can input command like "node rurl.js -new http://www.g.cn/" to use it.
 * any css includes "!important" will not be effected.
 */
//your new replace url 
var args = process.argv.slice(2);
var command = args[0]+"";
var newReplaceUrl = args[1]+"";

if(command != '-new' || newReplaceUrl == null){
    throw 'please input your new url. Eg: node rurl.js -new https://www.g.cn/';
}
        
var fs = require('fs');

var files = ["bank.css", "wallet.css"];
var URL_REG = /url\(.*?;/g;
var PIC_REG = /url\(.*?(?=[A-Za-z_\-0-9]*(\.png|\.jpg))/;

for(var i=0;i<files.length;i++){
    var file = files[i];
    (function (_file){
        fs.readFile(_file,function (err,data){
            data = data + "";
            data = data.replace(URL_REG,function (word){
                if(word.indexOf("important") != -1){
                    return word;
                }else{
                    var url = "url(" + newReplaceUrl;
                    return word.replace(PIC_REG, url);
                }
            });
            
            fs.writeFile(_file, data, function(err){
                if(err){
                    console.log("error!" + _file);
                }else{
                    console.log("success!" + _file);
                }
            });
        })
    })(file)
}
