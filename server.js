const http = require('http');
const fs = require('fs');

function end_of_file(string) {
    // const re = /[0-9]*-([0-9]*)\/\1/;
    // return re.test(string);
    console.log('end of file check: ', string);
    const arr = string.split('-').pop().split('/');
    return Number(arr[0]) +1 === Number(arr[1]);
}

let body = [];
const server = http.createServer((request, response) => {

    const {headers, method, url} = request;
    console.log(`${method} request, url is ${url}`);

    if (request.method === 'GET') {
        if (url === '/') {
            response.writeHead(200, {
                'content-type': 'text/html'
            });
            const readStream = fs.createReadStream("./client/index.html");
            readStream.pipe(response);
        } else if (url.endsWith('.js')) {
            response.writeHead(200, {
                'content-type': 'text/javascript'
            });
            const readStream = fs.createReadStream("./client/uploader.js");
            readStream.pipe(response);
        } else if (url === '/favicon.ico') {
            response.writeHead(200, {
                'content-type': 'image/png'
            });
            const readStream = fs.createReadStream("./client/favicon.ico");
            readStream.pipe(response);
        } else {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('404 Not Found\n');
            response.end();
        }
        console.log('GET request end.');
    } else if (method === "PUT") {
        request.on('data', (chunk) => {
            body.push(chunk);
            console.log('chunk received');
        });
        request.on('end', () => {
            if (end_of_file(headers['content-range']) && body.length) {
                const content = Buffer.concat(body);
                console.log('transfer completed, raw data and concat data as below:');
                console.log('body:\n', body, '\ncontent:\n', content);
                fs.writeFile("downloadedFile", content, () => {
                });
                body = [];
            }
            // console.log('http headers: ', headers);
            console.log('PUT request end\n');
            response.end();
        });
    }
});
server.listen(7000);
console.log('http://localhost:7000');
