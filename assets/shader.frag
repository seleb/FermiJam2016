precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 color1;
uniform vec3 color2;

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);
	fg.rgb = mix(color1,color2,fg.r)/255.0;
	gl_FragColor = fg;
}