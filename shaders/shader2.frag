precision highp float;

varying float polarity;

void main() {
    float distance = sqrt(pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0));

    if (distance <=0.5) {
        if (polarity > 0.0) { // Positive charge
            if ((gl_PointCoord.x > 0.4 && gl_PointCoord.x < 0.6) || (gl_PointCoord.y > 0.4 && gl_PointCoord.y < 0.6)) {
                if ((gl_PointCoord.x < 0.1 || gl_PointCoord.x > 0.9) || (gl_PointCoord.y < 0.1 || gl_PointCoord.y > 0.9)) {
                    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
                } else {
                    discard;
                }
            } else {
                gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            }

        } else { // Negative charge
            if (gl_PointCoord.y > 0.4 && gl_PointCoord.y < 0.6 && gl_PointCoord.x > 0.1 && gl_PointCoord.x < 0.9) {
                discard;
            } else {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        }
        
    } else {
        discard;
    }
    
    
}
