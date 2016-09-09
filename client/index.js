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
	current:-1,
	a:[
		[[000,000,000],[255,255,255]],
		[[255,255,255],[000,000,000]],
		[[200,200,200],[128,128,128]]
	],
	color1:null,
	color2:null
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
			if(u.e.renderable){
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
	}
};

var sounds=[];

$(document).ready(function(){

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
	renderer.backgroundColor = 0x000000;
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

	PIXI.loader
		.add('shader','assets/shader.frag');

	PIXI.loader
		.on("progress", loadProgressHandler)
		.load(setup);
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
}

function setup(){
	$(document).on("mousemove",function(event){
		mouse.pos=[event.pageX,event.pageY];

		// hide the UI if collapsed and mouse not nearby
		if(!options.expanded){
			var d=btnOptions.position;
			btnOptions.renderable = Math.sqrt(Math.pow(mouse.pos[0]-d.x,2)+Math.pow(mouse.pos[1]-d.y,2)) < vars.misc.ui_scale*10;
		}
	});


	$(document).on("click",function(event){
		if(ui.currentElement!=null){
			ui.currentElement.onClick();
		}
	});
	
	textStyle = {
		fontFamily: 'Courier New, monospace',
		fontSize:vars.misc.ui_scale+'px',
		fill : 0xFFFFFF,
		dropShadow : false,
		wordWrap : false
	};

	var fragmentSrc = PIXI.loader.resources.shader.data;
	filter = new CustomFilter(fragmentSrc);
	renderSprite.filters = [filter];

	// UI SETUP
	options={};
	options.elements=[];
	options.expanded=true;
	btnOptions= new PIXI.Graphics();
	var btnFullscreen= new PIXI.Graphics();
	var btnPalette= new PIXI.Graphics();
	var btnPaths= new PIXI.Graphics();
	var btnReset= new PIXI.Graphics();

	ui.hitboxes.push({
		e:btnOptions,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			drawBox(this.e,true);
			drawChevron(this.e,options.expanded,true);
		},
		onMouseOut:function(){
			this.e.clear();
			drawBox(this.e,false);
			drawChevron(this.e,options.expanded,false);
		},
		onClick:function(){
			options.expanded=!options.expanded;
			this.onMouseOver();
			
			for(var i=0; i < options.elements.length; ++i){
				options.elements[i].renderable = options.expanded;
			}
		}
	});


	ui.hitboxes.push({
		e:btnFullscreen,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			drawBox(this.e,true);
			drawFullscreen(this.e,isFullscreen(),true);
		},
		onMouseOut:function(){
			this.e.clear();
			drawBox(this.e,false);
			drawFullscreen(this.e,isFullscreen(),false);
		},
		onClick:function(){
			toggleFullscreen();
		}
	});



	ui.hitboxes.push({
		e:btnPalette,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			drawBox(this.e,true);
			drawPalette(this.e,palette.current,true);
		},
		onMouseOut:function(){
			this.e.clear();
			drawBox(this.e,false);
			drawPalette(this.e,palette.current,false);
		},
		onClick:function(){
			++palette.current;
			palette.current%=palette.a.length;
			palette.color1=palette.a[palette.current][0];
			palette.color2=palette.a[palette.current][1];


			filter.uniforms.color1 = palette.color1;
			filter.uniforms.color2 = palette.color2;

			document.body.style.backgroundColor="rgb("+palette.color1[0]+","+palette.color1[1]+","+palette.color1[2]+")";

			this.onMouseOver();
		}
	});
	ui.hitboxes[ui.hitboxes.length-1].onClick();


	ui.hitboxes.push({
		e:btnPaths,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			drawBox(this.e,true);
			drawPaths(this.e,true);
		},
		onMouseOut:function(){
			this.e.clear();
			drawBox(this.e,false);
			drawPaths(this.e,false);
		},
		onClick:function(){
			path.visible=!path.visible;
			path.planet.renderable=path.visible;
			path.solar.renderable=path.visible;
			path.galaxy.renderable=path.visible;
		}
	});


	ui.hitboxes.push({
		e:btnReset,
		w:vars.misc.ui_scale*2,
		h:vars.misc.ui_scale*2,
		onMouseOver:function(){
			this.e.clear();
			drawBox(this.e,true);
			drawReset(this.e,true);
		},
		onMouseOut:function(){
			this.e.clear();
			drawBox(this.e,false);
			drawReset(this.e,false);
		},
		onClick:function(){
			window.location.reload(false);
		}
	});

	for(var i=0;i<ui.hitboxes.length;++i){
		ui.hitboxes[i].onMouseOut();
	}
	
	options.elements.push(btnFullscreen);
	options.elements.push(btnPalette);
	options.elements.push(btnPaths);
	options.elements.push(btnReset);

	ui.addToLayout(btnOptions,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*3);
	ui.addToLayout(btnFullscreen,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*6);
	ui.addToLayout(btnPalette,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*9);
	ui.addToLayout(btnPaths,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*12);
	ui.addToLayout(btnReset,false,false,-vars.misc.ui_scale*3,-vars.misc.ui_scale*15);

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



	// SCENE HIERARCHY SETUP

	game.addChild(game.galacticSystem);


	scene.addChild(game);





	galaxy_ship=new PIXI.Graphics();
	galaxy_ship.beginFill(0xFFFFFF);
	galaxy_ship.r=10;
	galaxy_ship.lineStyle(vars.misc.stroke_width,0x000000);
	galaxy_ship.drawCircle(0,0,galaxy_ship.r);
	galaxy_ship.drawCircle(0,0,galaxy_ship.r/2);
	galaxy_ship.endFill();
	galaxy_ship.v=[0,0];
	galaxy_ship.target=null;
	galaxy_ship.position.x=game.galacticSystem.center.r;
	game.galacticSystem.addChild(galaxy_ship);

	solar_ship=new PIXI.Graphics();
	solar_ship.beginFill(0xFFFFFF);
	solar_ship.r=10;
	solar_ship.lineStyle(vars.misc.stroke_width,0x000000);
	solar_ship.drawCircle(0,0,solar_ship.r);
	solar_ship.drawCircle(0,0,solar_ship.r/2);
	solar_ship.endFill();
	solar_ship.v=[0,0];
	solar_ship.target=null;
	solar_ship.position.x=game.galacticSystem.center.r;

	planet_ship=new PIXI.Graphics();
	planet_ship.beginFill(0xFFFFFF);
	planet_ship.r=10;
	planet_ship.lineStyle(vars.misc.stroke_width,0x000000);
	planet_ship.drawCircle(0,0,planet_ship.r);
	planet_ship.drawCircle(0,0,planet_ship.r/2);
	planet_ship.endFill();
	planet_ship.v=[0,0];
	planet_ship.target=null;
	planet_ship.position.x=game.galacticSystem.center.r;

	game.ship=galaxy_ship;

	game.autoPilot=true;
	game.targetTimer=0;


	path={
		visible:true,
		galaxy:new PIXI.Graphics(),
		solar:new PIXI.Graphics(),
		planet:new PIXI.Graphics(),
		points:[]
	};
	game.galacticSystem.addChildAt(path.galaxy,0);
	


	// add UI last
	game.addChild(btnOptions);
	for(var i=0; i < options.elements.length; ++i){
		game.addChild(options.elements[i]);
	}


	// start the main loop
	galacticSystem_initInteraction();
	window.onresize = onResize;
	onResize();
	main();


	// unhide the renderer
	renderer.view.style.display = "block";
}

