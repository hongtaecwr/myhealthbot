const
    bodyParser = require('body-parser'),
    express = require('express'),
    line = require('@line/bot-sdk'),
    config = require('./config.json'),
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


////line_client
app.get('/createquiz', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/createQuiz.html'));
  });
  app.get('/searchquiz', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/searchQuiz.html'));
  });
  app.get('/searchquizLine', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/searchQuizLine.html'));
  });
  app.get('/policy', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/policy.html'));
  });
  app.get('/bot-train', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/bottrain.html'));
  });
  app.get('/json-upload-to-parse', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/json-upload-to-parse.html'));
  });
  app.get('/push/userId=:userId&tags=:tags&limit=:limit', function(req, res) {
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
  
    _line_postback.getQuizsByTags(data, function(replyData) {
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
                line_client.replyMessage(event.replyToken, [{
                    type: "template",
                    altText: "this is a buttons template",
                    template: {
                        type: "buttons",
                        thumbnailImageUrl: SERVER_URL + "/assets/dan.ai_cover_bg.jpg",
                        title: "คุณต้องการทำอะไร?",
                        text: "เลือกเมนูด้านล่าง",
                        actions: [{
                            type: "postback",
                            label: "เล่น Quiz",
                            data: JSON.stringify({
                                "type": "PLAY_QUIZ_PAYLOAD"
                            })
                        },
                        {
                            "type": "uri",
                            "label": "สร้าง Quiz",
                            "uri": "https://dang-ai.herokuapp.com/createquiz"
                        }
                        ]
                    }
                }]);
                break;
            case 'help':
            case 'Help':
            case '#help':
            case '#Help':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "ต้องการเล่น Quiz ให้พิมพ์ เล่น,เริ่ม,play,start หรือ กดปุ่ม เล่น Quiz ที่เมนู \n\nต้องการดูคำสั่งต่างๆ ให้พิมพ์  #help \n\nต้องการสร้างชุดคำถามกดปุ่ม สร้าง Quiz ที่เมนู\n\nคุณสามารถค้นหา Quiz ที่ต้องการเล่นเพียงกดปุ่ม ค้นหา Quiz เมื่อเริ่มเล่น Quiz \n\nสอนไอ้แดงให้ตอบโต้ พิมพ์\n  #ask (ข้อความที่1),(ข้อความที่..) #ans (คำตอบที่1),(คำตอบที่..)\n\n😁😁😁😁",
                }, {
                    type: "template",
                    altText: "วิธีสอนไอ้แดงพูด",
                    template: {
                        type: "buttons",
                        title: "สอนไอ้แดงให้พูด",
                        text: "วิธีง่ายๆแค่กดปุ่มด้านล่าง",
                        actions: [{
                            "type": "uri",
                            "label": "สอนไอ้แดง",
                            "uri": "https://dang-ai.herokuapp.com/bot-train"
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
                                            text: "#!?!%$"
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
    } else { return Promise.resolve(null); }
} //end HandleEvent    



// function handleMessageEvent(event) {
//     var msg = {
//         type: 'text',
//         text: 'สวัสดีครัช'
//     };

//     return line_client.replyMessage(event.replyToken, msg);
// }

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'));
});
module.exports = app; 