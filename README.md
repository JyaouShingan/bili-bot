# bili-bot
Discord bot for playing Bilibili video

## Installation
### 1. Install `NodeJs` version >= v10

### 2. Install `FFMpeg` library

On macOS:
```
brew install ffmpeg
```

On Debian-Linux:
```
apt-get install ffmpeg
```

Make sure ffmpeg executable is in system `PATH` environment variable

### 3. Install and run MongoDB

On macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

On Debian-Linux

Refer to https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/

Make sure `mongod` service is running before starting the bot.

### 4. Install dependency

```
npm install
```

## Configuration

Create a json file under root directory named `botconfig.json`:
```json
{
  "discordToken": "<YOUR TOKEN HERE>",
  "mongoUri": "mongodb://localhost:27017 (or your custom URI)"
}
```

## Run
```
npm start
```
