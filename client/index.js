var startTime=0;
var lastTime=0;
var curTime=0;

var game = new PIXI.Container();
var scene = new PIXI.Container();

var resizeTimeout=null;

var mouse={
	pos:[0,0]
};
var offset=[0,0];

var size=[1280,720];

var palette={
	color1:0xEEEEEE,
	color2:0x999999
};

var ui={
	currentElement:null,
	layoutElements:[],
	hitboxes:[],
	hitcircles:[],

	addToLayout:function(_ui,_fromLeft,_fromTop,_x,_y){
		this.layoutElements.push({
			ui: _ui,
			from:[_fromLeft,_fromTop],
			pos:[_x,_y]
		});
		layoutUI(this.layoutElements.length-1);
	},


	update:function(){
		// update mouse interaction
		var prevElement = ui.currentElement;
		ui.currentElement=null;
		for(var i=0; i < ui.hitboxes.length; ++i){
			var u=ui.hitboxes[i];
			var p=new PIXI.Point(0,0);
			p=u.e.toGlobal(p);
			if(
				mouse.pos[0] >= p.x &&
				mouse.pos[1] >= p.y &&
				mouse.pos[0] <= p.x+u.w &&
				mouse.pos[1] <= p.y+u.h
			){
				ui.currentElement=u;
			}
		}
		var curr=Infinity;
		for(var i=0; i < ui.hitcircles.length; ++i){
			var u=ui.hitcircles[i];
			var p=new PIXI.Point(0,0);
			p=u.e.toGlobal(p);
			var r=Math.pow(mouse.pos[0]-p.x,2)+Math.pow(mouse.pos[1]-p.y,2);
			if(r <= u.r*u.r && r < curr){
				curr=r;
				ui.currentElement=u;
			}
		}

		if(prevElement!=ui.currentElement){
			if(prevElement!=null){
				prevElement.onMouseOut();
			}if(ui.currentElement!=null){
				ui.currentElement.onMouseOver();
			}
		}

		if(ui.currentElement!=null){
			document.body.style.cursor = 'pointer';
		}else{
			document.body.style.cursor = 'auto';
		}


		// update ui elements
		for(var i=0; i < ui.layoutElements.length; ++i){
			var u=ui.layoutElements[i];
			u.ui.update();
		}
	}
};

var sounds=[];

$(document).ready(function(){
	$(document).on("mousemove",function(event){
		mouse.pos=[event.pageX,event.pageY];
	});

	$(document).on("mousewheel DOMMouseScroll",function(event){
		event=event.originalEvent;
		var delta=event.detail||-event.wheelDelta;
		game.messages.scrollOffset += delta > 0 ? -1 : 1;
		game.messages.scrollOffset = clamp(0,game.messages.scrollOffset,game.messages.messages.length-vars.misc.message_displaySize);
	});


	$(document).on("click",function(event){
		if(ui.currentElement!=null){
			ui.currentElement.onClick();
		}
	});

	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on("mousedown",function(event){
		window.focus();
	});

	// setup game
	startTime=Date.now();
	sounds["bgm"] = new Howl({
		urls:["assets/audio/bgm.ogg"],
		autoplay:true,
		loop:true,
		volume:0
	});
	sounds["bgm"].fadeIn(1,3000);
	sounds["tick"] = new Howl({
		urls:["assets/audio/tick.ogg"],
		autoplay:false,
		loop:false,
		volume:1
	});

	Howler.mute();

	// create renderer
	renderer = PIXI.autoDetectRenderer(
		size[0],size[1],
		{
			antiAlias:true,
			transparent:false,
			resolution:1,
			roundPixels:false
		}
	);
	renderer.visible=false;
	renderer.backgroundColor = palette.color1;
	renderer.view.style.opacity = "0";

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;

	// add the canvas to the html document
	$("#display").prepend(renderer.view);



	// create a new render texture..
	brt = new PIXI.BaseRenderTexture(size[0], size[1], PIXI.SCALE_MODES.LINEAR, 1);
	renderTexture = new PIXI.RenderTexture(brt);
	 
	// create a sprite that uses the new render texture...
	// and add it to the stage
	renderContainer = new PIXI.Container();
	renderSprite = new PIXI.Sprite(renderTexture);
	renderContainer.addChild(renderSprite);

	

	CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
	CustomFilter.prototype.constructor = CustomFilter;


	setup();
});


function CustomFilter(fragmentSource){
	PIXI.Filter.call(this,
		// vertex shader
		null,
		// fragment shader
		fragmentSource
	);
}


