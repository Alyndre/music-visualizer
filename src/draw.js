
const { loadImage, createCanvas } = require('canvas');
const fs = require('fs');

module.exports = class Draw {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(this.width, this.height);
    this.context = this.canvas.getContext('2d');
  }

  draw(audioBuffer, ffmpeg) {
    //const framesCount = Math.trunc(audioBuffer.duration * FPS);
    //const audioStep = Math.trunc(audioBuffer.length / framesCount);
  }

  getCanvas() {
    return this.canvas;
  }

  generateFrameWithoutSave(features) {
    this.context.fillStyle = "#de0";
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.clearRect(0, 0, this.width, this.height);
    let space = this.width / features.length * 2.5;
    var x = 0;
    for (let i=0; i<features.length; i++) {
      const feature = features[i];
      this.context.fillStyle = 'rgb(' + (feature+100) + ',50,50)';
      this.context.fillRect(x, this.height-feature/2,space,feature/2);
      x += space + 1;
    }
    this.context.save();
  }

  async generateFrameWithSave(features, x) {
      this.context.fillRect(0,0,800,600);
      this.context.save();
      let space = this.width / features.length * 2.5;
      for (let i=0; i<features.length; i++) {
        const feature = features[i];
        this.context.beginPath();
        this.context.moveTo(space*i, this.height); //x,y
        this.context.lineTo(space*i, this.height-feature); //x,y
        this.context.strokeStyle = "red";
        this.context.stroke();
      }
      await this.saveData(x);
      console.log("saved " + x);
  }

  saveData(i, x) {
    return new Promise(resolve => {
      var out = fs.createWriteStream('frames/base'+x+"-"+i+'.png');
      var stream = this.canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve();
      });
    });
  }
}