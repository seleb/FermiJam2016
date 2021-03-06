var vars={
	range:{
		planet_radius:[2,20], // doesn't include "big" planets, always +0.5
		planet_rotation_speed:[10,3000], // (positive only, flipped in different step)

		star_radius_inner:[1,5],
		star_radius_outer:[3,6], // added to star_radius_inner
		star_points:[2,16], // affected by pointType
		star_num_planets:[0,20],
		star_rotation_speed:[1000,6000], // (positive only, flipped in different step)

		galaxy_radius:[200,250],
		galaxy_arms:[2,8],
		galaxy_curve:[0.2,6], // (positive only, flipped in different step)
		galaxy_num_stars:[16,32],
		galaxy_rotation_speed:[4000,8000], // (positive only, flipped in different step)

		orbit_radius:[10,150], // added to star_radius_outer and planet_radius
		orbit_rotation_speed:[1000,6000], // (positive only, flipped in different step)
		orbit_elliptical_scale:[1,2],
		orbit_elliptical_rotation:[-0.5,0.5]
	},
	chance:{
		galaxy_reverse_orbit:0.5,

		star_reverse_orbit:0.25,
		star_round:0.1,
		star_gear:0.1,

		orbit_elliptical:0.5,

		planet_reverse_orbit:0.01,
		planet_big:0.05,

		target_star:0.25
	},
	misc:{
		ui_scale:20,
		stroke_width:1,

		transition_speed:1/240,

		min_interaction_radius:25,
		dash:[3,5], // dash, dash+gap

		planet_zoom:5,
		star_zoom:5,

		planet_big_thresh:0.75, // percentage of planet_radius[1]
		planet_big_mult:2,

		target_timer:5000,
		target_delay:4000
	}
};