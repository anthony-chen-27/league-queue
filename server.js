const express = require('express');
const { client } = require('websocket');

const app = express();
var expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));
app.use(express.json())


app.ws('/', function(ws, req) {
    ws.inQueue = false
    ws.name = ""

    ws.on('message', function(msg) {
        var data = JSON.parse(msg)
        console.log(data)
        if (data.type == "enter") {
            ws.name = data.name
            ws.inQueue = true
        }
        if (data.type == "leave") {
            ws.inQueue = false
        }
        updateAndNotifyQueue()
    })

    ws.on('close', function() {
        console.log('closing')
        if (ws.inQueue) {
            ws.inQueue = false
            updateAndNotifyQueue()
        }
    })

    ws.send(JSON.stringify({queue: getQueue(), type: 'updateQueue'}))
})

var aWss = expressWs.getWss('/');

function getQueue() {
    out = []
    aWss.clients.forEach(function (client) {
        if (client.inQueue) {
            out.push(client.name)
        }
    })
    return out
}


function updateAndNotifyQueue() {
    let queue = getQueue()
    if (queue.length == 3) {
        aWss.clients.forEach(function (client) {
            client.send(JSON.stringify({queue, type: 'foundQueue'}))
        })
    } else {
        aWss.clients.forEach(function (client) {
            client.send(JSON.stringify({queue, type: 'updateQueue'}))
        })
    }

}


app.listen(port, () => console.log(`Listening on port ${port}`));