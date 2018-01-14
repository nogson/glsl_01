module.exports = class Offscreen {

    constructor() {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let aspect = windowWidth / windowHeight;
        this.meshes = [];
        this.materialColors = [0xe8453f,0xe86d51, 0xec5564, 0xd94452, 0x3498db, 0x3498db, 0x9b59b6, 0xFF0000, 0xFFFF00];

        //オフスクリーンレンダリング用
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);

        let light = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light);

        let light2 = new THREE.DirectionalLight(0xffffff, 1.0);
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

    loadJSON() {
        let self = this;
        //3Dオブジェクトを読み込み
        let loader = new THREE.JSONLoader();

        let jsons = [
            {path:'./assets/obj/G.json',x:-0.425,c:this.materialColors[0]},
            {path:'./assets/obj/L.json',x:-0.115,c:this.materialColors[1]},
            {path:'./assets/obj/S.json',x:0.115,c:this.materialColors[2]},
            {path:'./assets/obj/L.json',x:0.425,c:this.materialColors[3]}
        ];

        for(let i = 0, l = jsons.length; i < l; i ++){
            let param = jsons[i];
            loader.load(param.path, function (geometry, materials) {
                let material = new THREE.MeshLambertMaterial({
                    color: param.c
                });
    
                let mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(param.x, 0, 0);
                mesh.scale.set(0.2, 0.2, 0.2);
                self.scene.add(mesh);
                self.meshes.push(mesh);
            });
        }

        for (let i = 0, j = 30; i < j; i++) {
            let mesh = self.createMesh();
            self.scene.add(mesh);
        }
    }

    createMesh() {
        let color = this.materialColors[Math.floor(Math.random() * (this.materialColors.length))];
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
        let self = this;
        const radian = time * 50 * Math.PI / 180;
        // 角度に応じてカメラの位置を設定
        this.camera.position.x = 1.3 * Math.sin(radian);
        this.camera.position.z = 1.0 * Math.cos(radian) - 0.5;
        this.camera.position.y = 0.5 * Math.cos(radian);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        for(let i = 0, l = self.meshes.length; i < l;i ++){
            self.meshes[i].position.z = (i * Math.cos(radian)) * 0.03;
            self.meshes[i].position.y = (i * Math.cos(radian)) * 0.03;
            self.meshes[i].rotation.y = i * Math.cos(radian);
        }
    }


};