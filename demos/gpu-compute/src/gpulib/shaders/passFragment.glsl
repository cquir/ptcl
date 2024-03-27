uniform sampler2D passThruTexture;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 sampled = texture2D( passThruTexture, uv );
  
  gl_FragColor = sampled;

}