function loadProgressHandler(loader, resource){
	// called during loading

	console.log("loading: " + resource.url);
	console.log("progress: " + loader.progress+"%");


	//$("#canvas-overlay pre").append("\n"+Math.round(loader.progress)+"%...");
}

function setup(){
	
	textStyle = {
		fontFamily: 'Courier New, monospace',
		fontSize:vars.misc.ui_scale+'px',
		fill : palette.color2,
		dropShadow : false,
		wordWrap : false
	};

	function makeButton(_text){
		var g = new PIXI.Graphics();

		var t = new PIXI.Text(_text, textStyle);
		g.addChild(t);
		t.position.y=vars.misc.ui_scale;
		t.position.x=vars.misc.ui_scale*5;
		t.anchor.x=0.5;
		t.anchor.y=0.5;

		g.text=t;
		g.update=function(){

		};

		return g;
	};



	// UI SETUP

	var btnExplore=makeButton("explore");
	var btnExpand=makeButton("expand");
	var btnExploit=makeButton("exploit");
	var btnExterminate=makeButton("exterminate");
	

	var btnOptions= new PIXI.Graphics();
	btnOptions.update=function(){
	};

	ui.hitboxes.push({
		e:btnExplore,
		w:vars.misc.ui_scale*10,
		h:vars.misc.ui_scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:explore_onClick
	});

	ui.hitboxes.push({
		e:btnExpand,
		w:vars.misc.ui_scale*10,
		h:vars.misc.ui_scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:expand_onClick
	});
	ui.hitboxes.push({
		e:btnExploit,
		w:vars.misc.ui_scale*10,
		h:vars.misc.ui_scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:exploit_onClick
	});
	ui.hitboxes.push({
		e:btnExterminate,
		w:vars.misc.ui_scale*10,
		h:vars.misc.ui_scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:exterminate_onClick
	});

	ui.hitboxes.push({
		e:btnOptions,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			this.e.beginFill(palette.color2);
			this.e.lineStyle(1, palette.color2, 1);
			this.e.drawRect(0,0,vars.misc.ui_scale*2,vars.misc.ui_scale*2);
			this.e.endFill();
		},
		onMouseOut:function(){
			this.e.clear();
			this.e.beginFill(palette.color1);
			this.e.lineStyle(1, palette.color2, 1);
			this.e.drawRect(0,0,vars.misc.ui_scale*2,vars.misc.ui_scale*2);
			this.e.endFill();
		},
		onClick:function(){
			toggleFullscreen();
		}
	});

	for(var i=ui.hitboxes.length-5;i<ui.hitboxes.length;++i){
		ui.hitboxes[i].onMouseOut();
	}
	
	ui.addToLayout(btnExplore,true,false,vars.misc.ui_scale,-vars.misc.ui_scale*3);
	ui.addToLayout(btnExpand,true,false,vars.misc.ui_scale*12,-vars.misc.ui_scale*3);
	ui.addToLayout(btnExploit,true,false,vars.misc.ui_scale*23,-vars.misc.ui_scale*3);
	ui.addToLayout(btnExterminate,true,false,vars.misc.ui_scale*34,-vars.misc.ui_scale*3);
	ui.addToLayout(btnOptions,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*3);

	game.views=[];
	game.solarSystem=null;
	game.planetarySystem=null;
	game.galacticSystem=getGalacticSystem(startTime);
	game.galacticSystem.view=0;
	game.galacticSystem.viewTarget=0;
	game.views.push(game.galacticSystem);
	
	game.views.GALAXY=0;
	game.views.SOLAR=1;
	game.views.PLANET=2;
	game.views.current = game.views.GALAXY;


	galacticSystem_initInteraction();

	// MESSAGE SETUP

	game.messages={
		messages:[],
		messageBox:new PIXI.Graphics(),
		scrollOffset:0
	};
	game.messages.messageBox.update=function(){
		var self=game.messages.messageBox;
		self.clear();
		
		// draw message box
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(0,0,vars.misc.ui_scale*43,vars.misc.ui_scale*vars.misc.message_displaySize);
		self.endFill();

		// draw scrollbar thumb
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(vars.misc.ui_scale*42,vars.misc.ui_scale*(vars.misc.message_displaySize-1)*(1-(game.messages.scrollOffset)/(game.messages.messages.length-vars.misc.message_displaySize)),vars.misc.ui_scale,vars.misc.ui_scale);
		self.endFill();

		// line separating scrollbar from message area
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.moveTo(vars.misc.ui_scale*42,vars.misc.ui_scale*vars.misc.message_displaySize);
		self.lineTo(vars.misc.ui_scale*42,0);
		self.endFill();



		for(var i=0; i<game.messages.messages.length;++i){
			var o=i-game.messages.scrollOffset;
			if(o >= 0 && o < vars.misc.message_displaySize){
				game.messages.messages[i].position.y=vars.misc.ui_scale*(vars.misc.message_displaySize-o);
				game.messages.messages[i].visible=true;
			}else{
				game.messages.messages[i].visible=false;
			}
		}
	};
	ui.addToLayout(game.messages.messageBox,true,false,vars.misc.ui_scale,-vars.misc.ui_scale*(vars.misc.message_displaySize+4));
	// some test messages


	var textArray = [].concat(
		postMessage("This is a single line."),
		postMessage("This is two lines in one.\nHere's the other one."),
		postMessage("This is a long paragraph that probably shouldn't fit in a single line and will wrap around instead. In fact, it's so long that it should take up at least three lines on its own."),
		postMessage("..."),
		postMessage("So hey, how's your day going?")
	);





	// SCENE HIERARCHY SETUP

	game.addChild(game.galacticSystem);
	
	game.addChild(game.messages.messageBox);

	game.addChild(btnExplore);
	game.addChild(btnExpand);
	game.addChild(btnExploit);
	game.addChild(btnExterminate);
	game.addChild(btnOptions);




	scene.addChild(game);


	// start the main loop
	window.onresize = onResize;
	onResize();
	main();


	// unhide the renderer
	renderer.view.style.display = "block";
}

