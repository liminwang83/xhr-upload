# xhr-upload
Chunked file read and upload to http server via xhr + Content-Range header

### How to run
```shell script
$node server.js
```
Then open http://localhost:7000  select file and upload

### How it works
1. slice a chunk of the file using `Blob.slice(start, end)`
2. read the chunk of file (512KB) from disk to memory using `FileReader`
3. upload the chunk to server via xhr with http header `Content-Range: bytes start-end/size`
4. when upload is successful, slice the next chunk and repeat the process until all the file read and uploaded.
5. finally, the file will be merged and saved with name "downloadedFile" on server side

Note: in case one chunk upload failed, it will retry up to 3 times.

### References
- https://stackoverflow.com/questions/12235709/using-xhr-object-for-html5-chunked-upload-in-a-loop
- https://stackoverflow.com/questions/25810051/filereader-api-on-big-files
- https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/upload
