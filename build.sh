#!/bin/bash

ng build

VERSION=$(cat VERSION | tr -d '\n')
sudo docker build -t "lrde-frontend:${VERSION}" .

rm -r dist/

sudo docker save -o "lrde-frontend-${VERSION}.tar" "lrde-frontend:${VERSION}"
