(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Audio() {
        _classCallCheck(this, Audio);

        var self = this;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        var context = new AudioContext();
        var bufferLength = null;
        var source = null;
        this.analyser = context.createAnalyser();
        this.analyser.minDecibels = -90; //最小値
        this.analyser.maxDecibels = 0; //最大値
        this.analyser.smoothingTimeConstant = 0.65;
        this.analyser.fftSize = 512; //音域の数
        bufferLength = this.analyser.frequencyBinCount; //fftSizeの半分のサイズ
        this.dataArray = new Uint8Array(bufferLength); //波形データ格納用の配列を初期化
        this.analyser.getByteFrequencyData(this.dataArray); //周波数領域の波形データを取得

        //マイクの音を取得
        navigator.webkitGetUserMedia({
            audio: true
        }, function (stream) {
            source = context.createMediaStreamSource(stream);
            // オーディオの出力先を設定
            source.connect(self.analyser);
        }, function (err) {
            console.log(err);
        });
    }

    _createClass(Audio, [{
        key: "getData",
        value: function getData() {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
    }]);

    return Audio;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var vert = require('./../shader/base.vert');
var frag = require('./../shader/base.frag');

module.exports = function () {
    function BaseScene() {
        _classCallCheck(this, BaseScene);

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var aspect = windowWidth / windowHeight;
        var time = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);
        this.camera.position.z = 1;

        //共有ジオメトリ
        this.geometry = new THREE.Geometry();

        this.geometry.vertices = [new THREE.Vector3(-1.0 * aspect, 1.0, 0.0), new THREE.Vector3(1.0 * aspect, 1.0, 0.0), new THREE.Vector3(-1.0 * aspect, -1.0, 0.0), new THREE.Vector3(1.0 * aspect, -1.0, 0.0)];

        this.geometry.faces = [new THREE.Face3(0, 2, 1), new THREE.Face3(1, 2, 3)];

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                'time': {
                    type: 'f',
                    value: time
                },
                'resolution': {
                    type: 'v2',
                    value: new THREE.Vector2(windowWidth, windowHeight)
                }
            },
            vertexShader: vert,
            fragmentShader: frag
        });

        var mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(mesh);
    }

    _createClass(BaseScene, [{
        key: 'render',
        value: function render(time) {
            this.material.uniforms.time.value = time;
        }
    }]);

    return BaseScene;
}();

},{"./../shader/base.frag":6,"./../shader/base.vert":7}],3:[function(require,module,exports){
'use strict';

var BaseScene = require('./base_scene.js');
var Offscreen = require('./offscreen.js');
var PostScene = require('./post_scene.js');
var Audio = require('./audio.js');

var notWebGL = function notWebGL() {
    // webGL非対応時の記述
    console.log('this browser does not support webGL');
};

if (document.getElementsByTagName('html')[0].classList.contains('no-webgl')) {
    notWebGL();
}

// three.jsのとき
try {
    var renderer = new THREE.WebGLRenderer();
} catch (e) {
    notWebGL();
}

// 返ってくる値を確認してみましょう！
console.log(ubu.detect);
// IEの時
if (ubu.detect.browser.ie) {
    console.log('IEさん、動画テクスチャはちょっと…無理ですね…');
}

window.onload = function () {

    var renderer = void 0;
    var clock = new THREE.Clock();
    var composer = void 0;
    var customPass = void 0;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    //uniform用
    var time = 0.0;

    // rendererの作成
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

    // canvasをbodyに追加
    document.body.appendChild(renderer.domElement);

    // canvasをリサイズ
    renderer.setSize(windowWidth, windowHeight);

    var baseScene = new BaseScene();
    var offscreen = new Offscreen();
    var postScene = new PostScene(renderer, baseScene.scene, baseScene.camera, offscreen.renderTarget);
    // const audio = new Audio();

    render();

    function render() {
        var data = [1.0];
        time = clock.getElapsedTime();

        offscreen.render(time);
        baseScene.render(time);
        postScene.render(time, data);
        renderer.render(offscreen.scene, offscreen.camera, offscreen.renderTarget);

        requestAnimationFrame(render);
    }
};

},{"./audio.js":1,"./base_scene.js":2,"./offscreen.js":4,"./post_scene.js":5}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Offscreen() {
        _classCallCheck(this, Offscreen);

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var aspect = windowWidth / windowHeight;
        this.meshes = [];
        this.materialColors = [0xe8453f, 0xe86d51, 0xec5564, 0xd94452, 0x3498db, 0x3498db, 0x9b59b6, 0xFF0000, 0xFFFF00];

        //オフスクリーンレンダリング用
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);

        var light = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light);

        var light2 = new THREE.DirectionalLight(0xffffff, 1.0);
        light2.position.set(0, 2, 2).normalize();
        this.scene.add(light2);

        //オフスクリーンレンダリングしたものをベースシーンのテクスチャとして利用
        this.renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        });

        this.loadJSON();
    }

    _createClass(Offscreen, [{
        key: 'loadJSON',
        value: function loadJSON() {
            var self = this;
            //3Dオブジェクトを読み込み
            var loader = new THREE.JSONLoader();

            var jsons = [{ path: './assets/obj/G.json', x: -0.425, c: this.materialColors[0] }, { path: './assets/obj/L.json', x: -0.115, c: this.materialColors[1] }, { path: './assets/obj/S.json', x: 0.115, c: this.materialColors[2] }, { path: './assets/obj/L.json', x: 0.425, c: this.materialColors[3] }];

            var _loop = function _loop(i, l) {
                var param = jsons[i];
                loader.load(param.path, function (geometry, materials) {
                    var material = new THREE.MeshLambertMaterial({
                        color: param.c
                    });

                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(param.x, 0, 0);
                    mesh.scale.set(0.2, 0.2, 0.2);
                    self.scene.add(mesh);
                    self.meshes.push(mesh);
                });
            };

            for (var i = 0, l = jsons.length; i < l; i++) {
                _loop(i, l);
            }

            for (var i = 0, j = 30; i < j; i++) {
                var mesh = self.createMesh();
                self.scene.add(mesh);
            }
        }
    }, {
        key: 'createMesh',
        value: function createMesh() {
            var color = this.materialColors[Math.floor(Math.random() * this.materialColors.length)];
            var geometry = new THREE.IcosahedronGeometry(0.05, 0);

            var material = new THREE.MeshLambertMaterial({
                color: color
            });

            var mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(Math.random() * 2.0 + 0.1 - 1.1, Math.random() * 2.0 + 0.1 - 1.1, Math.random() * 2.0 + 0.2 - 1.1);

            return mesh;
        }
    }, {
        key: 'render',
        value: function render(time) {
            var self = this;
            var radian = time * 50 * Math.PI / 180;
            // 角度に応じてカメラの位置を設定
            this.camera.position.x = 1.3 * Math.sin(radian);
            this.camera.position.z = 1.0 * Math.cos(radian) - 0.5;
            this.camera.position.y = 0.5 * Math.cos(radian);

            this.camera.lookAt(new THREE.Vector3(0, 0, 0));

            for (var i = 0, l = self.meshes.length; i < l; i++) {
                self.meshes[i].position.z = i * Math.cos(radian) * 0.03;
                self.meshes[i].position.y = i * Math.cos(radian) * 0.03;
                self.meshes[i].rotation.y = i * Math.cos(radian);
            }
        }
    }]);

    return Offscreen;
}();

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var postVert = require('./../shader/post.vert');
var postFrag = require('./../shader/post.frag');

