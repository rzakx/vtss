#!/bin/bash
nowe=`date +%Y-%m-%d-%H-%M`
mv "last.log" "${nowe}.log"
screen -dmSL "backendTruck" -Logfile last.log npx nodemon index.js