
#define TWOPI 6.28318530718

const int MAX_CHARGES = 20;

attribute vec3 vPosition;

uniform float table_width;
uniform float table_height;

uniform vec2 uPosition[MAX_CHARGES];

varying vec4 glColor;

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

bool vecEquals(vec4 v1, vec4 v2) {
    bvec4 e = equal(v1, v2);
    for(int i=0; i<4; i++) {
        if (e[i] == false)
            return false;
    }
    return true;
}

void main()
{
    if (vPosition.z == 1.0) { // Moveable
        glColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_Position = (vec4(vPosition.x, vPosition.y, 0.0, 1.0) + vec4(0.02, 0.03, 0.0, 0.0)) / vec4(table_width, table_height, 1.0, 1.0);
    } else {
        glColor = vec4(0.0, 1.0, 0.0, 1.0);
        gl_Position = vec4(vPosition.x, vPosition.y, 0.0, 1.0) / vec4(table_width, table_height, 1.0, 1.0);
    }
    gl_PointSize = 4.0;
    
}
