function renderStar(_graphics,_points,_radiusInner,_radiusOuter,_filled){
	_graphics.clear();
	_graphics.beginFill(_filled ? palette.color2 : palette.color1);
	_graphics.lineStyle(1,palette.color2,1);
	_graphics.moveTo(_radiusInner,0);
	for(var i=1; i<=_points;++i){
		var a=i/_points*Math.PI*2;
		var r = i%2==0 ? _radiusInner : _radiusOuter;
		_graphics.lineTo(r*Math.cos(a),r*Math.sin(a));
	}
	_graphics.endFill();
}


function renderPlanet(_graphics,_radius,_filled){
	_graphics.clear();
	_graphics.beginFill(_filled ? palette.color2 : palette.color1);
	_graphics.lineStyle(1,palette.color2,1);
	_graphics.drawCircle(0,0,_radius);
	_graphics.endFill();
}


function renderOrbit(_graphics,_radius){
	_graphics.clear();
	var circumference=Math.PI*2*_radius;

	a1=0;
	var skip=0;
	for(var i=0; i<=circumference; i+=1){
		skip+=1;
		var a2=i/circumference*Math.PI*2;
		if(skip<4){
			_graphics.lineStyle(1,palette.color2,1);
			_graphics.moveTo(_radius*Math.cos(a1),_radius*Math.sin(a1));
			_graphics.lineTo(_radius*Math.cos(a2),_radius*Math.sin(a2));
			_graphics.endFill();
		}else if(skip>=6){
			skip=0;
		}
		a1=a2;
	}
};