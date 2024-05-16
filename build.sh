#!/bin/bash

ng build

VERSION=$(cat VERSION | tr -d '\n')
sudo docker build -t "web:${VERSION}" .

rm -r dist/
