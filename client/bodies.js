function renderGalaxy(_galaxy){
	_galaxy.clear();

	for(var a=0; a<_galaxy.arms.length; ++a){ 
		_galaxy.lineStyle(1,palette.color2);
		_galaxy.moveTo(0,0);
		for(var i = 0; i < _galaxy.arms[a].length; ++i){
			var p=_galaxy.arms[a][i];
			_galaxy.lineTo(p[0],p[1]);
		}
		_galaxy.endFill();
	}
}

function renderStar(_graphics,_points,_pointType,_radiusInner,_radiusOuter,_filled){
	_graphics.clear();
	_graphics.beginFill(_filled ? palette.color2 : palette.color1);
	if(!_filled){
		_graphics.lineStyle(1,palette.color2);
	}
	_graphics.moveTo(_radiusInner,0);
	for(var i=1; i<=_points;++i){
		var a=i/_points*Math.PI*2;
		var r = i%_pointType==0 ? _radiusInner : _radiusOuter;
		_graphics.lineTo(r*Math.cos(a),r*Math.sin(a));
	}
	_graphics.endFill();
}


function renderPlanet(_graphics,_radius,_filled){
	_graphics.clear();
	_graphics.beginFill(_filled ? palette.color2 : palette.color1);
	if(!_filled){
		_graphics.lineStyle(1,palette.color2);
	}
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
		if(skip<vars.misc.dash[0]){
			_graphics.lineStyle(1,palette.color2,1);
			_graphics.moveTo(_radius*Math.cos(a1),_radius*Math.sin(a1));
			_graphics.lineTo(_radius*Math.cos(a2),_radius*Math.sin(a2));
			_graphics.endFill();
		}else if(skip>=vars.misc.dash[1]){
			skip=0;
		}
		a1=a2;
	}
};

function getGalacticSystem(_seed){
	var rng = new MersenneTwister(_seed);

	var galacticSystem=new PIXI.Container();
	galacticSystem.seed=rng.int();
	galacticSystem.orbitDir=rng.real() > vars.chance.galaxy_reverse_orbit ? -1 : 1;
	galacticSystem.center=new PIXI.Graphics();
	galacticSystem.center.rotationSpeed=range(rng, vars.range.galaxy_rotation_speed)*galacticSystem.orbitDir;
	galacticSystem.center.r=range(rng, vars.range.galaxy_radius);
	galacticSystem.center.curve=range(rng, vars.range.galaxy_curve);


	// setup arms + possible star positions
	
	galacticSystem.center.arms=new Array(Math.round(range(rng, vars.range.galaxy_arms)));
	galacticSystem.center.starPoints=[];
	var segments=galacticSystem.center.r*galacticSystem.center.curve/10;
	for(var a=0; a<galacticSystem.center.arms.length; ++a){
		galacticSystem.center.arms[a]=[];
		var r=0;
		var angle=a/galacticSystem.center.arms.length*Math.PI*2;
		for(var i = 1; i <= segments; ++i){
			r=i/segments;
			angle+=galacticSystem.center.curve/segments*(-galacticSystem.orbitDir);
			var p=[Math.cos(angle)*r*galacticSystem.center.r,Math.sin(angle)*r*galacticSystem.center.r];
			galacticSystem.center.arms[a].push(p);
			if(i > 2){
				// ignore first couple points because they're too close to the center
				galacticSystem.center.starPoints.push(p);
			}
		}
	}



	renderGalaxy(galacticSystem.center,galacticSystem.center.r,galacticSystem.center.arms,galacticSystem.center.curve);

	// setup orbits
	galacticSystem.stars=[];
	var numStars=Math.min(range(rng, vars.range.galaxy_num_stars), galacticSystem.center.starPoints.length);
	for(var i=0; i < numStars; ++i){
		var star = new PIXI.Graphics();

		// star type
		star.pointType=2;
		if(rng.real() < vars.chance.star_round){
			star.pointType=1;
		}if(rng.real() < vars.chance.star_gear){
			star.pointType=4;
		}

		star.points=Math.round(range(rng,vars.range.star_points))*star.pointType;
		star.radius_inner=range(rng,vars.range.star_radius_inner);
		star.radius_outer=star.radius_inner+range(rng,vars.range.star_radius_outer);
		star.rotationSpeed=range(rng,vars.range.star_rotation_speed)*galacticSystem.orbitDir;
		if(rng.real() < vars.chance.star_reverse_orbit){
			star.rotationSpeed*=-1;
		}

		star.seed=rng.int();
		star.a=rng.real()*Math.PI*2;

		var p=rng.int()%galacticSystem.center.starPoints.length; // random point somewhere on the galaxy arms

		star.position.x=galacticSystem.center.starPoints[p][0];
		star.position.y=galacticSystem.center.starPoints[p][1];

		galacticSystem.center.starPoints.splice(p,1);

		galacticSystem.stars.push(star);
	}

	// add to scene
	for(var i=0; i < galacticSystem.stars.length; ++i){
		galacticSystem.center.addChild(galacticSystem.stars[i]);
	}

	galacticSystem.addChild(galacticSystem.center);

	return galacticSystem;
}

