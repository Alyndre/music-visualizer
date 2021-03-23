const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const { Readable } = require('stream');
//const { ffmpeg } = require('eloquent-ffmpeg');
var Draw = require('./src/draw');
var Video = require ('./src/video');
var AudioContext = require('web-audio-api').AudioContext
var Meyda = require('meyda');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

const FPS = 30;
const BUFFER_SIZE = 256;
const WIDTH = 1920;
const HEIGHT = 1080;

app.post('/', upload.fields([{name: 'audio', maxCount: 1}, {name: 'background', maxCount: 1}]), async(req, res, next) => {

  let audio = req.files.audio[0];
  await render(audio);

  res.send('Ok');
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})

async function render(audio) {
  return new Promise(resolve => {
    fs.readFile(audio.destination+audio.filename, (err, data) => {
      let context = new AudioContext();
      context.decodeAudioData(data, async (audioBuffer) => {
        console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);
        try {
          var drawer = new Draw(WIDTH, HEIGHT, BUFFER_SIZE);
          var video = new Video(audio.destination+audio.filename, 'frames.webm', FPS);
          const videoWriter = video.getFfmpeg();
          Meyda.bufferSize = BUFFER_SIZE;
          try {
            const num_chunks = Math.floor(audioBuffer.length / BUFFER_SIZE);
            console.log(num_chunks);
            for (let i = 0; i < num_chunks; i++) {
              let slice = audioBuffer.getChannelData(0).slice(i * BUFFER_SIZE, i * BUFFER_SIZE + BUFFER_SIZE);
              const features = Meyda.extract('powerSpectrum', slice);
              drawer.generateFrameWithoutSave(features);
              await video.processData(drawer.getCanvas().toBuffer());
            }
          } catch(e){
            console.log(e);
          }
          video.endFfmpeg();
          console.log("end");
          resolve();
        } catch(e) {
          console.log(e);
        }
      });
    });
  });
}