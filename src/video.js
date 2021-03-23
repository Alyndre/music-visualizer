const { Writable } = require('stream');
const { spawn } = require('child_process');
const pathToFfmpeg = require('ffmpeg-static');

module.exports = class Video {
  constructor(audioFilename, outputVideoName, fps) {
    const crf = '23';
    const preset = 'medium';
    const args = [
      '-y',
      '-i', audioFilename,
      '-crf', crf,
      '-c:a', 'aac', '-b:a', '384k', '-profile:a', 'aac_low',
      '-c:v', 'libx264', '-r', `${fps}`, '-pix_fmt', 'yuv420p', '-preset', preset, outputVideoName,
      '-r', `${fps}`,
      '-i', '-'
    ];
    this.ffmpeg = spawn(pathToFfmpeg, args);
    this.ffmpeg.stdin.pipe(process.stdout);
    this.ffmpeg.stderr.on('data', (err) => {
      console.log(err);
    });
    this.ffmpeg.on('exit', (code) => {
      console.log(code);
    });
  }

  getFfmpeg () {
    return this.ffmpeg;
  }

  async processData(buffer) {
    const isFrameProcessed = this.ffmpeg.stdin.write(buffer);
    if (!isFrameProcessed) {
      await this.waitDrain(this.ffmpeg.stdin);
    }
  }

  endFfmpeg() {
    this.ffmpeg.stdin.end();
  }

  waitDrain(stream) {
    return new Promise(resolve => stream.once('drain', resolve))
  }
}