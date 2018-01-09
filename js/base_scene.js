
const vert = require('./../shader/base.vert');
const frag = require('./../shader/base.frag');

module.exports = class BaseScene {

    constructor() {

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let aspect = windowWidth / windowHeight;
        let time = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);
        this.camera.position.z = 1;


        //共有ジオメトリ
        this.geometry = new THREE.Geometry();

        this.geometry.vertices = [
            new THREE.Vector3(-1.0 * aspect, 1.0, 0.0),
            new THREE.Vector3(1.0 * aspect, 1.0, 0.0),
            new THREE.Vector3(-1.0 * aspect, -1.0, 0.0),
            new THREE.Vector3(1.0 * aspect, -1.0, 0.0)
        ];

        this.geometry.faces = [
            new THREE.Face3(0, 2, 1),
            new THREE.Face3(1, 2, 3)
        ];

        this.material = 　new THREE.ShaderMaterial({
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

        let mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(mesh);
    }


    render(time){
        this.material.uniforms.time.value = time;        
    }


};