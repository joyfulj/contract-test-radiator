const express = require('express');
const app = express();
const jsonfile = require('jsonfile');
const server = require('http').createServer(app);
const socketio = require('socket.io')(server);
const bodyParser = require('body-parser');

const screenshot = require('./screenshot-slack-uploader');
const repository = require('./database');

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use('/scripts', express.static(__dirname + '/../node_modules/cytoscape/dist'));
app.use('/scripts', express.static(__dirname + '/../node_modules/socket.io-client/dist'));

app.set('socketio', socketio);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.put('/data', function (req, res) {

    repository.load().then(dataList=>{
        const reqList = req.body;
        for(const data of dataList) {
            for(const req of reqList){
                if (data.from === req.from && data.to === req.to) {
                    data.result = req.result;
                }
            }
        }
        repository.save(dataList);
        app.get('socketio').emit('contracts', dataList);
        if(hasAnyFail(dataList)){
            screenshot.screenshot('http://localhost:3000', 'result.png');
        }
        res.sendStatus(200);
    });
});

const hasAnyFail = (dataList) => {
    for(const data of dataList){
        if(data.result == 'fail'){
          return true;
        }
    }
    return false;
}


server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

socketio.on('connection', function (socket) {
    const contract = repository.load();
    contract.then(data => {
        socket.emit('contracts', data);
    });
});
