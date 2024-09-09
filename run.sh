#!/bin/bash

read -p "T'as bien fait attention à ce que le fichier src/environments/environment.ts ait les variables de prod commentées? (y/n) : " response

if [[ "$response" == "y" ]]; then
    ng serve
else
    echo "Je run pas"
    exit 1
fi
