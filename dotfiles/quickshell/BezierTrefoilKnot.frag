// yoinked from https://www.shadertoy.com/view/XXs3Rj

#version 440

layout(location = 0) in vec2 fragCoord;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float time;
    vec2 resolution;
} ubuf;

// -----------------------------------------------------------------------------
// Created by Evgenii Davydenko in 2024
//
// With the help of Inigo Quilez:
//      https://www.shadertoy.com/view/ldj3Wh
//      https://www.shadertoy.com/view/MdjGR1
// -----------------------------------------------------------------------------

// #define AA_ENABLED
#define AA_LEVEL 2

#define dot2(x)   dot(x, x)
#define lerp(v0, v1, t)   mix(v0, v1, t)
#define saturate(x)   clamp(x, 0.0, 1.0)

#define REMAP_FORMULA             (v - x0) / (x1 - x0)  * (y1 - y0) + y0
#define REMAPS_FORMULA   saturate((v - x0) / (x1 - x0)) * (y1 - y0) + y0
float remap (float x0, float x1, float y0, float y1, float v) {return REMAP_FORMULA;}
vec2  remap ( vec2 x0,  vec2 x1,  vec2 y0,  vec2 y1,  vec2 v) {return REMAP_FORMULA;}
vec3  remap ( vec3 x0,  vec3 x1,  vec3 y0,  vec3 y1,  vec3 v) {return REMAP_FORMULA;}
vec4  remap ( vec4 x0,  vec4 x1,  vec4 y0,  vec4 y1,  vec4 v) {return REMAP_FORMULA;}
float remaps(float x0, float x1, float y0, float y1, float v) {return REMAPS_FORMULA;}
vec2  remaps( vec2 x0,  vec2 x1,  vec2 y0,  vec2 y1,  vec2 v) {return REMAPS_FORMULA;}
vec3  remaps( vec3 x0,  vec3 x1,  vec3 y0,  vec3 y1,  vec3 v) {return REMAPS_FORMULA;}
vec4  remaps( vec4 x0,  vec4 x1,  vec4 y0,  vec4 y1,  vec4 v) {return REMAPS_FORMULA;}

float linstep (float x0, float x1, float v) {return remap (x0, x1,      0.0 ,      1.0 , v);}
vec2  linstep ( vec2 x0,  vec2 x1,  vec2 v) {return remap (x0, x1, vec2(0.0), vec2(1.0), v);}
vec3  linstep ( vec3 x0,  vec3 x1,  vec3 v) {return remap (x0, x1, vec3(0.0), vec3(1.0), v);}
vec4  linstep ( vec4 x0,  vec4 x1,  vec4 v) {return remap (x0, x1, vec4(0.0), vec4(1.0), v);}
float linsteps(float x0, float x1, float v) {return remaps(x0, x1,      0.0 ,      1.0 , v);}
vec2  linsteps( vec2 x0,  vec2 x1,  vec2 v) {return remaps(x0, x1, vec2(0.0), vec2(1.0), v);}
vec3  linsteps( vec3 x0,  vec3 x1,  vec3 v) {return remaps(x0, x1, vec3(0.0), vec3(1.0), v);}
vec4  linsteps( vec4 x0,  vec4 x1,  vec4 v) {return remaps(x0, x1, vec4(0.0), vec4(1.0), v);}

#define HSCAN_FORMULA   return saturate(c * (linstep(0.0, 1.0, x) + p - 1.0) + p)
float hscan(float x, float p, float c) {HSCAN_FORMULA;}

const int MAX_STEPS = 128;
const int MAX_STEPS_SHADOW = 16;
const float DIST_MAX = 16.0;
const float DIST_SURF = 0.001;
const float MARCH_FACTOR = 1.0;
const float VOID_VALUE = 100000.0;

const int TREFOIL_SEGMENTS = 15;
const float TREFOIL_THICKNESS = 0.7;

const vec3 LIGHT_POS = vec3(1.0, 3.0, 6.0);

const float GLOBAL_SPEED = 1.0;

const float PI = 3.141593;
const float PIHALF = PI * 0.5;
const float TAU = PI * 2.0;

const int MAT_DEFAULT = 0;
const int MAT_BACK_PLANE = 1;
const int MAT_TREFOIL = 2;

