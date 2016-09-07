var startTime=0;
var lastTime=0;
var curTime=0;

var game = new PIXI.Container();
var scene = new PIXI.Container();

var resizeTimeout=null;

var scale=12;

var mouse={
	pos:[0,0]
};

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
		game.messages.scrollOffset = clamp(0,game.messages.scrollOffset,game.messages.messages.length-game.messages.displaySize);
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

	//Howler.mute();

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
		fontFamily: 'gamefont',
		fontSize:scale,
		fill : palette.color2,
		dropShadow : false,
		wordWrap : false
	};

	function makeButton(_text){
		var g = new PIXI.Graphics();

		var t = new PIXI.Text(_text, textStyle);
		g.addChild(t);
		t.position.y=scale/2;
		t.position.x=scale*5-_text.length*scale/3.4;

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

	function btn_onMouseOver(){
		this.e.clear();
		this.e.beginFill(palette.color2);
		this.e.lineStyle(1, palette.color2, 1);
		this.e.drawRect(0,0,scale*10,scale*2);
		this.e.endFill();
		this.e.text.style.fill=palette.color1;
	};
	function btn_onMouseOut(){
		this.e.clear();
		this.e.beginFill(palette.color1);
		this.e.lineStyle(1, palette.color2, 1);
		this.e.drawRect(0,0,scale*10,scale*2);
		this.e.endFill();
		this.e.text.style.fill=palette.color2;
	};

	ui.hitboxes.push({
		e:btnExplore,
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(){
			postMessage(Date.now()+this.e.toString());
			sounds["tick"].play();
		}
	});

	ui.hitboxes.push({
		e:btnExpand,
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(){
			postMessage(Date.now()+this.e.toString());
			sounds["tick"].play();
		}
	});
	ui.hitboxes.push({
		e:btnExploit,
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(){
			postMessage(Date.now()+this.e.toString());
			sounds["tick"].play();
		}
	});
	ui.hitboxes.push({
		e:btnExterminate,
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(){
			postMessage(Date.now()+this.e.toString());
			sounds["tick"].play();
		}
	});

	ui.hitboxes.push({
		e:btnOptions,
		w:scale*2,
		h:scale*2,
		onMouseOver:function(){
			this.e.clear();
			this.e.beginFill(palette.color2);
			this.e.lineStyle(1, palette.color2, 1);
			this.e.drawRect(0,0,scale*2,scale*2);
			this.e.endFill();
		},
		onMouseOut:function(){
			this.e.clear();
			this.e.beginFill(palette.color1);
			this.e.lineStyle(1, palette.color2, 1);
			this.e.drawRect(0,0,scale*2,scale*2);
			this.e.endFill();
		},
		onClick:function(){
			toggleFullscreen();
		}
	});

	for(var i=ui.hitboxes.length-5;i<ui.hitboxes.length;++i){
		ui.hitboxes[i].onMouseOut();
	}
	
	ui.addToLayout(btnExplore,true,false,scale,-scale*3);
	ui.addToLayout(btnExpand,true,false,scale*12,-scale*3);
	ui.addToLayout(btnExploit,true,false,scale*23,-scale*3);
	ui.addToLayout(btnExterminate,true,false,scale*34,-scale*3);
	ui.addToLayout(btnOptions,false,false,-scale*3,-scale*3);


	var rng = new MersenneTwister(startTime);

	// ORBIT SETUP
	game.solarSystem=new PIXI.Container();
	game.solarSystem.orbitDir=rng.real() > 0.5 ? -1 : 1;
	game.solarSystem.center=new PIXI.Container();

	// star
	game.solarSystem.star=new PIXI.Graphics();
	game.solarSystem.star.rotationSpeed=(rng.real()*5000+1000)*game.solarSystem.orbitDir;
	game.solarSystem.center.addChild(game.solarSystem.star);


	game.solarSystem.star.points=Math.round(rng.real()*8+2)*4;
	game.solarSystem.star.r1=rng.real()*15+5;
	game.solarSystem.star.r2=game.solarSystem.star.r1+rng.real()*15+10;

	// setup orbits
	orbits=[];
	for(var i=0; i < rng.real()*20; ++i){
		var container=new PIXI.Container();
		var orbit = new PIXI.Graphics();
		orbit.r=rng.real()*150+game.solarSystem.star.r2;
		if(rng.real() > 0.5){
			container.scale.x=rng.real()+1;
			container.rotation=rng.real()-0.5;
		}
		container.addChild(orbit);
		game.solarSystem.center.addChild(container);
		orbits.push(orbit);
		orbit.rotationSpeed=(rng.real()*5000+1000)*game.solarSystem.orbitDir;

		// reverse orbit
		if(rng.real() < 0.01){
			orbit.rotationSpeed*=-1;
		}

		renderOrbit(orbit,orbit.r);

		// point on the orbit's radius to give us something to use in toGlobal call later
		orbit.planetPoint=new PIXI.Point(orbit.r,0);
	}

	// setup planets
	game.solarSystem.planets=new PIXI.Container();
	
	function planet_onMouseOver(){
		renderPlanet(this.e, this.e.r, true);
	};
	function planet_onMouseOut(){
		renderPlanet(this.e, this.e.r, false);
	};

	// sort orbits by radius for (more) consistent layering of planets
	// order: inner planets on top of outer planets
	orbits.sort(function(a,b){return b.r - a.r;});

	for(var i=0;i < orbits.length;++i){
		var orbit=orbits[i];
		orbit.planet=new PIXI.Graphics();
		orbit.planet.r=rng.real()*15+3;

		game.solarSystem.planets.addChild(orbit.planet);

		ui.hitcircles.push({
			e:orbit.planet,
			r:Math.max(orbit.planet.r,25),
			onMouseOver:planet_onMouseOver,
			onMouseOut:planet_onMouseOut,
			onClick:function(){
				postMessage("hey it's a planet");
			}
		});
		ui.hitcircles[ui.hitcircles.length-1].onMouseOut();
	}

	ui.hitcircles.push({
		e:game.solarSystem.star,
		r:Math.max(game.solarSystem.star.r2,25),
		onMouseOver:function(){
			renderStar(this.e,this.e.points,this.e.r1,this.e.r2,true);
		},
		onMouseOut:function(){
			renderStar(this.e,this.e.points,this.e.r1,this.e.r2,false);
		},
		onClick:function(){
			postMessage("hey it's a star");
		}
	});
	ui.hitcircles[ui.hitcircles.length-1].onMouseOut();





	// MESSAGE SETUP

	game.messages={
		messages:[],
		messageBox:new PIXI.Graphics(),
		scrollOffset:0,
		bufferSize:20,
		displaySize:8
	};
	game.messages.messageBox.update=function(){
		var self=game.messages.messageBox;
		self.clear();
		
		// draw message box
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(0,0,scale*43,scale*game.messages.displaySize);
		self.endFill();

		// draw scrollbar thumb
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(scale*42,scale*(game.messages.displaySize-1)*(1-(game.messages.scrollOffset)/(game.messages.messages.length-game.messages.displaySize)),scale,scale);
		self.endFill();

		// line separating scrollbar from message area
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.moveTo(scale*42,scale*game.messages.displaySize);
		self.lineTo(scale*42,0);
		self.endFill();



		for(var i=0; i<game.messages.messages.length;++i){
			var o=i-game.messages.scrollOffset;
			if(o >= 0 && o < game.messages.displaySize){
				game.messages.messages[i].position.y=scale*(game.messages.displaySize-o);
				game.messages.messages[i].visible=true;
			}else{
				game.messages.messages[i].visible=false;
			}
		}
	};
	ui.addToLayout(game.messages.messageBox,true,false,scale,-scale*(game.messages.displaySize+4));
	// some test messages


	var textArray = [].concat(
		postMessage("This is a single line."),
		postMessage("This is two lines in one.\nHere's the other one."),
		postMessage("This is a long paragraph that probably shouldn't fit in a single line and will wrap around instead. In fact, it's so long that it should take up at least three lines on its own."),
		postMessage("..."),
		postMessage("So hey, how's your day going?")
	);





	// SCENE HIERARCHY SETUP

	game.solarSystem.addChild(game.solarSystem.center);
	game.solarSystem.addChild(game.solarSystem.planets);
	game.addChild(game.solarSystem);
	
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

	game.solarSystem.star.rotation=curTime/game.solarSystem.star.rotationSpeed;
	game.solarSystem.position.x=size[0]*2/3;
	game.solarSystem.position.x+=Math.sin(curTime/2000)*50;
	game.solarSystem.position.y=(size[1]-(scale*game.messages.displaySize+2))/2;
	for(var i=0;i < orbits.length;++i){
		var orbit=orbits[i];

		//
		orbit.rotation=curTime/orbit.rotationSpeed;
		
		// reposition planet on orbit
		orbit.planet.position = orbit.toGlobal(orbit.planetPoint);
		orbit.planet.position.x-=game.solarSystem.position.x;
		orbit.planet.position.y-=game.solarSystem.position.y;
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
	_str="//";
	while(words.length > 0){
		if(_str.length + words[0].length+1 > scale*5.5){
			lines.unshift(_str);
			_str="//";
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
	while(lines.length > 0){
		_str=lines[0];
		var t = new PIXI.Text(_str, textStyle);
		t.position.y=scale*(4+lines.length);
		t.position.x=scale;
		t.anchor.y=1;

		lines=lines.slice(1);
		res.push(t);
		game.messages.messageBox.addChild(t);
	}

	game.messages.messages=res.concat(game.messages.messages);

	while(game.messages.messages.length > game.messages.bufferSize){
		game.messages.messageBox.removeChild(game.messages.messages.pop());
	}

	return res;
}