module.exports = function () {
    function PostScene(renderer, scene, camera, renderTarget) {
        _classCallCheck(this, PostScene);

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var time = 0;
        var distortion = 0;
        var colorNoise = 0;

        //現在のシーンを設定
        this.renderPass = new THREE.RenderPass(scene, camera);

        //ポストプロセス用コンポーザー
        this.composer = new THREE.EffectComposer(renderer);

        this.composer.addPass(this.renderPass);
        //カスタムシェーダー
        var myEffect = {
            uniforms: {
                'tDiffuse': {
                    value: null
                },
                'time': {
                    type: 'f',
                    value: time
                },
                'resolution': {
                    type: 'v2',
                    value: new THREE.Vector2(windowWidth, windowHeight)
                },
                'textuer': {
                    type: 't',
                    value: renderTarget
                },
                'distortion': {
                    type: 'f',
                    value: distortion
                },
                'distortion2': {
                    type: 'f',
                    value: 2.0
                },
                'distortion3': {
                    type: 'f',
                    value: 2.0
                },
                'colorNoise': {
                    type: 'f',
                    value: colorNoise
                },
                'scrollSpeed': {
                    type: 'f',
                    value: 0.5
                },
                'speed': {
                    type: 'f',
                    value: 1.0
                }
            },
            vertexShader: postVert,
            fragmentShader: postFrag

            //エフェクト結果をスクリーンに描画する
        };this.customPass = new THREE.ShaderPass(myEffect);
        this.customPass.renderToScreen = true;
        this.composer.addPass(this.customPass);
        //------------
    }

    _createClass(PostScene, [{
        key: 'render',
        value: function render(time, data) {
            var audioData = this.sum(data);
            var audioDataLength = data.length;
            this.customPass.uniforms.distortion.value = audioData / audioDataLength;
            this.customPass.uniforms.distortion2.value = audioData / (audioDataLength * Math.random() * 10 + 10) * 0.05;
            this.customPass.uniforms.distortion3.value = audioData / (audioDataLength * Math.random() * 20 + 10) * 0.05;
            this.customPass.uniforms.scrollSpeed.value = audioData / (audioDataLength * Math.random() * 500 + 500) * 0.05;
            this.customPass.uniforms.colorNoise.value = audioData / (audioDataLength * Math.random() * 20 + 20) * 0.1;
            this.customPass.uniforms.time.value = time;
            this.customPass.uniforms.textuer.value.needsUpdate = true;

            this.composer.render();
        }
    }, {
        key: 'sum',
        value: function sum(arr) {
            return arr.reduce(function (prev, current, i, arr) {
                return prev + current;
            });
        }
    }]);

    return PostScene;
}();

},{"./../shader/post.frag":8,"./../shader/post.vert":9}],6:[function(require,module,exports){
module.exports = "#ifdef GL_ES\nprecision mediump float;\n#endif\n \nconst   int       oct = 8;         // オクターブ\nconst   float     per = 0.5;       // パーセンテージ\nconst   float     PI  = 3.1415926; // 円周率\nuniform float time;\nuniform vec2 resolution;\n\n// 補間関数\nfloat interpolate(float a, float b, float x){\n    float f = (1.0 - cos(x * PI)) * 0.5;\n    return a * (1.0 - f) + b * f;\n}\n// 乱数生成器\nfloat rnd(vec2 p){\n    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);\n}\n// 補間乱数\nfloat irnd(vec2 p){\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    vec4 v = vec4(rnd(vec2(i.x,       i.y      )),\n                  rnd(vec2(i.x + 1.0, i.y      )),\n                  rnd(vec2(i.x,       i.y + 1.0)),\n                  rnd(vec2(i.x + 1.0, i.y + 1.0)));\n    return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);\n}\n// 補間乱数をオクターブ分だけ重ね合わせる\nfloat noise(vec2 p){\n    float t = 0.0;\n    for(int i = 0; i < oct; i++){\n        float freq = pow(2.0, float(i));\n        float amp  = pow(per, float(oct - i));\n        t += irnd(vec2(p.x / freq, p.y / freq)) * amp;\n    }\n    return t;\n}\n// シームレスに上下左右を補間してつなげる\nfloat snoise(vec2 p, vec2 q, vec2 r){\n    return noise(vec2(p.x,       p.y      )) *        q.x  *        q.y  +\n           noise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +\n           noise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y  +\n           noise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);\n}\n\nvoid main(){\n    // ノイズ生成用の位置ベクトル @@@\n    vec2 p = vec2(gl_FragCoord.x  + time * 300.0, gl_FragCoord.y);\n\n    // バリューノイズを生成 @@@\n    float n = snoise(p, gl_FragCoord.st / resolution, resolution);\n\n    if(n < 0.5){\n        n -= 0.3;\n    }\n\n    if(n > 0.5){\n        n += 0.3;\n    }\n\n    gl_FragColor = vec4(vec3(n),1.0);\n}\n\n";

},{}],7:[function(require,module,exports){
module.exports = "\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

},{}],8:[function(require,module,exports){
module.exports = "#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform sampler2D tDiffuse;\nuniform sampler2D textuer;\nuniform float time;\nuniform float distortion;\nuniform float distortion2;\nuniform float distortion3;\nuniform float colorNoise;\nuniform float speed;\nuniform float scrollSpeed;\nuniform vec2 resolution;\nvarying vec2 vUv;\nconst float size = 40.0;      // モザイク模様ひとつあたりのサイズ\n\n\n//シンプレックスノイズ\n//https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl\nvec3 mod289(vec3 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n    return mod289(((x * 34.0) + 1.0) * x);\n}\n\nfloat snoise(vec2 v) {\n    const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0,\n        0.366025403784439, // 0.5*(sqrt(3.0)-1.0),\n        -0.577350269189626, // -1.0 + 2.0 * C.x,\n        0.024390243902439); // 1.0 / 41.0,\n    vec2 i = floor(v + dot(v, C.yy));\n    vec2 x0 = v - i + dot(i, C.xx);\n\n    vec2 i1;\n    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n    vec4 x12 = x0.xyxy + C.xxzz;\n    x12.xy -= i1;\n\n    i = mod289(i);\n    // Avoid truncation effects in permutation,\n    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\n\n    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\n    m = m * m;\n    m = m * m;\n\n    vec3 x = 2.0 * fract(p * C.www) - 1.0;\n    vec3 h = abs(x) - 0.5;\n    vec3 ox = floor(x + 0.5);\n    vec3 a0 = x - ox;\n\n    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\n\n    vec3 g;\n    g.x = a0.x * x0.x + h.x * x0.y;\n    g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n    return 130.0 * dot(m, g);\n}\n\nfloat rnd(vec2 p){\n    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nmat2 scale(vec2 _scale){\n    return mat2(_scale.x,0.0,\n                0.0,_scale.y);\n}\n\nvoid main() {\n    //背景のグラデーション\n    vec2 pos = (gl_FragCoord.st * 2.0 - resolution.xy)/ min(resolution.x,resolution.y);\n    float pl = (1.0 - length(pos)) * 0.3;\n\n    //ブロックノイズを作る\n    vec2 texCoord = floor(gl_FragCoord.st / size) * size;\n    vec2 texCoord2x = floor(gl_FragCoord.st / (size * 2.0)) * (size * 2.0);\n\n    // フレームバッファの描画結果をテクスチャから読み出す\n    vec4 bnoise = texture2D(tDiffuse, vec2(texCoord.x,texCoord.y) / resolution);\n    vec4 bnoise2 = texture2D(tDiffuse, vec2(texCoord2x.x,texCoord2x.y) / resolution);\n\n\n    //ブロックノイズ用オフセット\n    float offset2 = (bnoise.r + bnoise.g + bnoise.b)/3.0;\n    offset2 =  offset2 * distortion3 * 0.1;\n   \n    vec2 p = vUv;\n\n    float y = p.y + time * speed;\n\n    float n = snoise(vec2(y,0.0));\n    float offset = snoise(vec2(y,0.0));\n\n    offset = offset * distortion * 0.005;\n    offset += snoise(vec2(y * 50.0,0.0)) * 0.01 * distortion2;\n\n    //走査線\n    float scanLine = abs(sin(p.y * 400.0 + mod(time, 10.0) * 5.0)) * 0.2 + 0.8;\n\n    //UV座標  \n    vec2 u = vec2(fract(p.x + offset + offset2),fract(p.y + offset2 + mod(time, 10.0) * scrollSpeed * 0.3));\n\n    vec4 color = vec4(1.0);\n    color.r = texture2D(textuer, u + vec2(0.01 * distortion2,0.0)).r;\n    color.g = texture2D(textuer, u + vec2(-0.01 * distortion2,0.0)).g;\n    color.b = texture2D(textuer, u + vec2(0.0,0.0)).b;\n\n    //色を反転\n    vec4 color2 = 1.0 - color   ;\n    float s = step(0.0025,sin(bnoise2.r * colorNoise));\n\n    if(s <= 0.0){\n        color.r = texture2D(textuer, u + vec2(0.01 * distortion2,0.0)).b;\n        color.g = texture2D(textuer, u + vec2(-0.01 * distortion2,0.0)).g;\n        color.b = texture2D(textuer, u + vec2(0.0,0.0)).r;\n    }\n\n    gl_FragColor = color * scanLine + pl;\n    //gl_FragColor =vec4(vec3(scanLine2),1.0);\n\n    //gl_FragColor = texture2D(textuer,vUv);\n\n}";

},{}],9:[function(require,module,exports){
module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv; \n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

},{}]},{},[3]);
