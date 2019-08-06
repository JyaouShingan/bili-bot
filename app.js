const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('youtube-dl');
const stream = require('stream');
const fs = require('fs');

let passthrough = new stream.PassThrough();
let video = ytdl("https://www.bilibili.com/video/av8941875", [], null);
video.on('info', (info) => {
   console.log("Download started");
   console.log("Video name: " + info._filename);
   console.log("size: " + info.size);
});
video.on('end', () => {
   console.log("Download finished");
});
video.pipe(passthrough);

ffmpeg()
    .input(passthrough)
    .inputFormat('flv')
    .noVideo()
    .audioCodec('libmp3lame')
    .on('start', (cmd) => {
        console.log("Starting FFmpeg: " + cmd);
    })
    .on('error', (err) => {
        console.log("Error: " + err.message)
    })
    .on('end', () => {
        console.log("FFmpeg transcoding complete")
    })
    .save('output.mp3');