function main(){
	curTime=Date.now()-startTime;

	ui.update();

	// reposition views
	for(var i = 0; i < game.views.length; ++i){
		var v=game.views[i];
		if(v !== null){
			var d=v.viewTarget-v.view;
			if(Math.abs(d) < 0.001){
				v.view=v.viewTarget;
			}else{
				v.view += (d > 0 ? 1 : -1) * vars.misc.transition_speed;
			}
			v.viewEased=ease(v.view);

			offset[0]=lerp(offset[0],(0.5-mouse.pos[0]/size[0])*32 + Math.sin(curTime/2222)*16,0.05);
			offset[1]=lerp(offset[1],(0.5-mouse.pos[1]/size[1])*32 + Math.sin(curTime/3333)*16,0.05);
			v.position.x=size[0]*2/3 + v.viewEased*size[0] + offset[0];
			v.position.y=(size[1]-(vars.misc.ui_scale*vars.misc.message_displaySize+2))/2 + offset[1];
		}
	}

	// spin star
	if(game.solarSystem!=null){
		game.solarSystem.star.rotation=curTime/game.solarSystem.star.rotationSpeed;
		for(var i=0;i < game.solarSystem.orbits.length;++i){
			var orbit=game.solarSystem.orbits[i];

			// spin orbit
			orbit.rotation=curTime/orbit.rotationSpeed;
			
			// reposition planet on orbit
			orbit.planet.position = orbit.toGlobal(orbit.planetPoint);
			orbit.planet.position.x-=game.solarSystem.position.x;
			orbit.planet.position.y-=game.solarSystem.position.y;
		}
	}

	// spin galaxy
	if(game.galacticSystem!=null){
		game.galacticSystem.center.rotation=curTime/game.galacticSystem.center.rotationSpeed;
	
		for(var i=0;i < game.galacticSystem.stars.length;++i){
			var star= game.galacticSystem.stars[i];

			// spin stars
			star.rotation=curTime/star.rotationSpeed;
		}
	}
	

	// render
	renderer.render(scene,renderTexture);
	renderer.render(renderContainer);
	requestAnimationFrame(main);

	// log FPS
	++fpsCounter;
	if(fpsCounter>=100){
		fpsCounter=0;
		fpsAverage/=100;
		console.log("FPS",fpsAverage);
		fpsAverage=0;
	}
	fpsAverage+=1000/(curTime-lastTime);

	lastTime=curTime;
}

fpsAverage=0;
fpsCounter=0;

function onResize() {
	renderer.view.style.opacity = "0";
	if(resizeTimeout != null){
		window.clearTimeout(resizeTimeout);
	}

	resizeTimeout=window.setTimeout(function(){
		size[0]=$("#display").outerWidth();
		size[1]=$("#display").outerHeight();
		renderer.resize(size[0],size[1]);
		brt.resize(size[0],size[1]);
		renderer.view.style.width = size[0] + 'px';
		renderer.view.style.height = size[1] + 'px';

		layoutAll();
		renderer.view.style.opacity = "1";

		console.log("Resized",size);
	},250);
}

// lays out all UI layoutElements based on size
function layoutAll(){
	for(var i=0; i < ui.layoutElements.length; ++i){
		layoutUI(i);
	}
}

