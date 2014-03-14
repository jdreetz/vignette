vignette.onSaveThumbnail = function(){
	if(!$video_player[0].readyState === 4){
		return;
	}	

	var outW = $('#output_width').val(),
		outH = $('#output_height').val(),
		vidW = $video_player[0].videoWidth,
		vidH = $video_player[0].videoHeight,
		aspect = $('input[name=preserve_aspect]:radio:checked').val(),
		canvas = document.createElement('canvas'),
		outImg = document.createElement('img'),
		drawX,drawY,drawW,drawH;

	console.log(vidW,vidH);

	canvas.width = outW;			
	canvas.height = aspect === 'preserve' ? (outW / vidW) * outH : outH;

	drawX = 0;
	drawY = aspect === 'preserve' ? 0 : (
		(canvas.height / 2) - (canvas.height/vidH * vidH)
	);
	drawW = outW;
	drawH = (outW / vidW) * outH;

	var context = canvas.getContext('2d');
	context.fillStyle = "black";
	context.fill();

	context.drawImage(thumb_full_res,drawX,drawY,drawW,drawH);
	$('body').append(canvas);
	outImg.src = canvas.toDataURL("image/png");

	window.open(outImg);	

};