var port = 3000;
var express = require('express'),
	app = express(),
	vid_utils = require('./vid_utils');

app.use('/',express.static('../client'));
app.use('/download-temp',express.static('download-temp'));
app.use('/getImage',function(req,res){
	console.log(req.query);
	try{
		var options = {
			path: req.query.url,
			position: req.query.pos,
			width: req.query.w,
			height: req.query.h,
			aspect: req.query.a,
			download: req.query.dl || null
		}
		vid_utils.generateThumbnail(res,options);	
	}
	catch(exception){
		console.log(exception);
		res.send(exception,500);
	}
});
app.use('/downloadYT',function(req,res){
	try{		
		var options = {
			path: req.query.url
		}
		vid_utils.downloadYT(res,options);
	}
	catch(exception){
		console.log(exception);
		res.send(exception,500);
	}
});

app.listen(port);
console.log('Listening on ' + port);