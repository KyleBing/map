#!/bin/bash
cd /usr/share/nginx/html &&
rm -Rf tools/map* &&
mv map-* tools/map &&
cd tools/map &&
unzip map-* &&
rm -f map-*
echo 'Map deploy finished.'
