const baseVert = require('./../shader/base.vert');
const baseFrag = require('./../shader/base.frag');
const postVert = require('./../shader/post.vert');
const postFrag = require('./../shader/post.frag');

let notWebGL = function () {
    // webGL非対応時の記述
    console.log('this browser does not support webGL')
};

if (document.getElementsByTagName('html')[0].classList.contains('no-webgl')) {
    notWebGL();
}

// three.jsのとき
try {
    let renderer = new THREE.WebGLRenderer();
} catch (e) {
    notWebGL();
}

// 返ってくる値を確認してみましょう！
console.log(ubu.detect);
// IEの時
if (ubu.detect.browser.ie) {
    console.log('IEさん、動画テクスチャはちょっと…無理ですね…')
}

window.onload = function () {

    var renderer;
    var baseCamera, baseScene, baseMaterial;
    var offCamera, offScene, renderTarget;
    var theta = 0;
    var clock = new THREE.Clock();
    var composer;
    var customPass;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var aspect = windowWidth / windowHeight;
    var videoTexture;
    var video;

    //audio関連の変数
    let context;
    let analyser;
    let bufferLength;
    let dataArray;
    let source;
    let fftSize;

    //uniform用
    var time = 0.0;
    var distortion = 0.0;
    var distortion2 = 0.0;
    var scrollSpeed = 0.0;

    audioInit();
    init();


    function init() {

        // rendererの作成
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

        // canvasをbodyに追加
        document.body.appendChild(renderer.domElement);

        // canvasをリサイズ
        renderer.setSize(windowWidth, windowHeight);

        // ベース用シーン
        baseScene = new THREE.Scene();

        //LIGHTS
        var light = new THREE.AmbientLight(0xffffff, 1.0);
        baseScene.add(light);

        //共有ジオメトリ
        var geometry = new THREE.Geometry();

        geometry.vertices = [
            new THREE.Vector3(-1.0 * aspect, 1.0, 0.0),
            new THREE.Vector3(1.0 * aspect, 1.0, 0.0),
            new THREE.Vector3(-1.0 * aspect, -1.0, 0.0),
            new THREE.Vector3(1.0 * aspect, -1.0, 0.0)
        ];

        geometry.faces = [
            new THREE.Face3(0, 2, 1),
            new THREE.Face3(1, 2, 3)
        ];

        //ベースの描画処理用カメラ                      
        baseCamera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);
        baseCamera.position.z = 1;
        baseMaterial = 　new THREE.ShaderMaterial({
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
            vertexShader: baseVert,
            fragmentShader: baseFrag
        });

        var mesh = new THREE.Mesh(geometry, baseMaterial);
        baseScene.add(mesh);

        //オフスクリーンレンダリング用
        offScene = new THREE.Scene();
        offCamera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);
        offCamera.position.z = 1;

        // var texture = THREE.ImageUtils.loadTexture('images/img.jpg');
        // var offMaterial = new THREE.MeshBasicMaterial({
        //     map: texture,
        //     wireframe: false
        // });

        //Load Video
        video = document.createElement('video');
        video.loop = true;
        video.src = 'movie/mv.mp4';
        video.play();


        videoTexture = new THREE.Texture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        // var offMaterial = new THREE.MeshPhongMaterial({
        //    map: videoTexture
        // });

        var offMaterial = new THREE.MeshPhongMaterial({
            color: 0x2194ce,
         });

        //var offGeometry = new THREE.PlaneGeometry(3, 2, 1, 1);
        var offGeometry = new THREE.SphereBufferGeometry( 0.2, 5, 5 );

        var offMesh = new THREE.Mesh(offGeometry, offMaterial);
        offScene.add(offMesh);

        var light2 = new THREE.DirectionalLight(0xffffff);
        light2.position.set(1, 1, 1).normalize();
        offScene.add( light2 );

        //オフスクリーンレンダリングしたものをベースシーンのテクスチャとして利用
        renderTarget = new THREE.WebGLRenderTarget(256, 256, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        });


        //ポストプロセス用コンポーザー
        composer = new THREE.EffectComposer(renderer);

        //現在のシーンを設定
        var renderPass = new THREE.RenderPass(baseScene, baseCamera);
        composer.addPass(renderPass);
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
                "distortion": {
                    type: "f",
                    value: distortion
                },
                "distortion2": {
                    type: "f",
                    value: 2.0
                },
                "distortion3": {
                    type: "f",
                    value: 2.0
                },
                "scrollSpeed": {
                    type: "f",
                    value: 0.5
                },
                "speed": {
                    type: "f",
                    value: 1.0
                }
            },
            vertexShader: postVert,
            fragmentShader: postFrag
        }

        //エフェクト結果をスクリーンに描画する
        customPass = new THREE.ShaderPass(myEffect);
        customPass.renderToScreen = true;
        composer.addPass(customPass);
        //------------


        render();
    }

    function audioInit() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.minDecibels = -90; //最小値
        analyser.maxDecibels = 0; //最大値
        analyser.smoothingTimeConstant = 0.65;
        analyser.fftSize = 512; //音域の数

        bufferLength = analyser.frequencyBinCount; //fftSizeの半分のサイズ
        dataArray = new Uint8Array(bufferLength); //波形データ格納用の配列を初期化
        analyser.getByteFrequencyData(dataArray); //周波数領域の波形データを取得

        //マイクの音を取得
        navigator.webkitGetUserMedia({
                audio: true
            },
            function (stream) {
                source = context.createMediaStreamSource(stream);
                // オーディオの出力先を設定
                source.connect(analyser);
            },
            function (err) {
                console.log(err);
            }
        );
    }

    function sum(arr) {
        return arr.reduce(function (prev, current, i, arr) {
            return (prev + current);
           // return 50;
        });
    };

    function render() {

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (videoTexture) videoTexture.needsUpdate = true;
        }
        analyser.getByteFrequencyData(dataArray)

        time = clock.getElapsedTime();
        customPass.uniforms.distortion.value = sum(dataArray) / dataArray.length;
        customPass.uniforms.distortion2.value = sum(dataArray) / (dataArray.length * Math.random() * 10 + 10) * 0.1;
        customPass.uniforms.distortion3.value = sum(dataArray) / (dataArray.length * Math.random() * 20 + 10) * 0.1;        
        customPass.uniforms.scrollSpeed.value = sum(dataArray) / (dataArray.length * Math.random() * 500 + 500) * 0.1;
        customPass.uniforms.time.value = time;
        baseMaterial.uniforms.time.value = time;
        customPass.uniforms.textuer.value.needsUpdate = true;


        renderer.render(offScene, offCamera, renderTarget);
        composer.render();

        requestAnimationFrame(render);
    }
};