struct SDData
{
    float dist;
    vec2 uv;
    vec3 normal;
    int matId;
};

SDData SDData0()
{
    SDData res;
    res.dist = VOID_VALUE;
    res.uv = vec2(0.0, 0.0);
    res.normal = vec3(0.0, 1.0, 0.0);
    res.matId = MAT_DEFAULT;
    return res;
}

struct RayMarchData
{
    float marched;
    SDData sdData;
};

RayMarchData RayMarchData0()
{
    RayMarchData res;
    res.marched = 0.0;
    res.sdData = SDData0();
    return res;
}

struct RenderData
{
    vec3 pos;
    vec3 normal;
    vec2 uv;
    vec3 view;
    int matId;
};

struct Ray
{
    vec3 o;
    vec3 d;
};

float toSrgb(float c)
{
    return (c < 0.0031308) ? c * 12.92 : 1.055 * pow(c, 0.41666) - 0.055;
}

vec3 toSrgb(vec3 c)
{
    return vec3(toSrgb(c.r), toSrgb(c.g), toSrgb(c.b));
}

float toLinear(float c)
{
    return (c < 0.04045) ? c * (1.0 / 12.92) : pow((c + 0.055) * (1.0 / 1.055), 2.4);
}

vec3 toLinear(vec3 c)
{
    return vec3(toLinear(c.r), toLinear(c.g), toLinear(c.b));
}

vec3 srgb255toLinear(vec3 c)
{
    return toLinear(c / 255.0);
}

mat3 rotX(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, c, s),
        vec3(0.0, -s, c)
    );
}

mat3 rotY(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat3(
        vec3(c, 0.0, -s),
        vec3(0.0, 1.0, 0.0),
        vec3(s, 0.0, c)
    );
}

mat3 rotZ(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat3(
        vec3(c, s, 0.0),
        vec3(-s, c, 0.0),
        vec3(0.0, 0.0, 1.0)
    );
}

vec3 avg(vec3 a, vec3 b)
{
    return (a + b) * 0.5;
}

mat3 camMtxWithInterestAndUp(vec3 camPos, vec3 camInterest, vec3 camUp)
{
    vec3 vecForward = normalize(camInterest - camPos);
    vec3 vecRight = normalize(cross(vecForward, camUp));
    vec3 vecUp = cross(vecRight, vecForward);
    return mat3(vecRight, vecUp, vecForward);
}

Ray rayCameraWithInterestUpWorldY(vec2 uv, vec3 camPos, vec3 camInterest)
{
    Ray ray;
    ray.o = camPos;
    ray.d = camMtxWithInterestAndUp(camPos, camInterest, vec3(0.0, 1.0, 0.0)) * normalize(vec3(uv, 1.0));
    return ray;
}

SDData sdBackPlane(vec3 p, int matId)
{
    SDData res;
    res.dist = p.z;
    res.matId = matId;
    res.uv = vec2(p.x, p.y);
    res.normal = vec3(0.0, 0.0, 1.0);
    return res;
}

vec3 trefoil(float t)
{
    float t2 = 2.0 * t;
    vec3 res = vec3(sin(t) + 2.0 * sin(t2), cos(t) - 2.0 * cos(t2), -sin(3.0 * t));
    res = rotZ(0.86) * res;  // reorient vertically
    return res;
}

vec3 bezier(vec3 a, vec3 b, vec3 c, float t)
{
    float tInv = (1.0 - t);
    return tInv * tInv * a + 2.0 * tInv * t * b + t * t * c;
}

// bezier derivative
vec3 bezierDx(vec3 a, vec3 b, vec3 c, float t)
{
    float t2 = 2.0 * t;
    return 2.0 * (t - 1.0) * a + 2.0 * (1.0 - t2) * b + t2 * c;
}

