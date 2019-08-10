# bili-bot
Discord bot for playing Bilibili video

## Installation
### 1. Install `NodeJs` version >= v10

### 2. Install `FFMpeg` library

On macOS:
```
brew install ffmpeg
```

On Linux:
```
apt-get install ffmpeg
```

Make sure ffmpeg executable is in system `PATH` environment variable

### 3. Install dependency

```
npm install
```

## Configuration

Create a json file under root directory named `botconfig.json`:
```[json]
{
  "discordToken": "<YOUR TOKEN HERE>"
}
```

## Run
```
npm start
```
