const { createServer } = require("http");
const methods = Object.create(null);
let PORT = 8080;

createServer((request, response) => {
    let handler = methods[request.method] || notAllowed;
    handler(request).catch(error => {
        if (error.status != null) throw error;
        return { body: String(error), status: 500 }
    }).then(({ body, status = 200, type = 'type/plain' }) => {
        response.writeHead(status, { "Content-Type": type, "Access-Control-Allow-Origin": "*" });
        // response.write(body.toString())
        if (body && body.pipe) body.pipe(response);
        else response.end(body);
        //response.end();
    })
}).listen(PORT, () => console.log('Listening! (port ' + PORT + ')'))


async function notAllowed(request) {
    return { status: 405, body: `Method ${request.method}  is not allowed.` }
}

const { createReadStream } = require("fs");
const { readdir, stat } = require("fs").promises;
const mime = require("mime");
const { parse } = require("url");
const { resolve, sep } = require("path")

const baseDirectory = process.cwd()


function urlPath(url) {
    let { pathname } = parse(url);
    let path = resolve(decodeURIComponent(pathname).slice(1))

    if (path != baseDirectory && !path.startsWith(baseDirectory + sep)) {
        return { error: 403, body: "Forbidden" }
    }
    return path;
}

methods.GET = async function(request) {
    let path = urlPath(request.url);
    let stats;
    try {
        stats = await stat(path)
    } catch (error) {
        if (error.code != "ENOENT") throw error;
        return { status: 404, body: "File Not Found" }
    }

    if (stats.isDirectory()) {
        return {
            body: (await readdir(path)).join('\n')
        }
    } else {
        return {
            body: createReadStream(path),
            type: mime.getType(path)
        }
    }
}