function getSolarSystem(_star){
	var rng = new MersenneTwister(_star.seed);

	var solarSystem=new PIXI.Container();
	solarSystem.seed=_star.seed;
	solarSystem.orbitDir=_star.rotationSpeed < 0 ? -1 : 1;
	solarSystem.center=new PIXI.Container();
	solarSystem.planets=new PIXI.Container();

	// star
	solarSystem.star=new PIXI.Graphics();
	solarSystem.star.rotationSpeed=_star.rotationSpeed;
	solarSystem.center.addChild(solarSystem.star);

	solarSystem.star.pointType=_star.pointType;
	solarSystem.star.points=_star.points;
	solarSystem.star.radius_inner=_star.radius_inner*vars.misc.star_zoom;
	solarSystem.star.radius_outer=_star.radius_outer*vars.misc.star_zoom;

	// setup orbits
	solarSystem.orbits=[];
	for(var i=0; i < range(rng, vars.range.star_num_planets); ++i){
		var container=new PIXI.Container();
		var orbit = new PIXI.Graphics();

		// planet
		orbit.planet=new PIXI.Graphics();
		orbit.planet.r=Math.round(range(rng,vars.range.planet_radius))+0.5;

		// big planet
		if(orbit.planet.r > vars.range.planet_radius[1]*vars.misc.planet_big_thresh && rng.real() < vars.chance.planet_big){
			orbit.planet.r*=vars.misc.planet_big_mult;
		}

		orbit.planet.seed=rng.int();

		orbit.r=range(rng, vars.range.orbit_radius)+solarSystem.star.radius_outer+orbit.planet.r;
		orbit.rotationSpeed=range(rng,vars.range.orbit_rotation_speed)*solarSystem.orbitDir;

		// reverse orbit
		if(rng.real() < vars.chance.planet_reverse_orbit){
			orbit.rotationSpeed*=-1;
		}

		// elliptical orbit
		if(rng.real() > vars.chance.orbit_elliptical){
			container.scale.x=range(rng, vars.range.orbit_elliptical_scale);
			container.rotation=range(rng, vars.range.orbit_elliptical_rotation);
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

	solarSystem.addChild(solarSystem.center);
	solarSystem.addChild(solarSystem.planets);

	return solarSystem;
}


function getPlanetarySystem(_planet){
	var rng = new MersenneTwister(_planet.seed);

	var planetarySystem=new PIXI.Container();
	planetarySystem.seed=_planet.seed;
	planetarySystem.planet=new PIXI.Graphics();
	planetarySystem.planet.r=_planet.r*vars.misc.planet_zoom;

	planetarySystem.addChild(planetarySystem.planet);

	return planetarySystem;
}
