module.exports = class Offscreen {

    constructor() {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let aspect = windowWidth / windowHeight;
        this.materialColors = [0xFFDA00, 0x29D64E, 0x29D6C5, 0x2980D6, 0x7529D6, 0xFC3AAE, 0xCCCCCC, 0x333333];

        //オフスクリーンレンダリング用
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);

        let light = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(light);

        let light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(0, 0, 2).normalize();
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

    loadJSON() {
        let self = this;
        //3Dオブジェクトを読み込み
        let loader = new THREE.JSONLoader();

        loader.load('./assets/obj/text.json', function (geometry, materials) {
            let material = new THREE.MeshLambertMaterial({
                color: 0xFF5C5C
            });

            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            mesh.scale.set(0.2, 0.2, 0.2);
            self.scene.add(mesh);

            for (let i = 0, j = 30; i < j; i++) {
                let mesh = self.createMesh();
                self.scene.add(mesh);
            }

        });
    }

    createMesh() {
        let color = this.materialColors[Math.floor(Math.random() * (this.materialColors.length - 1))];
        let geometry = new THREE.IcosahedronGeometry(0.05, 0);

        let material = new THREE.MeshLambertMaterial({
            color: color
        });

        let mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            Math.random() * 2.0 + 0.1 - 1.1,
            Math.random() * 2.0 + 0.1 - 1.1,
            Math.random() * 2.0 + 0.2 - 1.1
        );

        return mesh;
    }

    render(time) {
        const radian = time * 50 * Math.PI / 180;
        // 角度に応じてカメラの位置を設定
        this.camera.position.x = 1.3 * Math.sin(radian);
        this.camera.position.z = 1.3 * Math.cos(radian);
        this.camera.position.y = 0.5 * Math.cos(radian);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }


};