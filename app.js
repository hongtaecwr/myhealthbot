const
    bodyParser = require('body-parser'),    
    express = require('express'),
    line = require('@line/bot-sdk'),
    config = require('./config.json');

    require('dotenv').config();

const app = express();

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
    res.sendStatus(200)
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));

});

function handleEvent(event) {

    console.log(event);
    if (event.type === 'message' && event.message.type === 'text') {
        handleMessageEvent(event);
    } else {
        return Promise.resolve(null);
    }
}

function handleMessageEvent(event) {
    var msg = {
        type: 'text',
        text: 'สวัสดีครัช'
    };

    return client.replyMessage(event.replyToken, msg);
}

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'));
});