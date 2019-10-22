//remove duplicates, 
var mammals_lifespan = require("./mammals_lifespan.js")
console.log("values length", values.length);
console.log("mammals table", mammals_lifespan.length);
var fs = require('fs');


for(var i = 0; i < values.length; i++){
    for(var j = 0; j < mammals_lifespan.length; j++){
        if(mammals_lifespan[j].ncbi_taxid == values[i].taxid){
            values[i]['maximum_longevity'] = mammals_lifespan[j]['Maximum longevity (yrs)'];
            console.log("found maximum_longevity", mammals_lifespan[j]['Maximum longevity (yrs)']);
            break;
        }
    }
    if(values[i]['maximum_longevity'] == null){
            values[i]['maximum_longevity']= "";
    }
  
}

values.sort(function(a, b){
    return b.maximum_longevity - a.maximum_longevity;
});

for(var i = 0; i < values.length; i++){
  
    if(values[i]['maximum_longevity'] == null  || values[i]['maximum_longevity'] == ""){
            values[i]['maximum_longevity']= 0;
    } else {
        values[i]['maximum_longevity'] = values[i]['maximum_longevity'];
    }
  
}

var new_values = [];
var hash = [];
for(var i = 0; i < values.length; i++){
   if(hash[values[i].run] == null){
        hash[values[i].run] = 1;
        new_values.push(values[i]);
   }
}

console.log("old values", values.length);
console.log("new values", new_values.length);


fs.writeFile("file.json", JSON.stringify(new_values), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
