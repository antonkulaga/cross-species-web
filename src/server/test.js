const express = require("express")
const os = require('os');
const fs = require('fs');
const Promise = require('bluebird');

const app = express()
const graph = require( __dirname + '/graph.js');

const repo = new graph.GraphRepository()

async function readFile(path) {
    console.log('path', path);
    return new Promise(async (resolve) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) console.log('erro2', err);
            resolve(data);
        });
    });
}


app.use(express.static('dist'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.raw());


app.get("/", (req, res)=>{
    res.send("<h1>Hello world</h1>")
})

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.get('/api/getSamples', async (req, res, next) => {
    const result = await repo.querySamples();
    res.send(result);
});

app.post('/api/getExpressions', async (req, res, next) => {
    // console.log(req.body);
    const { runs, genes } = req.body;
    const result = await queryExpressions(runs, genes);
    res.send(result);
});

app.listen(process.env.PORT || 5555, () => console.log(`Listening on port ${process.env.PORT || 5555}!`));
