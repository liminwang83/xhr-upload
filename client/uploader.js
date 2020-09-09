const uploader = {
    BYTES_PER_CHUNK: 1024 * 256,
    uploadFile: function(file, location, start, isresume) {
        var item = { file: file, chunkId: 0};
        var blob = item.file;

        const SIZE = blob.byteLength;

        this.upload(item, location, SIZE, isresume);
    },
    getStatus: function(item, xhr, isresume) {
        return xhr.status;
    },
    onFileUploadError: function(item, xhr) {
        console.log(xhr);
        alert("fail");
    },

    upload: function(item, location, SIZE, isresume) {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType("text/plain");
        let start = item.chunkId * this.BYTES_PER_CHUNK;
        let end = start + this.BYTES_PER_CHUNK;
        if(end > SIZE) {
            end = SIZE;
        }
        if(start > end) {
            displayProgress('File upload compeleted!')
            return;
        }
        var chunk = item.file.slice(start, end);
        // Upload the first chunk
        xhr.upload.addEventListener("error", this.onFileUploadError.bind(this, item, xhr), false);
        xhr.onload = this.getStatus.bind(this, item, xhr, isresume);
        xhr.onreadystatechange = this.isChunkUploaded.bind(this, item, xhr, SIZE, location);
        xhr.open("PUT", location, true);
        xhr.setRequestHeader("Content-Range", `bytes ${start}-${end-1}/${SIZE}`);
        xhr.send(chunk);
    },

    isChunkUploaded: function(item, request, SIZE, location, e) {
        if (request.readyState === 4 && request.status === 200) {
            ++item.chunkId;
            console.log("chunk " + item.chunkId + " uploaded");
            this.upload(item, location, SIZE, true);
        } else  {
            console.log(request.readyState, item, request);
        }
    },
};

function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    console.log('reader.onload', e.target.result);
    displayProgress('File loaded as buffer, start to upload, please wait...');
    uploader.uploadFile(e.target.result, "/", 0, false);
  };
  displayProgress('Loading file to memory, please wait...');
  reader.readAsArrayBuffer(file);
}

function displayProgress(status) {
  const element = document.getElementById('upload-progress');
  element.textContent = status;
  console.log(status);
}

document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
