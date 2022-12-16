const http = require("http");
const path = require("path");
const fs = require("fs");
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const uri = "mongodb+srv://admin:password12345@cluster0.yb0p2h6.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true});

const songListCollection = new mongoose.Schema({
    rank: Number,
    title: String,
    streams: Number,
    artist: String,
    year: String,
    url: String
});

const collection = mongoose.model("songsList", songListCollection)
const changeStreamCursor = collection.watch()

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    
    if (req.url === "/") {
        fs.readFile(path.join(__dirname, 'public', 'index.html'),
                    (err, content) => {
                                    
                                    if (err) throw err;
                                    res.writeHead(200, { 'Content-Type': 'text/html' });
                                    res.end(content);
                        }
                );
     }
     else if(req.url.match("\.css$")){
        var cssPath = path.join(__dirname, 'public', req.url);
        var fileStream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/css"});
        fileStream.pipe(res);
     }
    else if (req.url==='/api')
    {
        // Please note the content-type here is application/json
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write('{"songs: [');
        const cursor = collection.find().cursor();
        let first = true;
        cursor.on('data', (doc) => {
            if(first) {
                first = false;
            } else{
                res.write(',');
            }
            res.write(JSON.stringify(doc));
        });
        cursor.on('end', ()=> {
            res.write(']}');
            res.end();
        })
    }
    else{
        res.end("<h1> URL Not Found</h1>");
    }
});

const PORT= process.env.PORT || 5959;

server.listen(PORT,()=>
{
     console.log(`Great our server is running on port ${PORT} `)
});