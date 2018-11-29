const
    bodyParser = require('body-parser'),
    express = require('express'),
    line = require('@line/bot-sdk'),
    config = require('./config.json'),
    path = require('path'),
    _line_postback = require('./line_postback.js'),
    _postback = require('./postback.js'),
    _reply = require('./reply.js');

require('dotenv').config();

const app = express();

const line_client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
    res.sendStatus(200)
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));

});

app.set('view engine', 'ejs');

app.use(express.static('public'));

////line_client
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
// app.get('/createquiz', function (req, res) {
//     res.sendFile(path.join(__dirname + '/public/createQuiz.html'));
// });
// app.get('/searchquiz', function (req, res) {
//     res.sendFile(path.join(__dirname + '/public/searchQuiz.html'));
// });
// app.get('/searchquizLine', function (req, res) {
//     res.sendFile(path.join(__dirname + '/public/searchQuizLine.html'));
// });
app.get('/policy', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/policy.html'));
});
app.get('/bot-train', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/bottrain.html'));
});
app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/test.html'));
});
app.get('/json-upload-to-parse', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/json-upload-to-parse.html'));
});
app.get('/push/userId=:userId&tags=:tags&limit=:limit', function (req, res) {
    var userId = req.params.userId;
    var tags = req.params.tags;
    var limit = req.params.limit;
    var data = '{"tags":' + tags + ',"limit":' + limit + ',"getTemp":' + true + '}'
    console.log("push userId: " + userId + " limit :" + limit + " tags :" + tags + "\ndata:" + data);

    line_client.pushMessage(userId, {
        type: 'text',
        text: "กำลังค้นหา Quiz จากการร้องขอ.."
    })
        .then(() => {
            res.json("done");
        })
        .catch((err) => {
            console.error("push error :" + err);
        });

    _line_postback.getQuizsByTags(data, function (replyData) {
        line_client.pushMessage(userId, replyData.results)
            .then(() => {
                res.json("done");
            })
            .catch((err) => {
                console.error("push error :" + err);
            });
    });
});

////////////



///////Handle Event
function handleEvent(event) {
    var userId = event.source.userId;
    console.log(event);

    if (event.type === 'postback') {
        var data = event.postback.data;
        _line_postback.process(userId, data, function (replyData) {
            var replyMessage = replyData.results;
            console.log("userId: %s ---- replyMessage: %s", userId, JSON.stringify(replyMessage));
            line_client.replyMessage(event.replyToken, replyMessage);
        });
    } else if (event.message.type == 'text') {
        console.log("------------> event.message.text: %s", event.message.text);
        switch (event.message.text) {
            case 'เริ่มต้น':
            case 'ใช้งาน':
            case 'Start':
            case 'ไปเลย':
            case 'เริ่ม':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "สวัสดีครับ ผมเฮลท์บอทเอง",
                }, {
                    type: "text",
                    text: "ยินดีต้อนรับสู่เฮลท์บอท แชทบอทเพื่อสุขภาพ🤖\n\n ท่านสามารถเข้าสู่บทสนทนาทั่วไปได้เลยหรือจะเลือกเมนูนูได้เลยครับ\n\n หากมีข้อสงสัยด้านการใช้งานสามารถเลือกเมนูช่วยเหลือหรือพิมพ์ Help ก็ได้ครับ",
                },{
                    type: "sticker",
                    packageId: "2",
                    stickerId: "22"
                }]);
                break;
            
            case 'สอนน้องบอทพูด':
            case 'สอนน้อง':
            case 'สอนพูด':
            case 'สอน':
            line_client.replyMessage(event.replyToken, [{
                type: "text",
                text: "สามารถสอนโดยวิธีการดังนี้",
            },{
                type: "image",
                originalContentUrl: "https://myhealthbot.herokuapp.com/assets/Guide-1.png",
                previewImageUrl: "https://myhealthbot.herokuapp.com/assets/Guide-1.png",
                animated: false,
            },{
                type: "template",
                altText: "วิธีสอนบอทให้พูด",
                template: {
                    type: "buttons",
                    title: "สอนบอทให้พูด",
                    text: "วิธีง่ายๆแค่กดปุ่มด้านล่าง",
                    actions: [{
                        "type": "uri",
                        "label": "สอนบอทให้พูด",
                        "uri": "https://myhealthbot.herokuapp.com/bot-train"
                    }]
                }
            }]);
            break;

            case 'help':
            case 'Help':
            case '#help':
            case '#Help':
            case '#ขอความช่วยเหลือ':
            case '#ช่วยเหลือ':
            case '#ช่วยด้วย':
            case '#ช่วย':
            case '#ช่วยหน่อย':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "ยินดีต้อนรับเข้าสู่เมนูช่วยเหลือ 😄😄 \n\nท่านสามารถเลือกเมนูได้จากปุ่มเมนูหรือสามารถพิมพ์การสนทนาทั่วไปได้เลย \n\nในการสอนพูด ท่านสามารถกดปุ่มด้านล่าง หรือพิมพ์ตามตัวอย่างดังนี้\n#ถาม สวัสดี #ตอบ ว่ายังไงครับ\n",
                }, {
                    type: "template",
                    altText: "วิธีสอนบอทให้พูด",
                    template: {
                        type: "buttons",
                        title: "สอนบอทให้พูด",
                        text: "วิธีง่ายๆแค่กดปุ่มด้านล่าง",
                        actions: [{
                            "type": "uri",
                            "label": "สอนบอทให้พูด",
                            "uri": "https://myhealthbot.herokuapp.com/bot-train"
                        }]
                    }
                }]);
                break;

            default:
                var messageText = event.message.text;
                _reply.processMessage(messageText, function (responseMsg) {
                    if (responseMsg == messageText) {
                        _reply.callCloudCode("getReplyMsg", '{"msg":"' + messageText + '"}', function (response) {
                            if (response == "") {
                                _reply.callCloudCode("findBestMsgFromUnknow", '{"msg":"' + messageText + '"}', function (response) {
                                    if (response == "") {
                                        line_client.replyMessage(event.replyToken, [{
                                            type: "text",
                                            text: "น้องบอทยังไม่เข้าใจน๊าาาา"
                                        }]);
                                    } else {
                                        line_client.replyMessage(event.replyToken, [{
                                            type: "text",
                                            text: _reply.badwordFilter(response)
                                        }]);

                                        var data = '{"msg":[' + JSON.stringify(messageText) + '],"replyMsg":[' + JSON.stringify(response) + ']}';
                                        _reply.callCloudCode("createUnknowMsg", data, function (response) {
                                        });
                                    }
                                });
                            } else if (responseMsg.substring(0, 5) == '#PUSH') {
                                var msg = responseMsg.replace("#PUSH", "");
                                var obj = JSON.parse(msg);
                                line_client.pushMessage(obj.userId, {
                                    type: "text",
                                    text: obj.replyMsg[0]
                                });
                            } else {
                                line_client.replyMessage(event.replyToken, [{
                                    type: "text",
                                    text: _reply.badwordFilter(response)
                                }]);
                            }
                        });
                    } else {
                        line_client.replyMessage(event.replyToken, [{
                            type: "text",
                            text: _reply.badwordFilter(responseMsg)
                        }]);
                    }
                });
                break;
        }
    } else { 
        return Promise.resolve(null); 
            }
} //end HandleEvent    



app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'));
});
module.exports = app; 