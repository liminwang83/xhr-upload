const uploader = {
    BYTES_PER_CHUNK: 1024 * 512,
    reader: new FileReader(),
    item: {file: null, chunkId: 0, start: 0, end: 0, chunkData: null, retryTimes: 0},

    onFileUploadError(xhr) {
        console.log('xhr.upload.onerror triggered: file upload failed!', xhr);
    },
    uploadChunk(chunk, location) {
        const xhr = new XMLHttpRequest();
        // xhr.overrideMimeType('text/plain');
        xhr.upload.onerror = this.onFileUploadError.bind(this, xhr);
        xhr.onload = this.isChunkUploaded.bind(this, xhr, location);
        // Upload the first chunk
        xhr.open('PUT', location, true);
        xhr.setRequestHeader('Content-Range', `bytes ${this.item.start}-${this.item.end-1}/${this.item.file.size}`);
        console.log('Content-Range', `bytes ${this.item.start}-${this.item.end-1}/${this.item.file.size}`);
        xhr.send(chunk);
    },
    isChunkUploaded(request, location) {
        if (request.readyState === 4 && request.status === 200) {
            displayProgress(`chunk ${this.item.chunkId} uploaded to ${location}`);
            //read next chunk
            this.item.chunkId++;
            this.item.retryTimes = 0;
            this.readChunk();
        } else  {
            displayProgress(`uploading chunk ${this.item.chunkId} failed!`);
            if (this.item.retryTimes < 3) {
                this.item.retryTimes++;
                displayProgress(`retry upload chunk ${this.item.chunkId} for the ${this.item.retryTimes} time.`);
                uploader.uploadChunk(this.item.chunkData, '/', false);
            }
        }
    },
    readAndUploadChunkRecursively(file) {
        this.item.file = file;
        this.reader.onload = function (e) {
            displayProgress(`chunk ${this.item.chunkId} read to memory.`);
            this.item.chunkData = e.target.result;
            uploader.uploadChunk(this.item.chunkData, '/', false);
        }.bind(this);
        this.readChunk()
    },
    readChunk() {
        const SIZE = this.item.file.size;
        const start = this.item.chunkId * this.BYTES_PER_CHUNK;
        let end = start + this.BYTES_PER_CHUNK;
        if (end > SIZE) {
            end = SIZE;
        }
        if (start > end) {
            displayProgress('No more chunks left, completed!');
            return;
        }
        this.item.start = start;
        this.item.end = end;
        const chunk = this.item.file.slice(start, end);
        this.reader.readAsArrayBuffer(chunk);
    }
};

function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploader.readAndUploadChunkRecursively(file);
}

function displayProgress(progressInfo) {
  const element = document.getElementById('upload-progress');
  element.textContent = progressInfo;
  console.log(progressInfo);
}

document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
