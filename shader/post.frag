#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D tDiffuse;
uniform sampler2D textuer;
uniform float time;
uniform float distortion;
uniform float distortion2;
uniform float distortion3;
uniform float colorNoise;
uniform float speed;
uniform float scrollSpeed;
uniform vec2 resolution;
varying vec2 vUv;
const float size = 40.0;      // モザイク模様ひとつあたりのサイズ


//シンプレックスノイズ
//https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0,
        0.366025403784439, // 0.5*(sqrt(3.0)-1.0),
        -0.577350269189626, // -1.0 + 2.0 * C.x,
        0.024390243902439); // 1.0 / 41.0,
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    // Avoid truncation effects in permutation,
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

void main() {
    //背景のグラデーション
    vec2 pos = (gl_FragCoord.st * 2.0 - resolution.xy)/ min(resolution.x,resolution.y);
    float pl = (1.0 - length(pos)) * 0.3;

    //ブロックノイズを作る
    vec2 texCoord = floor(gl_FragCoord.st / size) * size;
    vec2 texCoord2x = floor(gl_FragCoord.st / (size * 2.0)) * (size * 2.0);

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 bnoise = texture2D(tDiffuse, vec2(texCoord.x,texCoord.y) / resolution);
    vec4 bnoise2 = texture2D(tDiffuse, vec2(texCoord2x.x,texCoord2x.y) / resolution);


    //ブロックノイズ用オフセット
    float offset2 = (bnoise.r + bnoise.g + bnoise.b)/3.0;
    offset2 =  offset2 * distortion3 * 0.1;
   
    vec2 p = vUv;

    float y = p.y + time * speed;

    float n = snoise(vec2(y,0.0));
    float offset = snoise(vec2(y,0.0));

    offset = offset * distortion * 0.005;
    offset += snoise(vec2(y * 50.0,0.0)) * 0.01 * distortion2;

    //走査線
    float scanLine = abs(sin(p.y * 400.0 + mod(time, 10.0) * 5.0)) * 0.2 + 0.8;

    //UV座標  
    vec2 u = vec2(fract(p.x + offset + offset2),fract(p.y + offset2 + mod(time, 10.0) * scrollSpeed * 0.3));

    vec4 color = vec4(1.0);
    color.r = texture2D(textuer, u + vec2(0.01 * distortion2,0.0)).r;
    color.g = texture2D(textuer, u + vec2(-0.01 * distortion2,0.0)).g;
    color.b = texture2D(textuer, u + vec2(0.0,0.0)).b;

    //色を反転
    vec4 color2 = 1.0 - color   ;
    float s = step(0.0025,sin(bnoise2.r * colorNoise));

    if(s <= 0.0){
        color.r = texture2D(textuer, u + vec2(0.01 * distortion2,0.0)).b;
        color.g = texture2D(textuer, u + vec2(-0.01 * distortion2,0.0)).g;
        color.b = texture2D(textuer, u + vec2(0.0,0.0)).r;
    }

    gl_FragColor = color * scanLine + pl;
    //gl_FragColor =vec4(vec3(scanLine2),1.0);

    //gl_FragColor = texture2D(textuer,vUv);

}