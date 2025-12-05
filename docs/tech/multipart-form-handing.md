# multipart form upload

#tech #expressjs

How to parse multi-part form data using multer and/or body-parser

- body parser is inbuilt in express 5
- `npm install multer`

Curl Example

```bash
# ~/src/meetonline/server/node-server-app
curl -v -X POST http://localhost:9006/upload \
  -F "file=@/mnt/c/Users/anura/Downloads/download.jpg" \
  -F "username=nerd" \
  -F "note=hello-multer"
```

Output

```text
{"ok":true,"message":"File uploaded successfully",
"file":{"originalname":"download.jpg","mimetype":"image/jpeg",
"size":55940,"filename":"1762185607850-download.jpg",
"path":"/uploads/1762185607850-download.jpg"},
"body":{"username":"prakhar","note":"hello-multer"}}
```
