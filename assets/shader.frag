precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
//uniform float time;

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);
	//fg.r+=sin(time);
	fg.a=1;
	gl_FragColor = fg;
}