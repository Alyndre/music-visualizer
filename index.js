const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const { loadImage, createCanvas } = require('canvas');
const { ffmpeg } = require('eloquent-ffmpeg');
var AudioContext = require('web-audio-api').AudioContext

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

const FPS = 30;
const FRAMES = FPS * 30;

app.post('/', upload.fields([{name: 'audio', maxCount: 1}, {name: 'background', maxCount: 1}]), async(req, res, next) => {

  let audio = req.files.audio[0];  
  var context = new AudioContext();

  fs.readFile(audio.destination+audio.filename, (err, data) => {
    context.decodeAudioData(data, async (audioBuffer) => {
      console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);

      try {
        var command = ffmpeg();
        command.input(audio.destination+audio.filename);
        command.input(draw(audioBuffer)).args('-framerate', FPS.toString()).format('image2pipe');
        command.output('frames.webm');
    
        const proc = await command.spawn();
        await proc.complete();
        console.log("end");
      } catch(e) {
        console.log(e);
      }

    });
  });

  res.send('Ok');
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

async function* draw(audioBuffer) {
  let framesCount = Math.trunc(audioBuffer.duration * FPS);
  const audioStep = Math.trunc(audioBuffer.length / framesCount);
  //let i = 0;
  framesCount = 50;
  const canvas = createCanvas(800, 600);
  var ctx = canvas.getContext('2d');

  for (let i = 0; i < framesCount; i++) {
    generateFrameWithoutSave(ctx, i);

    yield canvas.toBuffer('image/png');
  }
}

async function doFft(audioBuffer, audioStep, i, maxCicles) {
    let slice = audioBuffer.getChannelData(0).slice(i * audioStep, i * audioStep + audioStep);

    //Normalize & toInt

    return generateFrame(i);
    for (let j = 0; j < slice.length; j++) {
      //Do FFT
    }

    console.log(i);
}

async function generateFrameWithoutSave(context, i) {
  context.beginPath();
  context.strokeStyle = 'green';
  context.moveTo(Math.random()*100, Math.random()*100);
  context.lineTo(Math.random()*100, Math.random()*100);
  context.stroke();
  context.fillStyle = "#de0";
  context.fillRect(0,0,800,600);
  context.save();
}

async function generateFrameWithSave(i) {
  return new Promise(resolve => {
    const canvas = createCanvas(800, 600);
    var ctx = canvas.getContext('2d');

    ctx.fillRect(0,0,800,600);
    ctx.save();

    var out = fs.createWriteStream('frames/base'+i+'.png');
    var stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
      resolve();
    });
  });
}