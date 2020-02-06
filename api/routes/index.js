var express = require('express');
var fs = require('fs');
var Promise = require('bluebird');

var router = express.Router();

async function readFile(){
	return new Promise(async resolve => {
		fs.readFile('/etc/passwd','utf8', (err, data) => {
		if (err) throw err;
		  resolve(data);
		});
	});
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
