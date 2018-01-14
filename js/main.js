
const BaseScene = require('./base_scene.js');
const Offscreen = require('./offscreen.js');
const PostScene = require('./post_scene.js');
const Audio = require('./audio.js');


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

    let renderer;
    let clock = new THREE.Clock();
    let composer;
    let customPass;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    //uniform用
    let time = 0.0;
 
    // rendererの作成
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

    // canvasをbodyに追加
    document.body.appendChild(renderer.domElement);

    // canvasをリサイズ
    renderer.setSize(windowWidth, windowHeight);

    const baseScene = new BaseScene();
    const offscreen = new Offscreen();
    const postScene = new PostScene(renderer, baseScene.scene, baseScene.camera, offscreen.renderTarget);
   // const audio = new Audio();

    render();

    function render() {
        let data = [1.0];
        time = clock.getElapsedTime();

        offscreen.render(time);
        baseScene.render(time);
        postScene.render(time,data);
        renderer.render(offscreen.scene, offscreen.camera, offscreen.renderTarget);

        requestAnimationFrame(render);
    }
};