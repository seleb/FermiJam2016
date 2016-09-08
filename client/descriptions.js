var planet_descriptions={
	// planet sizes
	"planet_size_small":[
		"This is a [emphasis||de-emphasis||null] [small] [planet].",
		"This [planet] is [emphasis||de-emphasis||null] [small].",
		"In comparison to others, this [planet] is a [small] pebble [orbiting] around a [star]."
	],
	"planet_size_medium":[
		"This is a [de-emphasis||null] [normal]-sized [planet].",
		"This [planet] is [emphasis||de-emphasis||null] [normal]-sized."
	],
	"planet_size_large":[
		"This is a [large] [planet].",
		"This [planet] is [emphasis||de-emphasis||null] [large]."
	],
	"planet_size_extralarge":[
		"This is a [emphasis||de-emphasis||null] [large] [planet].",
		"This [planet] is [emphasis||de-emphasis||null] [large]."
	],

	// planet distances
	"planet_distance_near":[
		"This is [planet] is [emphasis||null] close to the [star] it orbits."
	],
	"planet_distance_medium":[
		"This is [planet] is at a reasonable distance from the [star] it orbits."
	],
	"planet_distance_far":[
		"This is [planet] is far from the [star] it orbits."
	],
	"planet_distance_extrafar":[
		"This is [planet] is [emphasis] far from the [star] it orbits."
	],
};

var words={
	"null":[""],
	"emphasis":[
		"very",
		"noticeably",
		"incredibly",
		"amazingly",
		"overwhelmingly",
		"entirely",
		"genuinely",
		"articulately",
		"provably",
		"frighteningly",
		"really",
		"seriously",
		"honestly",
		"perfectly",
		"unmistakeably",
		"inarguably",
		"unforgettably",
		"awfully",
		"quite",
		"truly",
		"remarkably",
		"particularly",
		"unregrettably",
		"forcefully"
	],
	"de-emphasis":[
		"unremarkably",
		"kind of",
		"sort of",
		"regrettably",
		"underwhelmingly",
		"forgettably",
		"unimpressively"
	],

	"small":[
		"small",
		"tiny",
		"miniscule",
		"underwhelming",
		"unimpressive",
		"miniature"
	],
	"normal":[
		"normal",
		"medium",
		"regular",
		"ordinary"
	],
	"large":[
		"large",
		"huge",
		"humongous",
		"big",
		"massive",
		"giant"
	],

	"orbiting":[
		"orbiting",
		"spinning",
		"floating",
		"travelling",
		"meandering",
		"going"
	],


	"planet":[
		"planet",
		"exoplanet",
		"body",
		"ball of matter",
		"rock",
		"spheroid"
	],
	"star":[
		"star",
		"sun",
		"speck of light",
		"ball of fire",
		"luminous sphere"
	]
};


function replaceWord(str,rng){

	var res="";

	var a=/\[(.*?)\]/g.exec(str);
	var match=a[1];

	var options=match.split("||");
	var option=null;
	if(options.length > 0){
		option=options[Math.round(rng.real()*(options.length-1))];
	}else{
		option=options[0];
	}

	var replacement = words[option][Math.round(rng.real()*(words[option].length-1))];

	res=str.substr(0,a.index - (option=="null"?1:0))+replacement+str.substr(a.index+match.length+2);
	console.log(a);
	console.log(res);
	return res;
}

function replaceWords(str,rng){
	while(str.indexOf("[")>-1){
		str=replaceWord(str,rng);
	}
	return str;
}