// lays out UI layoutElements based on size
function layoutUI(_idx){
	var u=ui.layoutElements[_idx];
	u.ui.position.x = (u.from[0] ? 0 : size[0]) + u.pos[0];
	u.ui.position.y = (u.from[1] ? 0 : size[1]) + u.pos[1];
}






function postMessage(_str){

	var res=[];
	var lines=_str.split("\n");
	
	// multiple lines
	if(lines.length > 1){
		while(lines.length > 0){
			res=res.concat(postMessage(lines[0]));
			lines=lines.slice(1);
		}
		return res;
	}


	// individual line

	// split the input string into words
	// add words to lines until an added word would overflow
	// when this happens, save the current line and go to the next
	var words=_str.split(" ");
	var lines=[];
	_str="";
	while(words.length > 0){
		if((_str.length + words[0].length+5)*0.4 > 27){
			lines.unshift(_str);
			_str="";
		}else{
			_str+=" "+words[0];
			words=words.slice(1);
		}
	}
	// if there's any _str left-over in the last line add it here
	// (unless the _str is a perfect fit, we'll have missed the last bit in the loop)
	if(_str.length>0){
		lines.unshift(_str);
	}

	// add lines to screen
	var l=lines.length;
	while(lines.length > 0){
		_str=lines[0];
		if(l>1){
			// multiline message
			while((_str.length+5)*0.4 <= 27){
				_str+=" ";
			}
			if(lines.length==1){
				_str="/*"+_str+" *";
			}else{
				_str=" *"+_str;
				if(lines.length==l){
					_str=_str+" */";
				}else{
					_str+=" *";
				}
			}
		}else{
			_str="//"+_str;
		}
		var t = new PIXI.Text(_str, textStyle);
		t.position.y=vars.misc.ui_scale*(4+lines.length);
		t.position.x=vars.misc.ui_scale;
		t.anchor.y=1;

		lines=lines.slice(1);
		res.push(t);
		game.messages.messageBox.addChild(t);
	}

	game.messages.messages=res.concat(game.messages.messages);

	while(game.messages.messages.length > vars.misc.message_bufferSize){
		game.messages.messageBox.removeChild(game.messages.messages.pop());
	}

	return res;
}




// hover stuff

function btn_onMouseOver(){
	this.e.clear();
	this.e.beginFill(palette.color2);
	this.e.lineStyle(1, palette.color2, 1);
	this.e.drawRect(0,0,vars.misc.ui_scale*10,vars.misc.ui_scale*2);
	this.e.endFill();
	this.e.text.style.fill=palette.color1;
};
function btn_onMouseOut(){
	this.e.clear();
	this.e.beginFill(palette.color1);
	this.e.lineStyle(1, palette.color2, 1);
	this.e.drawRect(0,0,vars.misc.ui_scale*10,vars.misc.ui_scale*2);
	this.e.endFill();
	this.e.text.style.fill=palette.color2;
};

function planet_onMouseOver(){
	renderPlanet(this.e, this.e.r, true);
};
function planet_onMouseOut(){
	renderPlanet(this.e, this.e.r, false);
};

function star_onMouseOver(){
	renderStar(this.e,this.e.points,this.e.pointType,this.e.radius_inner,this.e.radius_outer,true);
};
function star_onMouseOut(){
	renderStar(this.e,this.e.points,this.e.pointType,this.e.radius_inner,this.e.radius_outer,false);
};



// click stuff

function explore_onClick(){
	postMessage("executing 'cmd.explore()'...");
	switch(game.views.current){
		case game.views.PLANET:
		console.log(descriptions.planet);
		break;
		case game.views.SOLAR:
		console.log(descriptions.solarSystem);
		break;
		case game.views.GALAXY:
		console.log(descriptions.galaxy);
		break;
	}
}
function expand_onClick(){
	postMessage("executing 'cmd.expand()'...");
	switch(game.views.current){
		case game.views.PLANET:
		
		break;
		case game.views.SOLAR:
		
		break;
		case game.views.GALAXY:
		
		break;
	}
}
function exploit_onClick(){
	postMessage("executing 'cmd.exploit()'...");
	switch(game.views.current){
		case game.views.PLANET:
		
		break;
		case game.views.SOLAR:
		
		break;
		case game.views.GALAXY:
		
		break;
	}
}
function exterminate_onClick(){
	postMessage("executing 'cmd.exterminate()'...\nSearching for targets...");
	switch(game.views.current){
		case game.views.PLANET:
		postMessage("Targeting [PLANET]...");
		if(true){ // planet has life
			// remove life
			postMessage("Life on [PLANET] exterminated.");
		}else{
			postMessage("No living targets found.");
			postMessage("Command aborted.");
		}
		break;
		case game.views.SOLAR:
		postMessage("View resolution incompatible with 'cmd.exterminate()'.");
		postMessage("Command aborted.");
		break;
		case game.views.GALAXY:
		postMessage("View resolution incompatible with 'cmd.exterminate()'.");
		postMessage("Command aborted.");
		break;
	}
}



