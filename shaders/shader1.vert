#define TWOPI 6.28318530718
#define KE 8.988e9

const float MAX_VECTOR_SIZE = 0.25;
const int MAX_CHARGES = 20;

attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

uniform int numCharges;
uniform vec2 uPosition[MAX_CHARGES];
uniform float uChargeValue[MAX_CHARGES];

varying vec4 glColor;

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f){
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

void main() {
    if (vPosition.z == 1.0) { // Moveable
        vec2 final_electric_field = vec2(0.0, 0.0);
        for (int i=0; i<MAX_CHARGES; i++) {
            if (i >= numCharges) // Don't draw more charges if they have exceeded the total number of charges.
                break;
            vec2 charge_position = uPosition[i];

            vec2 vector = vec2(vPosition) - charge_position; // A vector pointing from the charge to the point

            float modulus = sqrt(vector.x*vector.x + vector.y*vector.y); // The modulus of the vector from above
            
            vec2 unit_vector = (1.0/modulus) * vector; // The unit vector from the vector 'vector'

            // Calculates the electical field as a vector using the above unit vector and the electric field expression
            vec2 electric_field = unit_vector * (KE * uChargeValue[i])/(pow(modulus, 2.0)); 

            // Adds the electric field vector to the final electric field vector
            final_electric_field += vec2(electric_field.x, electric_field.y);
        }

        float final_modulus = sqrt(pow(final_electric_field.x, 2.0) + pow(final_electric_field.y, 2.0));
        if (final_modulus > MAX_VECTOR_SIZE) {
            // the maximum modulus of the vector should be 5 grid squares (0.25 for 0.05 grid_spacing)
            final_electric_field = final_electric_field * MAX_VECTOR_SIZE/final_modulus;
        }
            
        glColor = colorize(final_electric_field);
        gl_Position = vec4(vPosition.x + final_electric_field.x, vPosition.y + final_electric_field.y, 0.0, 1.0) / vec4(table_width/2.0, table_height/2.0, 1.0, 1.0);
    
    } else { // Fixed 
        glColor = vec4(0.0, 0.0, 0.0, 1.0);
        gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1.0, 1.0);
    }
}