// return:
//      x: distance to a closest point p on curve
//      y: t bezier parameter at p
vec2 sdBezier(vec3 pos, vec3 A, vec3 B, vec3 C)
{
    vec3 a = B - A;
    vec3 b = A - 2.0 * B + C;
    vec3 c = a * 2.0;
    vec3 d = A - pos;

    float kk = 1.0 / dot2(b);
    float kx = kk * dot(a, b);
    float ky = kk * (2.0 * dot2(a) + dot(d, b)) / 3.0;
    float kz = kk * dot(d, a);

    vec2 res;

    float p = ky - kx * kx;
    float p3 = p * p * p;
    float q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    float q2 = q * q;
    float bezSD = q2 + 4.0 * p3;

    if (bezSD >= 0.0)
    {
        bezSD = sqrt(bezSD);
        vec2 x = (vec2(bezSD, -bezSD) - q) / 2.0;

        #if 1
        if (abs(p) < 0.001)
        {
            float k = (1.0 - p3 / q2) * p3 / q;
            x = vec2(k, -k - q);
        }
        #endif

        vec2 uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));
        float t = clamp(uv.x + uv.y - kx, 0.0, 1.0);

        // 1 root
        res = vec2(dot2(d + (c + b * t) * t), t);
    }
    else
    {
        float z = sqrt(-p);
        float v = acos(q / (p * z * 2.0)) / 3.0;
        float m = cos(v);
        float n = sin(v) * 1.732050808;
        vec3 t = clamp(vec3(m + m, -n - m, n - m) * z - kx, 0.0, 1.0);

        // 3 roots, but only need two
        float dis = dot2(d + (c + b * t.x) * t.x);
        res = vec2(dis, t.x);

        dis = dot2(d + (c + b * t.y) * t.y);
        if (dis < res.x)
            res = vec2(dis, t.y);
    }

    res.x = sqrt(res.x);
    return res;
}

float rand31(vec3 uv)
{
    return fract(sin(dot(uv, vec3(12.9898, 78.233, 471.169))) * 43758.5453);
}

SDData sdTrefoil(vec3 p, int matId)
{
    SDData res;

    const float treParamDelta = TAU / float(TREFOIL_SEGMENTS);
    vec3 a, b, c;
    vec3 bezP, bezTA, bezBT, bezNO, bezBTPrev;
    vec3 treNormal, treNormalOut;
    vec2 bezSD;
    float ad, uvYShift;

    vec3 trePrev = trefoil(-treParamDelta - treParamDelta);
    vec3 treCurr = trefoil(-treParamDelta);
    vec3 treNext = trefoil(0.0);

    a = avg(trePrev, treCurr);
    b = treCurr;
    c = avg(treCurr, treNext);
    bezBTPrev = normalize(cross(b - a, c - a));
    
    vec2 uvOut = vec2(0.0);
    float dmin = VOID_VALUE;
    uvYShift = 0.0;

    for (int i = 0; i < TREFOIL_SEGMENTS; i++)
    {	
        // grow next segment
        treCurr = treNext;
        treNext = trefoil(treParamDelta * (float(i) + 1.0));
        a = c;
        b = treCurr;
        c = avg(treCurr, treNext);

        // bezier distance
        bezSD = sdBezier(p, a, b, c);

        // uv
        bezP = bezier(a, b, c, bezSD.y);
        bezTA = normalize(bezierDx(a, b, c, bezSD.y));
        bezBT = normalize(cross(b - a, c - a));
        bezNO = normalize(cross(bezBT, bezTA));
        treNormal = normalize(p - bezP);
        vec2 uv0 = vec2(dot(treNormal, bezNO), dot(treNormal, bezBT));

        ad = acos(dot(bezBTPrev, bezBT));
        if ((i == 1) || (i == 5) || (i == 6) || (i == 10) || (i == (11)))  // for 15 segments
        {
            ad = -ad;
        }
        uvYShift += ad;
        
        float uvY = atan(uv0.y, uv0.x);
        uvY -= uvYShift;

        bezBTPrev = bezBT;

        // thickness
        float uvX = (float(i) + bezSD.y) / float(TREFOIL_SEGMENTS);
        float d = bezSD.x - TREFOIL_THICKNESS;
        if (d < dmin)
        {
            dmin = d;
            uvOut.x = uvX;
            uvOut.y = uvY;
            treNormalOut = treNormal;
        }
    }

    res.dist = dmin;
    res.matId = matId;
    res.uv = uvOut;
    res.normal = treNormalOut;
    return res;
}

void combineSD(inout SDData currentSD, SDData nextSD)
{
    if (nextSD.dist < currentSD.dist)
    {
        currentSD = nextSD;
    }
}

