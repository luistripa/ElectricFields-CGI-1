#define TWOPI 6.28318530718

const int MAX_CHARGES = 20;
const float KE = 8.988e9;

attribute vec3 vPosition;

uniform float table_width;
uniform float table_height;

uniform vec2 uPosition[MAX_CHARGES];
uniform float chargeValue[MAX_CHARGES];

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

void main()
{
    if (vPosition.z == 1.0) { // Moveable

        vec2 final = vec2(0.0, 0.0);
        for (int j=0; j<MAX_CHARGES; j++) {
            if (uPosition[j] == vec2(0.0, 0.0))
                continue;
            vec2 charge_position = uPosition[j];

            vec2 vector = vec2(vPosition) - charge_position;

            float norma = sqrt(vector.x*vector.x + vector.y*vector.y);    
            
            vec2 unit_vector = (1.0/norma) * vector;

            vec2 electric_field = unit_vector * (KE * 0.000000000001)/(norma*norma);

            final += vec2(electric_field.x, electric_field.y);
        }

        float f = sqrt(final.x*final.x + final.y*final.y);
        if (f > 0.25) {
            final = final * 0.25/f;
        }
            
        glColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_Position = vec4(vPosition.x + final.x, vPosition.y + final.y, 0.0, 1.0) / vec4(table_width, table_height, 1.0, 1.0);
    } else {
        glColor = vec4(0.0, 1.0, 0.0, 1.0);
        gl_Position = vec4(vPosition.x, vPosition.y, 0.0, 1.0) / vec4(table_width, table_height, 1.0, 1.0);
    }
    gl_PointSize = 4.0;
    
}
