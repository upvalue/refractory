#!/usr/bin/env sh
# gh-pages.sh - compile to gh-pages and push

set -x

cd ..
mkdir -p rf-gh-pages
git clone ./refractory rf-gh-pages
cd rf-gh-pages
yarn build
git checkout gh-pages
cp -ru build/* .
git commit -a