SDData scene(vec3 p)
{
    SDData res = SDData0();
    SDData nextSD = SDData0();

    nextSD = sdBackPlane(p - vec3(0.0, 0.0, -1.6), MAT_BACK_PLANE);
    combineSD(res, nextSD);
    nextSD = sdTrefoil(p - vec3(0.0, 0.0, 0.0), MAT_TREFOIL);
    combineSD(res, nextSD);

    return res;
}

// return: true if ray hit the object
bool rayMarch(Ray ray, inout RayMarchData rmData)
{
    bool res = true;
    int i = 0;
    for (i=0; i<MAX_STEPS; i++)
    {
        if (rmData.marched > DIST_MAX)
        {
            res = false;
            break;
        } 
        vec3 p = ray.o + ray.d * rmData.marched;
        SDData sdData = scene(p);
        if (sdData.dist < DIST_SURF)
        {
            rmData.sdData = sdData;
            res = true;
            break;
        }
        rmData.marched += sdData.dist * MARCH_FACTOR;
    }
    return res;
}

// return:
//    x: distance to edge
//    y: wave index
vec2 triangleWave(vec2 uv, vec2 dir)
{
    vec2 res = vec2(0.0);
    float w;
    w = dot(uv, dir);
    res.y = floor(w);
    w = 1.0 - abs(fract(w) - 0.5) * 2.0;
    res.x = w * 3.0 / 2.0;
    // res.x += 1.0;
    return res;
}

// return:
//    x, y, z: triangle index
//    w: distance to center
vec4 triangleGrid(vec2 uv)
{
    vec4 res = vec4(0.0);

    const float rad60 = 60.0 * PI / 180.0;
    const vec2 dirA = normalize(vec2(0.0, 1.0));
    const vec2 dirB = normalize(vec2(sin(rad60), -cos(rad60)));
    const vec2 dirC = normalize(vec2(-sin(rad60), -cos(rad60)));

    vec2 waveA = triangleWave(uv, dirA);
    vec2 waveB = triangleWave(uv, dirB);
    vec2 waveC = triangleWave(uv, dirC);

    res.x = waveA.y;
    res.y = waveB.y;
    res.z = waveC.y;
    res.w = min(min(waveA.x, waveB.x), waveC.x);
    
    return res;
}

vec3 trianglePattern(vec2 uv)
{
    vec3 res = vec3(0);
    
    vec4 triGrid = triangleGrid(uv);

    vec3 waveDir = normalize(vec3(1.0, 0.5, -0.3));
    float waveFreq = 0.3;
    float waveSpeed = 1.6 * 1.0;
    float waveCoord = dot(waveDir, triGrid.xyz);
    float waveRandShift = 1.0;
    float wave;
    float triRand = rand31(triGrid.xyz * 0.001);
    wave = sin(waveCoord * waveFreq + waveRandShift * triRand + ubuf.time * waveSpeed);
    wave = remaps(-1.0, 1.0, 0.0, 1.0, wave);

    float scanContrast = 8.0;
    vec2 scanWaveRemap = vec2(0.7, 0.9);
    float scanPos = remaps(0.0, 1.0, scanWaveRemap.x, scanWaveRemap.y, wave);
    float scan = hscan(triGrid.w, scanPos, scanContrast);

    res = vec3(scan);
    return res;
}

vec3 trianglePattern2(vec2 uv)
{
    vec3 res = vec3(1.0);

    const vec2 cPatternSpeed = vec2(1.0, 1.0);
    vec2 uvTimeShift = ubuf.time * cPatternSpeed;
    uv += uvTimeShift;

    vec4 triGrid = triangleGrid(uv);
    vec4 triGridOrigin = triangleGrid(uvTimeShift);

    float waveFreq = 0.15;
    float waveSpeed = 1.5 * 1.0;
    float waveCoord = length(triGrid.xyz - triGridOrigin.xyz);
    float waveRandShift = 1.2;
    float wave;
    float triRand = rand31(triGrid.xyz * 0.001);
    wave = sin(waveCoord * waveFreq + waveRandShift * triRand - ubuf.time * waveSpeed);
    wave = remaps(-1.0, 1.0, 0.0, 1.0, wave);

    float scanContrast = 8.0;
    vec2 scanWaveRemap = vec2(0.7, 0.9);
    float scanPos = remaps(0.0, 1.0, scanWaveRemap.x, scanWaveRemap.y, wave);
    float scan = hscan(triGrid.w, scanPos, scanContrast);
    res = vec3(scan);

    return res;
}

