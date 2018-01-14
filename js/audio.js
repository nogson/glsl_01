module.exports = class Audio {

    constructor() {
        let self = this;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices;
        //const context = new AudioContext();
        //let context = null;
        var AudioContext = window.AudioContext || window.webkitAudioContext || false;

        let context = new AudioContext();

        let bufferLength = null;
        let source = null;
        this.analyser = context.createAnalyser();
        this.analyser.minDecibels = -90; //最小値
        this.analyser.maxDecibels = 0; //最大値
        this.analyser.smoothingTimeConstant = 0.65;
        this.analyser.fftSize = 512; //音域の数
        bufferLength = this.analyser.frequencyBinCount; //fftSizeの半分のサイズ
        this.dataArray = new Uint8Array(bufferLength); //波形データ格納用の配列を初期化
        this.analyser.getByteFrequencyData(this.dataArray); //周波数領域の波形データを取得

        //マイクの音を取得
        navigator.getUserMedia({
                audio: true
            },
            function (stream) {
                source = context.createMediaStreamSource(stream);
                // オーディオの出力先を設定
                source.connect(self.analyser);
            },
            function (err) {
                console.log(err);
            }
        );
    }

    getData() {
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }
};