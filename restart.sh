#!/bin/sh

echo "Shutting down current running process"
screen -S bilibot -X quit

echo "Checking out master"
git checkout -f master

echo "Updating to latest master"
git pull origin master

echo "Updating dependencies"
npm install

START_DATE=`date +%F-%H-%M-%S`

if [[ ! -d "./logs" ]]
then
    mkdir "logs"
fi

echo "Starting screen session"
screen -S bilibot -d -m sh -c "npm start | tee logs/${START_DATE}.log"