vec3 samplePatternWithFilter(vec2 uv, float ssFactor, float maxSamples, int matId)
{
    vec3 col = vec3(0.0);

    vec2 uvDDX = dFdx(uv); 
    vec2 uvDDY = dFdy(uv); 
    vec2 uvDDXYL = vec2(length(uvDDX), length(uvDDX));

    vec2 samples = 1.0 + trunc(clamp(ssFactor * uvDDXYL, 0.0, maxSamples - 1.0));

    for (float j=0.0; j<samples.y; j++)
    {
        for (float i=0.0; i<samples.x; i++)
        {
            vec2 st = vec2(i, j) / samples;
            vec3 pat = (matId == MAT_TREFOIL) ?
                trianglePattern(uv + st.x * uvDDX + st.y * uvDDY):
                trianglePattern2(uv + st.x * uvDDX + st.y * uvDDY);
            col += pat; 
        }
    }

	return col / (samples.x * samples.y);
}

vec3 renderMatTrefoil(RenderData renderData)
{
    vec3 col = vec3(1.0);

    vec2 uv = renderData.uv.xy;
    uv.y = mod(-uv.y, TAU) / TAU;
    uv.y += uv.x * 0.3575;  // stitching ends for 15 segments
    uv.y = fract(uv.y + 0.65);
    uv.x = fract(uv.x - 0.065);

    const vec2 cPatternTiling = vec2(256.0, 32.0) * 0.7;
    const vec2 cPatternSpeed = vec2(0.02, 0.1) * GLOBAL_SPEED;
    uv += ubuf.time * cPatternSpeed;
    uv *= cPatternTiling;

    col = samplePatternWithFilter(uv, 64.0, 8.0, MAT_TREFOIL);

    float fresnel = saturate(1.0 - dot(renderData.view, renderData.normal));
    fresnel *= fresnel;
    fresnel *= fresnel;
    fresnel *= fresnel;
    col = remaps(vec3(0.0), vec3(1.0), vec3(fresnel), vec3(1.0), col);

    return col;
}

vec3 renderMatBack(RenderData renderData)
{
    vec3 col = vec3(1.0);
    vec2 uv = renderData.uv.xy;

    const vec2 cPatternTiling = vec2(4.0);
    uv *= cPatternTiling;

    col = samplePatternWithFilter(uv, 32.0, 4.0, MAT_BACK_PLANE);
    return col;
}

vec3 renderMaterials(RenderData renderData)
{
    vec3 col = vec3(1.0);

    switch (renderData.matId)
    {
        case MAT_DEFAULT:
            break;

        case MAT_BACK_PLANE:
            col = renderMatBack(renderData);
            break;

        case MAT_TREFOIL:
            col = renderMatTrefoil(renderData);
            break;
    }

    return col;
}

float renderAO(RenderData renderData)
{
    const int STEPS = 4;
    const float RANGE = 2.0;
    const float STEP_FADE = 0.25;

    vec3 p = renderData.pos;
    vec3 n = renderData.normal;

    float occ = 0.0;
    float sca = 1.0;
    for (int i=0; i<(STEPS+1); i++)
    {
        float h = RANGE * float(i) / float(STEPS);
        float d = scene(p + h * n).dist;
        occ += max(h - d, 0.0) * sca;
        sca *= STEP_FADE;
    }
    occ = saturate(occ);
    occ = 1.0 - occ;
    occ *= occ;
    occ *= occ;
    occ *= occ;
    occ *= occ;
    return occ;
}

float renderSoftShadow(RenderData renderData, vec2 shadMinMax, float lightAngle)
{
    float res = 1.0;

    Ray ray;
    ray.o = renderData.pos;
    ray.d = normalize(LIGHT_POS - ray.o);

    float t = shadMinMax.x;
    int i;
    for (i=0; (i < MAX_STEPS_SHADOW) && (t < shadMinMax.y); i++)
    {
        float h = scene(ray.o + t * ray.d).dist;
        res = min(res, h / (lightAngle * t));
        t += max(h, 0.16);
        if (res<-1.0 || t>shadMinMax.y)
        {
            break;
        }
    }
    res = max(res, -1.0);
    res = 0.25 * (1.0 + res) * (1.0 + res) * (2.0 - res);
    return res;
}

