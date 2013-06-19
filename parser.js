var addressparser = require("addressparser");

module.exports = parser;

function parser(mailObject){
    var text = mailObject.text || "",
        html = mailObject.html || "",
        response = parseText(text, html);

    return response.from ? response : false;
}


function parseText(text, html){
    var lines = text.split(/\r?\n|\r/),
        from, to;

    var escaped = false, isHeader = false, header = [], line;
    for(var i=0, len = lines.length; i < len; i++){

        if(!isHeader){
            if(lines[i].match(/^\-{4,}/) && (lines[i + 1] || "").match(/^[^:]+:\s+/)){
                isHeader = true;
            }else if(!lines[i].trim() && (lines[i + 1] || "").match(/^>\s*[^:]+:\s+/)){
                isHeader = true;
                escaped = true;
            }
        }else{

            line = lines[i].replace(escaped ? /^>\s*|\s+$/g : /^\s*|\s+$/g, "").replace(/^[^:]+:\s*/, "");
            if(line){
                if(new Date(line).toString().toLowerCase().trim() == "invalid date"){
                    header.push(addressparser(line));
                }
            }else{
                break;
            }
        }

    }

    if(!isHeader){
        for(var i=0, len = lines.length; i < len; i++){

            if(!isHeader){
                if(!lines[i].trim() && (lines[i + 1] || "").match(/^[^:]+:\s+/)){
                    isHeader = true;
                }
            }else{

                line = lines[i].replace(/^\s*|\s+$/g, "").replace(/^[^:]+:\s*/, "");
                if(line){
                    if(new Date(line).toString().toLowerCase().trim() == "invalid date"){
                        header.push(addressparser(line));
                    }
                }else{
                    break;
                }
            }
            
        }
    }

    html = html.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");
    header.forEach(function(addresses){
        var address, addressList = [];

        addresses.forEach(function(addr){
            if(!addr.address && addr.name){
                address = detectAddress(addr.name, html);
                if(address){
                    addr.address = address;
                }
            }
            if(addr.address){
                addressList.push(addr);
            }
        });

        if(addressList && addressList.length){
            if(!from){
                from = addressList;
            }else{
                to = [].concat(to || []).concat(addressList);
            }
        }
    });

    return {from: from, to: to};
}

function detectAddress(name, html){
    name = (name || "").replace(/\s+/g, " ");
    var re = new RegExp("<[^>]+>[\s\u0000]*" + name.replace(/\\\^\$\*\+\?\.\(\)\:\=\!\|\{\}\,\[\]/g, "\\$1") + "[\s\u0000]*<\/[^>]+>");
    var match = html.match(re);
    if(match){
        if((match = (match[0] || "").match(/mailto:([^"'\s]+)/))){
            return match[1] || "";
        }
        
    }
    return "";
}