function main(){
	curTime=Date.now()-startTime;
	deltaTime=curTime-lastTime;

	ui.update();





	// update ship
	
	// get new target
	if(game.autoPilot){
		game.targetTimer-=deltaTime;
		if(game.targetTimer <= 0){
			game.targetTimer=vars.misc.target_timer;
			var rng=new MersenneTwister(curTime);
			var t =ui.hitcircles[rng.int()%ui.hitcircles.length];
			if(game.ship==solar_ship && rng.real() > vars.chance.target_star){
				t=ui.hitcircles[ui.hitcircles.length-1];
			}
			t.onClick();
		}
	}

	var p1=game.ship.toGlobal(new PIXI.Point(0,0));
	var p5=[p1.x-size[0]*(game.views[game.views.current].viewEased+0.5)-offset[0], p1.y-size[1]/2-offset[1]];
	while(path.points.length < 1024 && Math.abs(game.views[game.views.current].view) < 0.5){
		path.points.push([p5,game.ship.v.slice()]);
	}
	var a=[Math.sin(curTime/3000)*Math.cos(curTime/4000)/3,Math.cos(curTime/2000)*Math.sin(curTime/5000)/3];
	if(game.ship.target!=null){
		var p2=game.ship.target.toGlobal(new PIXI.Point(0,0));
		var a2=[p2.x-p1.x,p2.y-p1.y];


		var l=Math.sqrt(a2[0]*a2[0]+a2[1]*a2[1]);
		if(l > 1){
			a2[0]/=l;
			a2[1]/=l;
		}
		a[0]=lerp(a2[0],a[0],game.targetTimer/vars.misc.target_timer);
		a[1]=lerp(a2[1],a[1],game.targetTimer/vars.misc.target_timer);

		if(game.ship.onTarget!=null && l < game.ship.target.r+game.ship.r){
			game.ship.target=null;
			game.ship.onTarget();
			game.ship.onTarget=null;
		}
	}
	game.ship.v[0]+=a[0]/5;
	game.ship.v[1]+=a[1]/5;
	game.ship.v[0]*=0.95;
	game.ship.v[1]*=0.95;
	game.ship.position.x+=game.ship.v[0];
	game.ship.position.y+=game.ship.v[1];


	path.galaxy.clear();
	path.solar.clear();
	path.planet.clear();
	if(path.points.length>0){
		path.galaxy.moveTo(path.points[0][0][0],path.points[0][0][1]);
		path.galaxy.lineStyle(vars.misc.stroke_width,0xFFFFFF);
		path.solar.moveTo(path.points[0][0][0],path.points[0][0][1]);
		path.solar.lineStyle(vars.misc.stroke_width,0xFFFFFF);
		path.planet.moveTo(path.points[0][0][0],path.points[0][0][1]);
		path.planet.lineStyle(vars.misc.stroke_width,0xFFFFFF);
		path.points.shift();
		for(var i = 0; i < path.points.length-1; ++i){
			// smooth points
			path.points[i][0][0]=lerp(path.points[i][0][0], path.points[i+1][0][0], 0.1);
			path.points[i][0][1]=lerp(path.points[i][0][1], path.points[i+1][0][1], 0.1);
			// add velocity
			path.points[i][0][0]+=path.points[i][1][0];
			path.points[i][0][1]+=path.points[i][1][1];
			path.points[i][1][0]*=0.999;
			path.points[i][1][1]*=0.999;
		}

		// draw points
		for(var i = 0; i < path.points.length; ++i){
			var skip = Math.abs(curTime/10)%(i+1) < 64;//path.points[i][2]%10 > 5;
			if(skip){
				path.galaxy.moveTo(path.points[i][0][0],path.points[i][0][1]);
				path.solar.moveTo(path.points[i][0][0],path.points[i][0][1]);
				path.planet.moveTo(path.points[i][0][0],path.points[i][0][1]);
			}else{
				path.galaxy.lineTo(path.points[i][0][0],path.points[i][0][1]);
				path.solar.lineTo(path.points[i][0][0],path.points[i][0][1]);
				path.planet.lineTo(path.points[i][0][0],path.points[i][0][1]);
			}
		}
		path.galaxy.endFill();
		path.solar.endFill();
		path.planet.endFill();
	}








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
			v.position.x=size[0]*1/2 + v.viewEased*size[0] + offset[0];
			v.position.y=size[1]*1/2 + offset[1];
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

	// spin planet
	if(game.planetarySystem!=null){
		game.planetarySystem.planet.rotation=curTime/game.planetarySystem.planet.rotationSpeed;
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


// hover stuff
function drawBox(_graphics,_filled){
	_graphics.beginFill(_filled ? 0xFFFFFF : 0x000000);
	if(!_filled){
		_graphics.lineStyle(vars.misc.stroke_width, 0xFFFFFF, 1);
	}
	_graphics.drawRect(0,0,vars.misc.ui_scale*2,vars.misc.ui_scale*2);
	_graphics.endFill();
}
function drawChevron(_graphics,_flipped,_filled){
	_graphics.lineStyle(vars.misc.stroke_width, _filled ? 0x000000 : 0xFFFFFF, 1);
	if(_flipped){
		_graphics.moveTo(vars.misc.ui_scale*1/2,vars.misc.ui_scale*2-vars.misc.ui_scale*3/2);
		_graphics.lineTo(vars.misc.ui_scale,vars.misc.ui_scale*2-vars.misc.ui_scale*1/2);
		_graphics.lineTo(vars.misc.ui_scale*3/2,vars.misc.ui_scale*2-vars.misc.ui_scale*3/2);
	}else{
		_graphics.moveTo(vars.misc.ui_scale*1/2,vars.misc.ui_scale*3/2);
		_graphics.lineTo(vars.misc.ui_scale,vars.misc.ui_scale*1/2);
		_graphics.lineTo(vars.misc.ui_scale*3/2,vars.misc.ui_scale*3/2);
	}
	_graphics.endFill();
}
function drawFullscreen(_graphics,_fullscreen,_filled){
	_graphics.lineStyle(vars.misc.stroke_width, _filled ? 0x000000 : 0xFFFFFF, 1);
	if(_fullscreen){
		_graphics.moveTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);
	}else{
		_graphics.moveTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*1/4);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*1/4);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);
		_graphics.lineTo(vars.misc.ui_scale*2-vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);

		_graphics.moveTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*2/3);
		_graphics.lineTo(vars.misc.ui_scale*1/4,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);
		_graphics.lineTo(vars.misc.ui_scale*2/3,vars.misc.ui_scale*2-vars.misc.ui_scale*1/4);
	}
	_graphics.endFill();
}
function drawPalette(_graphics,_current,_filled){
	for(var i=0; i < palette.a.length;++i){
		_graphics.beginFill((_filled^i==palette.current) ? 0xFFFFFF : 0x000000);
		_graphics.lineStyle(vars.misc.stroke_width, (_filled^i==palette.current) ? 0x000000 : 0xFFFFFF, 1);
		var a=i/palette.a.length*Math.PI*2;
		_graphics.drawCircle(
			vars.misc.ui_scale+Math.cos(a)*vars.misc.ui_scale/2,
			vars.misc.ui_scale+Math.sin(a)*vars.misc.ui_scale/2,
			vars.misc.ui_scale/3);
		_graphics.endFill();
	}
}
function drawPaths(_graphics,_filled){
	_graphics.beginFill(_filled ? 0xFFFFFF : 0x000000);
	_graphics.lineStyle(vars.misc.stroke_width, _filled ? 0x000000 : 0xFFFFFF, 1);
	_graphics.drawCircle(vars.misc.ui_scale*1.5,vars.misc.ui_scale,vars.misc.ui_scale*1/3);
	_graphics.moveTo(vars.misc.ui_scale/2,vars.misc.ui_scale);
	_graphics.lineTo(vars.misc.ui_scale,vars.misc.ui_scale);
	_graphics.endFill();
}
function drawReset(_graphics,_filled){
	_graphics.beginFill(_filled ? 0xFFFFFF : 0x000000);
	_graphics.lineStyle(vars.misc.stroke_width, _filled ? 0x000000 : 0xFFFFFF, 1);
	_graphics.arc(vars.misc.ui_scale,vars.misc.ui_scale,vars.misc.ui_scale/2, Math.PI*.5/2,Math.PI*3.5/2);
	_graphics.drawCircle(vars.misc.ui_scale+Math.cos(Math.PI*3.5/2)*vars.misc.ui_scale/2,vars.misc.ui_scale+Math.sin(Math.PI*3.5/2)*vars.misc.ui_scale/2,vars.misc.ui_scale/5);
	_graphics.endFill();
}

