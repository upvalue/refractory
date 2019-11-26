.PHONY: size

size: 
	cat src/editor.js src/editor.css > /tmp/sizeguess.txt
	gzip -f -9 /tmp/sizeguess.txt
	ls -lah /tmp/sizeguess.txt.gz

