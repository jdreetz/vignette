module.exports = {
	generateThumbnail:function(res,options){
		var ffmpeg = require('fluent-ffmpeg'),
			http = require('http'),
			filestream = require('fs'),
			tempFile = filestream.createWriteStream("download-temp/temp.mp4"),
			tempPath = 'download-temp';

		var outputSize = options.aspect === 'preserve' ? options.width + 'x?' : options.width + 'x' + options.height;
		
		if(!options.download){
			var request = http.get(options.path,function(response){
				response.pipe(tempFile);
				response.on('end',function(){
					var proc = new ffmpeg({source:tempFile.path})
					.withSize(outputSize)
					.on('end',function(thumbnailImagePath){
						res.send(tempPath + '/' + thumbnailImagePath[0]);
					})
					.takeScreenshots({
						count:1,
						timemarks:[options.position],
						filename: 'tempThumbnail'
					},'download-temp');
				});					
			});
		}
		else{
			var proc = new ffmpeg({source:options.path})
					.withSize(outputSize)
					.on('end',function(thumbnailImagePath){
						res.send(tempPath + '/' + thumbnailImagePath[0]);
					})
					.takeScreenshots({
						count:1,
						timemarks:[options.position],
						filename: 'tempThumbnail'
					},'download-temp');
		}
	},
	downloadYT:function(res,options){
		var ytdl = require('youtube-dl'),
			filestream = require('fs');

		ytdl.download(options.path)
		.on('end',function(data){
			filestream.renameSync(data.filename,'download-temp/yt.mp4');
			res.send('download-temp/yt.mp4');
		});
	}
};