function planetIn_onClick(){
	postMessage("executing 'cmd.increaseResolution()'...");
	postMessage("Viewing [PLANET].");

	if(game.planetarySystem!==null){
		game.views[game.views.PLANET]=null;
		game.removeChild(game.planetarySystem);
	}
	game.planetarySystem=getPlanetarySystem(this.e);
	game.addChildAt(game.planetarySystem,0);

	game.solarSystem.viewTarget=-1;

	game.planetarySystem.viewTarget=0;
	game.planetarySystem.view=1;
	game.views.push(game.planetarySystem);

	planetarySystem_initInteraction();
}

function planetOut_onClick(){
	postMessage("executing 'cmd.decreaseResolution()'...");
	postMessage("Viewing [SOLARSYSTEM].");
	game.planetarySystem.viewTarget=1;
	game.solarSystem.viewTarget=0;

	solarSystem_initInteraction();
}

function starIn_onClick(){
	postMessage("executing 'cmd.increaseResolution()'...");
	postMessage("Viewing [SOLARSYSTEM].");

	if(game.solarSystem!==null){
		game.views[game.views.SOLAR]=null;
		game.removeChild(game.solarSystem);
	}
	game.solarSystem=getSolarSystem(this.e);
	game.addChildAt(game.solarSystem,0);

	game.galacticSystem.viewTarget=-1;

	game.solarSystem.viewTarget=0;
	game.solarSystem.view=1;
	game.views.push(game.solarSystem);

	solarSystem_initInteraction();
}

function starOut_onClick(){
	postMessage("executing 'cmd.decreaseResolution()'...");
	postMessage("Viewing [GALAXY].");
	game.solarSystem.viewTarget=1;
	game.galacticSystem.viewTarget=0;

	galacticSystem_initInteraction();
}





function planetarySystem_initInteraction(){
	console.log('switching to planetary system view');
	ui.hitcircles=[];
	ui.hitcircles.push({
		e:game.planetarySystem.planet,
		r:Math.max(game.planetarySystem.planet.r,vars.misc.min_interaction_radius),
		onMouseOver:planet_onMouseOver,
		onMouseOut:planet_onMouseOut,
		onClick:planetOut_onClick
	});
	ui.hitcircles[ui.hitcircles.length-1].onMouseOut();

	game.views.current = game.views.PLANET;
	descriptions.planet = descriptions.getPlanetDescription(game.planetarySystem);
}
function solarSystem_initInteraction(){
	console.log('switching to solar system view');
	ui.hitcircles=[];
	for(var i=0;i < game.solarSystem.orbits.length;++i){
		var orbit=game.solarSystem.orbits[i];

		ui.hitcircles.push({
			e:orbit.planet,
			r:Math.max(orbit.planet.r,vars.misc.min_interaction_radius),
			onMouseOver:planet_onMouseOver,
			onMouseOut:planet_onMouseOut,
			onClick:planetIn_onClick
		});
		ui.hitcircles[ui.hitcircles.length-1].onMouseOut();
	}

	ui.hitcircles.push({
		e:game.solarSystem.star,
		r:Math.max(game.solarSystem.star.radius_outer,vars.misc.min_interaction_radius),
		onMouseOver:star_onMouseOver,
		onMouseOut:star_onMouseOut,
		onClick:starOut_onClick
	});
	ui.hitcircles[ui.hitcircles.length-1].onMouseOut();

	game.views.current = game.views.SOLAR;
	descriptions.solarSystem = descriptions.getSolarSystemDescription(game.solarSystem);
}
function galacticSystem_initInteraction(){
	console.log('switching to galactic system view');
	ui.hitcircles=[];
	for(var i=0;i < game.galacticSystem.stars.length;++i){
		var star=game.galacticSystem.stars[i];

		ui.hitcircles.push({
			e:star,
			r:Math.max(star.radius_outer,vars.misc.min_interaction_radius),
			onMouseOver:star_onMouseOver,
			onMouseOut:star_onMouseOut,
			onClick:starIn_onClick
		});
		ui.hitcircles[ui.hitcircles.length-1].onMouseOut();
	}
// hitcircle stuff
	game.views.current = game.views.GALAXY;
	descriptions.galaxy = descriptions.getGalaxyDescription(game.galacticSystem);
}