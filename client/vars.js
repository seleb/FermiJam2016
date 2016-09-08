var vars={
	range:{
		planet_radius:[2,20], // doesn't include "big" planets, always +0.5
		star_radius_inner:[1,5],
		star_radius_outer:[3,6], // added to star_radius_inner
		star_points:[2,16], // affected by pointType
		star_num_planets:[0,20],

		galaxy_radius:[250,300],
		galaxy_arms:[2,8],
		galaxy_curve:[1,6],

		orbit_radius:[10,150] // added to star_radius_outer and planet_radius
	},
	chance:{
		star_reverse_orbit:0.25,
		star_round:0.1,
		star_gear:0.1,

		planet_reverse_orbit:0.01,
		planet_big:0.05,

		life_any:0.5,
		life_flora:0.5,
		life_fauna:0.5,
		life_basic:0.5,
		life_developing:0.5,
		life_intelligent:0.5

	},
	misc:{
		planet_zoom:5,
		star_zoom:5,

		planet_big_thresh:0.75, // percentage of planet_radius[1]
		planet_big_mult:2
	}
};