const postVert = require('./../shader/post.vert');
const postFrag = require('./../shader/post.frag');
const Utils = require('./utils.js');

module.exports = class PostScene {

    constructor(renderer, scene, camera, renderTarget) {

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        this.utils = new Utils();
        let time = 0;
        let distortion = 0;
        let colorNoise = 0;

        //現在のシーンを設定
        this.renderPass = new THREE.RenderPass(scene, camera);

        //ポストプロセス用コンポーザー
        this.composer = new THREE.EffectComposer(renderer);

        this.composer.addPass(this.renderPass);
        //カスタムシェーダー
        let myEffect = {
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
        }

        //エフェクト結果をスクリーンに描画する
        this.customPass = new THREE.ShaderPass(myEffect);
        this.customPass.renderToScreen = true;
        this.composer.addPass(this.customPass);
        //------------
    }


    render(time,data){
        let audioData = this.utils.sum(data);
        let audioDataLength =  data.length;
        this.customPass.uniforms.distortion.value = audioData / audioDataLength;
        this.customPass.uniforms.distortion2.value = audioData / (audioDataLength * Math.random() * 10 + 10) * 0.05;
        this.customPass.uniforms.distortion3.value = audioData / (audioDataLength * Math.random() * 20 + 10) * 0.05;
        this.customPass.uniforms.scrollSpeed.value = audioData / (audioDataLength * Math.random() * 500 + 500) * 0.05;
        this.customPass.uniforms.colorNoise.value = audioData / (audioDataLength * Math.random() * 20 + 20) * 0.1;
        this.customPass.uniforms.time.value = time;
        this.customPass.uniforms.textuer.value.needsUpdate = true;

        this.composer.render();
    }


};