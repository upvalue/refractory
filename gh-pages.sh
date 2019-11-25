#!/usr/bin/env sh
# gh-pages.sh - compile to gh-pages and push

set -x

yarn build
cd ..
rm -rf rf-gh-pages
mkdir rf-gh-pages
git clone ./refractory rf-gh-pages
cd rf-gh-pages
git checkout gh-pages
cp -ru ../refractory/build/* .
git add .
git commit -a
