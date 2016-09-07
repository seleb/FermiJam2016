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



function getSolarSystem(_seed){
	var rng = new MersenneTwister(_seed);

	var solarSystem=new PIXI.Container();
	solarSystem.orbitDir=rng.real() > 0.5 ? -1 : 1;
	solarSystem.center=new PIXI.Container();
	solarSystem.planets=new PIXI.Container();

	// star
	solarSystem.star=new PIXI.Graphics();
	solarSystem.star.rotationSpeed=(rng.real()*5000+1000)*solarSystem.orbitDir;
	solarSystem.center.addChild(solarSystem.star);


	solarSystem.star.points=Math.round(rng.real()*8+2)*4;
	solarSystem.star.r1=rng.real()*15+5;
	solarSystem.star.r2=solarSystem.star.r1+rng.real()*15+10;

	// setup orbits
	solarSystem.orbits=[];
	for(var i=0; i < rng.real()*20; ++i){
		var container=new PIXI.Container();
		var orbit = new PIXI.Graphics();

		// planet
		orbit.planet=new PIXI.Graphics();
		orbit.planet.r=Math.round(rng.real()*15+2)+0.5;

		// big planet
		if(orbit.planet.r > 15 && rng.real() < 0.05){
			orbit.planet.r*=2;
		}

		orbit.planet.seed=rng.int();

		orbit.r=rng.real()*150+solarSystem.star.r2+orbit.planet.r;
		orbit.rotationSpeed=(rng.real()*5000+1000)*solarSystem.orbitDir;

		// reverse orbit
		if(rng.real() < 0.01){
			orbit.rotationSpeed*=-1;
		}

		// elliptical orbit
		if(rng.real() > 0.5){
			container.scale.x=rng.real()+1;
			container.rotation=rng.real()-0.5;
		}

		renderOrbit(orbit,orbit.r);

		// point on the orbit's radius to give us something to use in toGlobal call later
		orbit.planetPoint=new PIXI.Point(orbit.r,0);

		solarSystem.planets.addChild(orbit.planet);

		// add to scene
		solarSystem.orbits.push(orbit);
		solarSystem.center.addChild(container);
		container.addChild(orbit);
	}

	// sort orbits by radius for (more) consistent layering of planets
	// order: inner planets on top of outer planets
	solarSystem.orbits.sort(function(a,b){return b.r - a.r;});


	return solarSystem;
}


function getPlanetarySystem(_planet){
	var rng = new MersenneTwister(_planet.seed);

	var planetarySystem=new PIXI.Container();

	planetarySystem.planet=new PIXI.Graphics();
	planetarySystem.planet.r=_planet.r*5;

	planetarySystem.addChild(planetarySystem.planet);

	return planetarySystem;
}