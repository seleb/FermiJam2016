var startTime=0;

var game = new PIXI.Container();
var scene = new PIXI.Container();

var resizeTimeout=null;

var ui={
	elements:[],
	add:function(_ui,_fromLeft,_fromTop,_x,_y){
		this.elements.push({
			ui: _ui,
			from:[_fromLeft,_fromTop],
			pos:[_x,_y]
		});
		layoutUI(this.elements.length-1);
	}
};

$(document).ready(function(){
	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on("mousedown",function(event){
		window.focus();
	});

	// setup game
	startTime=Date.now();

	// create renderer
	size = [1280, 720];
	renderer = PIXI.autoDetectRenderer(
		size[0],size[1],
		{
			antiAlias:true,
			transparent:false,
			resolution:1,
			roundPixels:true}
	);
	renderer.visible=false;
	renderer.backgroundColor = 0x00FFFF;
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


	var textStyle = {
		fontFamily: 'Courier New',
		fontSize:12,
		fill : '#999999',
		dropShadow : false,
		wordWrap : false
	};
	var basicText = new PIXI.Text('Explore', textStyle);

	scene.addChild(game);
	scene.addChild(basicText);

	ui.add(basicText,true,false,12,-12);




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
	setTimeout(function(){
		renderer.view.style.opacity = "1";
	},1000);
}

function main(){
	}if(keys.isJustDown(keys.SPACE)){
	// render
	renderer.render(scene,renderTexture);
	renderer.render(renderContainer);
	requestAnimationFrame(main);
}

function onResize() {
	renderer.view.style.opacity = "0";
	if(resizeTimeout != null){
		window.clearTimeout(resizeTimeout);
	}

	resizeTimeout=window.setTimeout(function(){
		size[0]=$("#display").outerWidth();
		size[1]=$("#display").outerHeight();
		renderer.resize(size[0],size[1]);
		renderer.view.style.width = size[0] + 'px';
		renderer.view.style.height = size[1] + 'px';

		layoutAll();
		renderer.view.style.opacity = "1";

		console.log("Resized",size);
	},500);
}

// lays out all UI elements based on size
function layoutAll(){
	for(var i=0; i < ui.elements.length; ++i){
		layoutUI(i);
	}
}

// lays out UI elements based on size
function layoutUI(_idx){
	var u=ui.elements[_idx];

	u.ui.position.x = (u.from[0] ? 0 : size[0]) + u.pos[0];
	u.ui.position.y = (u.from[1] ? 0 : size[1]) + u.pos[1];

	console.log(u);
}