function btn_onMouseOver(){
	this.e.clear();
	this.e.beginFill(0xFFFFFF);
	this.e.lineStyle(vars.misc.stroke_width, 0xFFFFFF, 1);
	this.e.drawRect(0,0,vars.misc.ui_scale*10,vars.misc.ui_scale*2);
	this.e.endFill();
	this.e.text.style.fill=0x000000;
};
function btn_onMouseOut(){
	this.e.clear();
	this.e.beginFill(0x000000);
	this.e.lineStyle(vars.misc.stroke_width, 0xFFFFFF, 1);
	this.e.drawRect(0,0,vars.misc.ui_scale*10,vars.misc.ui_scale*2);
	this.e.endFill();
	this.e.text.style.fill=0xFFFFFF;
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
function planetIn_onClick(){
	solar_ship.target=this.e;

	solar_ship.onTarget=function(){
		if(game.planetarySystem!==null){
			game.views[game.views.PLANET]=null;
			game.removeChild(game.planetarySystem);
			game.planetarySystem.removeChild(planet_ship);
			game.planetarySystem.removeChild(path.planet);
			game.planetarySystem.destroy();
		}
		game.planetarySystem=getPlanetarySystem(this.e);
		game.addChildAt(game.planetarySystem,0);

		game.solarSystem.viewTarget=-1;
		game.galacticSystem.viewTarget=-2;

		game.planetarySystem.viewTarget=0;
		game.planetarySystem.view=1;
		game.views[game.views.PLANET]=game.planetarySystem;

		planetarySystem_initInteraction();
	}.bind(this);
}

function planetOut_onClick(){
	planet_ship.target=this.e;
	planet_ship.onTarget=function(){
		game.planetarySystem.viewTarget=1;
		game.solarSystem.viewTarget=0;
		game.galacticSystem.viewTarget=-1;

		solarSystem_initInteraction();
	}
}

function starIn_onClick(){
	galaxy_ship.target=this.e;

	galaxy_ship.onTarget=function(){
		if(game.solarSystem!==null){
			game.views[game.views.SOLAR]=null;
			game.removeChild(game.solarSystem);
			game.solarSystem.removeChild(solar_ship);
			game.solarSystem.removeChild(path.solar);
			game.solarSystem.destroy();
		}
		game.solarSystem=getSolarSystem(this.e);
		game.addChildAt(game.solarSystem,0);

		game.galacticSystem.viewTarget=-1;
		if(game.plantarySystem){
			game.plantarySystem.viewTarget=1;
		}

		game.solarSystem.viewTarget=0;
		game.solarSystem.view=1;
		game.views[game.views.SOLAR]=game.solarSystem;

		solarSystem_initInteraction();
	}.bind(this);
}

function starOut_onClick(){
	solar_ship.target=this.e;

	solar_ship.onTarget=function(){
		game.solarSystem.viewTarget=1;
		game.galacticSystem.viewTarget=0;
		if(game.plantarySystem){
			game.plantarySystem.viewTarget=2;
		}
		game.ship=galaxy_ship;

		galacticSystem_initInteraction();
	}.bind(this);
}




// hitcircle stuff

function planetarySystem_initInteraction(){
	planet_ship.v[0]=game.ship.v[0];
	planet_ship.v[1]=game.ship.v[1];
	game.ship=planet_ship;
	game.ship.target=null;
	game.planetarySystem.addChild(planet_ship);
	game.planetarySystem.addChildAt(path.planet,0);
	planet_ship.position.x=game.planetarySystem.planet.r+10;

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
	game.targetTimer=vars.misc.target_delay;
}
function solarSystem_initInteraction(){
	solar_ship.v[0]=game.ship.v[0];
	solar_ship.v[1]=game.ship.v[1];
	game.ship=solar_ship;
	game.ship.target=null;
	game.solarSystem.addChild(solar_ship);
	game.solarSystem.addChildAt(path.solar,0);
	solar_ship.position.x=(game.solarSystem.orbits.length > 0 ? game.solarSystem.orbits[0].r : game.solarSystem.star.radius_outer)+10;

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
	game.targetTimer=vars.misc.target_delay;
}
function galacticSystem_initInteraction(){
	galaxy_ship.v[0]=game.ship.v[0];
	galaxy_ship.v[1]=game.ship.v[1];
	game.ship=galaxy_ship;
	game.ship.target=null;
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
	game.views.current = game.views.GALAXY;
	game.targetTimer=vars.misc.target_delay;
}