vec3 renderLighting(RenderData renderData, Ray ray, vec3 col)
{
    vec3 res = vec3(0);

    vec3 sunColor = srgb255toLinear(vec3(255.0, 255.0, 255.0));
    float sunIntensity = 0.9;
    vec3 skyColor = srgb255toLinear(vec3(180.0, 200.0, 255.0));
    float skyIntensity = 0.14;
    vec3 backColor = srgb255toLinear(vec3(255.0, 255.0, 255.0));
    float backIntensity = 0.05;
    float fresnelIntensity = 0.2;

    vec3 P = renderData.pos;
    vec3 N = renderData.normal;
    vec3 L = normalize(LIGHT_POS - P);
    vec3 V = -ray.d;
    float NdotL = dot(N, L);

    float sha = renderSoftShadow(renderData, vec2(0.01, 8.0), 0.1);
    float occ = renderAO(renderData);
    float fre = 1.0 - saturate(dot(V, N)); 
    float dif = saturate(NdotL);
    float bac = saturate(-NdotL);
    float sky = linsteps(-1.0, 1.0, N.y);

    vec3 brdf = vec3(0.0);
    brdf += dif * sha * sunColor * sunIntensity;
    brdf += sky * occ * skyColor * skyIntensity;
    brdf += bac * occ * backColor * backIntensity;
    brdf += fre * fre * fre * remaps(0.0, 1.0, 0.1, 1.0, occ * dif) * fresnelIntensity;

    res = col * brdf;
    return res;
}

RenderData initRenderData(RayMarchData rmData, Ray ray)
{
    RenderData res;
    res.pos = ray.o + ray.d * rmData.marched;
    res.normal = rmData.sdData.normal;
    res.view = -ray.d;
    res.uv = rmData.sdData.uv;
    res.matId = rmData.sdData.matId;
    return res;
}

vec3 render(RenderData renderData, Ray ray)
{
    vec3 col = vec3(1.0);
    col = renderMaterials(renderData);
    col = renderLighting(renderData, ray, col);
    return col;
}

#ifdef AA_ENABLED
bool mainImage_(out vec4 fragColor, vec2 fragCoord)
#else
void main()
#endif
{
    vec3 col = vec3(0.0);
    bool needAA = true;

    vec2 uv = (fragCoord - 0.5 * ubuf.resolution.xy) / min(ubuf.resolution.x, ubuf.resolution.y);
    float t = ubuf.time;
    
    // camera and rays (z-positive goes from the screen to eye)
    const float zoom = 1.0;
    const float camDolly = 8.0;
    const vec3 camInterest = vec3(0.0, 0.45, 0.0);
    const vec2 mouseSpeed = vec2(6.0, 3.0);

    vec3 camPos = vec3(0.0, 0.45, camDolly);
    
    // scene
    Ray ray = rayCameraWithInterestUpWorldY(uv * zoom, camPos, camInterest);
    RayMarchData rmData = RayMarchData0();
    bool isHitSomething = rayMarch(ray, rmData);
    if (isHitSomething)
    {
        needAA = (fwidth(rmData.marched) >= 0.04) ? true : false;
        RenderData renderData = initRenderData(rmData, ray);
        col = render(renderData, ray);
    }

    // out col
    col = toSrgb(col);
    fragColor = vec4(col,1.0);
    #ifdef AA_ENABLED
    return needAA;
    #endif
}

#ifdef AA_ENABLED
void main()
{
    const int AA = max(AA_LEVEL, 1);
    float A = float(AA);
    fragColor = vec4(0.0);
    vec4 fragCol;
    bool needAA = true;
    float div = 0.0;
    for (int x=0; (x<AA) && needAA; x++)
    {
        for (int y=0; (y<AA) && needAA; y++)
        {
            vec2 s = vec2(x,y) / A;
            s += s * 0.5 - 0.5;
            needAA = mainImage_(fragCol, fragCoord + s);
            fragColor += fragCol;
            div += 1.0;
        }
    }
    fragColor /= div;
}
#endif
