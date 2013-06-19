var fs = require("fs"),
    parser = require("../parser");

function loadFiles(nr){
    var text = fs.readFileSync(__dirname + "/test"+nr+".txt", "utf-8"),
        html = fs.readFileSync(__dirname + "/test"+nr+".html", "utf-8");
    return {
        text: text,
        html: html
    }
}

function test(nr){
    var mailObject = loadFiles(nr);
    return parser(mailObject);
}

for(var i = 1; i<=10; i++){
    console.log("NR: "+i)
    console.log(test(i));
}