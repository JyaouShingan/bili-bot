#!/bin/sh

echo "Shutting down current running process"
screen -S bilibot -X quit

echo "Checking out master"
git checkout -f master

echo "Updating to latest master"
git pull origin master

echo "Updating dependencies"
npm install

echo "Starting screen session"
screen -S bilibot -d -m npm start
