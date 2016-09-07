function clamp(min,v,max){
	return Math.max(min,Math.min(v,max));
}


function toggleFullscreen(){
	// fullscreen toggle from https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#Toggling_fullscreen_mode
	if(
		!document.fullscreenElement && 
		!document.mozFullScreenElement && 
		!document.webkitFullscreenElement && 
		!document.msFullscreenElement
	){
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen();
		} else if (document.body.msRequestFullscreen) {
			document.body.msRequestFullscreen();
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen();
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

function ease(t) {
	if ((t/=0.5) < 1) {
		return 0.5*t*t*t;
	}
	return 0.5*((t-=2)*t*t + 2);
};