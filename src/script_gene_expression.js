var tsv = require("node-tsv-json")
var fs = require('fs');

tsv({
    input: "quantification_expanded_data.tsv", 
    output: "output2.json"
    //array of arrays, 1st array is column names
    // ,parseRows: true
  }, function(err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log(result.length);
      var allYValues = [];
      var allXValues = [];
      var geneExpression = [];
      for(var i = 0; i < result.length; i++){
      	if(i == 0){
      		var skipFirst = false;
      		var objects = result[0];
      		for(value in objects){
      			if(skipFirst == true){
	      			allXValues.push(value);
      			}
      			skipFirst = true;
      		}
      	}

      	//compute matrix geneExpression
      	var skipFirstColumn = false;
      	var idx = 0;
      	geneExpression[i] = [];
      	for(val in result[i]){
			if(skipFirstColumn == true){
				// geneExpression[i][idx] = 0;
  				geneExpression[i][idx] = result[i][val];
  				idx ++;
			}
      		skipFirstColumn = true;
      	}
      	allYValues.push(result[i]['hsapiens']);
      	// console.log(result[1]['hsapiens']);
      }

      // console.log("allYValues", allYValues);
      // console.log("allXValues", allXValues);
      // console.log("geneExpression", geneExpression);
      fs.writeFile("allXValuesNewValues.json", JSON.stringify(allXValues), 'utf8', function (err) {
	    if (err) {
	        console.log("An error occured while writing JSON Object to File.");
	        return console.log(err);
	    }
	 
	    console.log("JSON file has been saved.");
	  });
	  fs.writeFile("allYValuesNewValues.json", JSON.stringify(allYValues), 'utf8', function (err) {
	    if (err) {
	        console.log("An error occured while writing JSON Object to File.");
	        return console.log(err);
	    }
	 
	    console.log("JSON file has been saved.");
	  });
      fs.writeFile("geneExpressionNewValues.json", JSON.stringify(geneExpression), 'utf8', function (err) {
	    if (err) {
	        console.log("An error occured while writing JSON Object to File.");
	        return console.log(err);
	    }
	 
	    console.log("JSON file has been saved.");
	  });

      //    [
      //      { 'date, 'close'},
      //      { '31-Jul-07', '131.76' },
      //      { '30-Jul-07', '141.43' },
      //      { '27-Jul-07', '143.85' },
      //      { '26-Jul-07', '146.00' },
      //      { '25-Jul-07', '137.26' },
      //      { '24-Jul-07', '134.89' },
      //      { '23-Jul-07', '143.70' },
      //      { '20-Jul-07', '143.75' }
      //    ]
    }
});