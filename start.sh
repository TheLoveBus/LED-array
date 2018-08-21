#!/bin/sh

DIR=`dirname $0`

cd "$DIR"

python controld.py > /dev/null &
