precision highp float;

varying float polarity;

void main() {
    if(gl_PointCoord.x > 0.5){
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    } else {
        discard;
    }
}
