//http://cdn.visiblemeasures.com/ad_assets/s/c543/Inception.mp4

var VIGNETTE = VIGNETTE || {},
	UTILS = UTILS || {},
	SERVER = SERVER || {};
VIGNETTE = (function(){
	var vignette = {},
		$video_player,
		$play_head,
		$thumb_preview,
		thumb_timeStamp,
		video_path;

	vignette.init = function(){
		$video_player = $('#video-player');
		$video_player.on('timeupdate',vignette.onVideoTimeUpdate);
		$video_player[0].muted = true;
		$play_head = $('#play_head');
		$thumb_preview = $('#thumb-preview');
		

		// capture keystrokes
			// Space: Play/Pause
			// Right/Left Arrow: Frame Forward/Backward
			// Command R: Capture thumbnail
		// capture thumb button press
		// capture creative path entered
		// id = creative_path
		
		$('#load_video').on('click',vignette.load_video);
		$('#play_pause').on('click',vignette.toggle_playback);
		$('#timeline').on('click',vignette.onTimelineClick);
		$('#frame_backwards,#frame_forwards').on('click',vignette.onFrameChangeClick);
		$('#choose_thumbnail').on('click',vignette.onChooseThumbnail);
		$('#save_image').on('click',vignette.onSaveThumbnail);
		$(window).on('keydown',vignette.onKeyPress);
	};

	vignette.load_video = function(){
		var path = $('#creative_path').val();
		video_path = path;
			
		if(!path || path === '' ){
			return;
		}
		else{
			if(UTILS.isYT(path)){
				$('#operation_notifier').html('Downloading Youtube Video...');
				SERVER.downloadVideo(path,'youtube',function(response){
					$video_player.attr('src',response.path);
					video_path = response.path;
					$('#play_pause span').removeClass('glyphicon-play').addClass('glyphicon-pause');
					$('#timeline').css({'display':'block'});
					$('#operation_notifier').html('');
				});
			}
			else{
				$video_player.attr('src',path);
				$('#play_pause span').removeClass('glyphicon-play').addClass('glyphicon-pause');
				$('#timeline').css({'display':'block'});
			}
		}
	}

	vignette.toggle_playback = function(){
		if( !$video_player.attr('src') || $video_player.attr('src') === '' ){
			return;
		}

		if($video_player[0].paused){
			$video_player[0].play();
			$('#play_pause span').removeClass('glyphicon-play').addClass('glyphicon-pause');
		}
		else{
			$video_player[0].pause();
			$('#play_pause span').removeClass('glyphicon-pause').addClass('glyphicon-play');
		}
	};

	vignette.onVideoTimeUpdate = function(timeupdate){
		var currentTimeNormalized = timeupdate.target.currentTime / timeupdate.target.duration;
		$play_head.css({'left':(currentTimeNormalized * 100) + '%'});
	};

	vignette.onTimelineClick = function(event){
		if(!$video_player[0].readyState === 4){
			return;
		}
		var position = event.offsetX / $(event.target).width();
		$video_player[0].currentTime = position * $video_player[0].duration;
	};

	vignette.onFrameChangeClick = function(event){
		if(!$video_player[0].paused){
			vignette.toggle_playback();
		}

		switch(event.target.id){
			case 'frame_forwards':
				$video_player[0].currentTime += 1/29.97; 
				break;
			case 'frame_backwards':
				$video_player[0].currentTime -= 1/29.97; 
				break;
		}
	};

	vignette.onChooseThumbnail = function(event){
		if(!$video_player[0].readyState === 4){
			return;
		}
		thumb_timeStamp = $video_player[0].currentTime;

		var vidW = $video_player[0].videoWidth,
			vidH = $video_player[0].videoHeight,
			canW = $thumb_preview[0].width,
			canH = $thumb_preview[0].height,
			drawW,drawH,drawX,drawY;

		var context = $thumb_preview[0].getContext('2d');
		drawW = canW;
		if(vignette.is16x9(vidW,vidH)) {
			drawH = canH < vidH ? (canH / vidH) * canH : (vidH / canH)  * canH;
		}
		else{
			drawH = canH / vidH * vidH;
		}
		drawX = 0;
		drawY = (canH / 2) - (drawH / 2);
		context.drawImage($video_player[0],drawX,drawY,drawW,drawH); 
		console.log(drawX,drawY,drawW,drawH);

		// thumb_full_res = document.createElement('canvas');
		// thumb_full_res.width = vidW;
		// thumb_full_res.height = vidH;
		// context = thumb_full_res.getContext('2d');
		// context.drawImage($video_player[0],0,0,vidW,vidH);
	};

	vignette.is16x9 = function(w,h){
		return !(h/w > 0.5625);
	}

	vignette.onSaveThumbnail = function(){
		if(!$video_player[0].readyState === 4 || !thumb_timeStamp){
			return;
		}	
		
		var create_path = $('#creative_path').val(),
			query = '';

		if(!UTILS.isYT(create_path)){
			$('#operation_notifier').html('Processing Video On Server...');
			query = 'getImage/?' + 
							  'url=' + $('#creative_path').val() + 
							  '&pos=' + thumb_timeStamp + 
							  '&w=' +  $('#output_width').val() + 
							  '&h=' + $('#output_height').val() + 
							  '&a=' + $('input[name=preserve_aspect]:radio:checked').val();
		}
		else{
			query = 'getImage/?' + 
							  'url=' +  video_path + 
							  '&pos=' + thumb_timeStamp + 
							  '&w=' +  $('#output_width').val() + 
							  '&h=' + $('#output_height').val() + 
							  '&a=' + $('input[name=preserve_aspect]:radio:checked').val() +
							  '&dl=' + true;
		}

		$.get(query,function(response){
			$('#operation_notifier').html('');
			window.open(response,"_blank","width="+$('#output_width').val()+",height="+$('#output_height').val());
		});
	};

	vignette.onKeyPress = function(event){
		switch(event.keyCode){
			case 32:
				vignette.toggle_playback();
				break;
			case 39:
				vignette.onFrameChangeClick({target:{id:'frame_forwards'}});
				break;
			case 37:
				vignette.onFrameChangeClick({target:{id:'frame_backwards'}});
				break;
			case 13:
				vignette.onChooseThumbnail();
				break;
		}
	};

	return vignette;
}());

UTILS = (function(){
	var utils = {};


	// From http://stackoverflow.com/questions/2256930/how-to-check-the-valid-youtube-url-using-jquery
	utils.isYT = function(url){
		return !!url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
	};
	return utils;
}());

SERVER = (function(){
	var server = {};
		server.downloadVideo = function(path,type,callback){
			switch(type){
				case 'youtube':
					var query = 'downloadYT/?url=' + path;
					$.get(query,function(response){
						callback({'path':response});
					});
					break;
			}
		};


	return server;
}());

$(document).ready(function(){
	VIGNETTE.init();
});