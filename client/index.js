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
	

	addToLayout:function(_ui,_fromLeft,_fromTop,_x,_y){
		this.layoutElements.push({
			ui: _ui,
			from:[_fromLeft,_fromTop],
			pos:[_x,_y]
		});
		layoutUI(this.layoutElements.length-1);
	},


	update:function(){
		for(var i=0; i < ui.layoutElements.length; ++i){
			var u=ui.layoutElements[i];
			u.ui.update();
		}
	}
};


var sounds=[];

$(document).ready(function(){
	$(document).on("mousemove",function(event){
		mouse.pos=[event.clientX,event.clientY];
		var prevElement = ui.currentElement;
		ui.currentElement=null;
		for(var i=0; i < ui.layoutElements.length; ++i){
			var u=ui.layoutElements[i];
			if(u.ui.interaction){
				if(
					mouse.pos[0] >= u.ui.position.x &&
					mouse.pos[1] >= u.ui.position.y &&
					mouse.pos[0] <= u.ui.position.x+u.ui.interaction.w &&
					mouse.pos[1] <= u.ui.position.y*u.ui.interaction.h
				){
					ui.currentElement=u.ui;
				}
			}
		}

		if(prevElement!=ui.currentElement){
			if(prevElement!=null){
				prevElement.interaction.onMouseOut(prevElement);
			}if(ui.currentElement!=null){
				ui.currentElement.interaction.onMouseOver(ui.currentElement);
			}
		}

		if(ui.currentElement!=null){
			document.body.style.cursor = 'pointer';
		}else{
			document.body.style.cursor = 'auto';
		}
	});

	$(document).on("mousewheel DOMMouseScroll",function(event){
		event=event.originalEvent;
		var delta=event.detail||-event.wheelDelta;
		game.messages.scrollOffset += delta > 0 ? -1 : 1;
		game.messages.scrollOffset = clamp(0,game.messages.scrollOffset,game.messages.messages.length-game.messages.displaySize);
	});


	$(document).on("click",function(event){
		if(ui.currentElement!=null){
			ui.currentElement.interaction.onClick(ui.currentElement);
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
			roundPixels:true}
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


	//$("#canvas-overlay pre").append("\n"+Math.round(loader.progress)+"%...");
}

function setup(){
	// called when loader completes
	console.log("All files loaded");


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

	var btnExplore=makeButton("explore");
	var btnExpand=makeButton("expand");
	var btnExploit=makeButton("exploit");
	var btnExterminate=makeButton("exterminate");
	

	function btn_onMouseOver(self){
		self.clear();
		self.beginFill(palette.color2);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(0,0,scale*10,scale*2);
		self.endFill();
		self.text.style.fill=palette.color1;
	};
	function btn_onMouseOut(self){
		self.clear();
		self.beginFill(palette.color1);
		self.lineStyle(1, palette.color2, 1);
		self.drawRect(0,0,scale*10,scale*2);
		self.endFill();
		self.text.style.fill=palette.color2;
	};

	btnExplore.interaction={
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(self){
			postMessage(Date.now()+self.toString());
			sounds["tick"].play();
		}
	};
	btnExpand.interaction={
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(self){
			postMessage(Date.now()+self.toString());
			sounds["tick"].play();
		}
	};
	btnExploit.interaction={
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(self){
			postMessage(Date.now()+self.toString());
			sounds["tick"].play();
		}
	};
	btnExterminate.interaction={
		w:scale*10,
		h:scale*2,
		onMouseOver:btn_onMouseOver,
		onMouseOut:btn_onMouseOut,
		onClick:function(self){
			postMessage(Date.now()+self.toString());
			sounds["tick"].play();
		}
	};

	btnExplore.interaction.onMouseOut(btnExplore);
	btnExpand.interaction.onMouseOut(btnExpand);
	btnExploit.interaction.onMouseOut(btnExploit);
	btnExterminate.interaction.onMouseOut(btnExterminate);

	var btnOptions= new PIXI.Graphics();
	btnOptions.update=function(){
	};

	btnOptions.interaction={
		w:scale*2,
		h:scale*2,
		onMouseOver:function(self){
			self.clear();
			self.beginFill(palette.color2);
			self.lineStyle(1, palette.color2, 1);
			self.drawRect(0,0,scale*2,scale*2);
			self.endFill();
		},
		onMouseOut:function(self){
			self.clear();
			self.beginFill(palette.color1);
			self.lineStyle(1, palette.color2, 1);
			self.drawRect(0,0,scale*2,scale*2);
			self.endFill();
		},
		onClick:function(self){
			toggleFullscreen();
		}
	};
	btnOptions.interaction.onMouseOut(btnOptions);

	game.addChild(btnExplore);
	game.addChild(btnExpand);
	game.addChild(btnExploit);
	game.addChild(btnExterminate);
	game.addChild(btnOptions);
	
	ui.addToLayout(btnExplore,true,false,scale,-scale*3);
	ui.addToLayout(btnExpand,true,false,scale*12,-scale*3);
	ui.addToLayout(btnExploit,true,false,scale*23,-scale*3);
	ui.addToLayout(btnExterminate,true,false,scale*34,-scale*3);
	ui.addToLayout(btnOptions,false,false,-scale*3,-scale*3);


	scene.addChild(game);

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

	game.addChild(game.messages.messageBox);
	ui.addToLayout(game.messages.messageBox,true,false,scale,-scale*(game.messages.displaySize+4));



	var textArray = [].concat(
		postMessage("This is a single line."),
		postMessage("This is two lines in one.\nHere's the other one."),
		postMessage("This is a long paragraph that probably shouldn't fit in a single line and will wrap around instead. In fact, it's so long that it should take up at least three lines on its own."),
		postMessage("..."),
		postMessage("So hey, how's your day going?")
	);

	// shader
	/*var fragmentSrc = PIXI.loader.resources.shader.data;
	filter = new CustomFilter(fragmentSrc);
	renderSprite.filters = [filter];*/


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