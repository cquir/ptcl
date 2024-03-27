uniform sampler2D computeTexture;
uniform float dt;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  if (gl_FragCoord.y < 1.0) {

    // IF WE ARE OUTPUTING POSITION

    vec2 vel_uv = vec2(uv.x, (gl_FragCoord.y + 1.0) / resolution.y);
    vec3 ptcl_vel = texture2D( computeTexture, vel_uv ).xyz;
    vec3 ptcl_pos = texture2D( computeTexture, uv ).xyz;

    ptcl_pos += ptcl_vel * dt;

    if (ptcl_pos.y < -10.0) {
      ptcl_pos = vec3(0.0,0.0,0.0);
    }

    gl_FragColor = vec4( ptcl_pos , 0.0 );

  } else if (gl_FragCoord.y < 2.0) {

    // IF WE ARE OUTPUTING VELOCITY

    vec2 acc_uv = vec2(uv.x, (gl_FragCoord.y + 1.0) / resolution.y);

    vec3 ptcl_acc = texture2D( computeTexture, acc_uv ).xyz;
    vec3 ptcl_vec = texture2D( computeTexture, uv ).xyz;

    ptcl_vec += ptcl_acc * dt;

    if (ptcl_vec.y < -10.0) {
      ptcl_vec = vec3((sin(dt) -0.5) * 5.0,5.0,0.0);
    }
    
    gl_FragColor = vec4(ptcl_vec.x, ptcl_vec.y, ptcl_vec.z, 11.0);

  } else {

    // assume acceleration is constant / initialized and never change
    // - simplifies initial implementation

    gl_FragColor = texture2D( computeTexture, uv );

  }

}
