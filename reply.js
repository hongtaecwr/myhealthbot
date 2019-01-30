var request = require('request');
var config = require('./config.json');


module.exports = {
  callCloudCode: function (methodName, requestMsg, responseMsg) {
    callParseServerCloudCode(methodName, requestMsg, function (res) {
      responseMsg(res);
    });
  },
  processMessage: function (requestMsg, responseMsg) {
    processMessage(requestMsg, function (res) {
      responseMsg(res);
    });
  },
  badwordFilter: function (requestMsg) {
    return badwordFilter(requestMsg);
  }
};
// ------ bot process ------ //

function callParseServerCloudCode(methodName, requestMsg, responseMsg) {
  console.log("callParseServerCloudCode:" + methodName + "\nrequestMsg:" + requestMsg);
  var options = {
    url: 'https://replyserver.herokuapp.com/parse/functions/' + methodName,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': 'myAppId',
      'X-Parse-Master-Key': 'myMasterKey'
    },
    body: requestMsg
  };
  //// ดู
  function callback(error, response, body) {
    console.log("response:" + JSON.stringify(response));
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      responseMsg(info.result.replyMsg);
      console.log("result.msg: " + info.result.msg + " result.replyMsg: " + info.result.replyMsg);
    } else {
      console.error("Unable to send message. Error :" + error);
    }
  }
  request(options, callback);
}

//train
function processMessage(reqMsg, resMsg) {
  if (reqMsg.length > 6) {
    var checkMsg = reqMsg.substring(0, 4);
    switch (checkMsg) {
      case '#ถาม':
        // trainingCommand
        trainingCommand(reqMsg, function (res) {
          if (!res) {
            resMsg("มีบางอย่างผิดพลาด คุณอาจจะลืมเว้นวรรค หรือเผลอกด เว้นบรรทัด");
            //failed
          } else {
            resMsg("ผมจำได้แล้ว ลองพิมพ์ข้อความที่สอนดูครับผม");
            //success
          }
        });
        break;
      case '#sen':
        sendingCommand(reqMsg, function (res) {
          if (res) {
            var checkSend = reqMsg.substring(0, 12);
            switch (checkSend) {
              case '#sendlearn_L':
                resMsg("#PUSH" + res);

                break;
              case '#sendlearn_F':
                var obj = JSON.parse(res);
                var messageData = {
                  recipient: {
                    id: obj.userId
                  },
                  message: {
                    text: obj.replyMsg[0]
                  }
                };

                callSendAPI(messageData);
                break;
              default:

            }
          }
        });
        break;

      default:
        resMsg(reqMsg);
    }
  } else {
    // return original msg
    resMsg(reqMsg);
  }
}


//train bot
function trainingCommand(msg, res) {
  try {
    msg = msg.replace(/ /g, "");
    msg = msg.replace(/\r?\n|\r/g, "");
    msg = msg.replace("#ถาม", "");
    msg = msg.replace("#ตอบ", ":");
    var msgs = msg.split(":");
    var msgDatas = msgs[0].split(",");
    var replyDatas = msgs[1].split(",");
    msgDatas = JSON.stringify(msgDatas);
    replyDatas = JSON.stringify(replyDatas);
    var data = '{"msg":' + msgDatas + ',"replyMsg":' + replyDatas + '}';
    callParseServerCloudCode("botTraining", data, function (response) {
      console.log(response);
      res(response);
    });
  } catch (err) {
    res(null);
    console.log(err);
  }
}

function sendingCommand(msg, res) {
  try {
    //#sendlearn_L=>' + userId + ':' + messageText + '#reply:
    msg = msg.replace(/ /g, "");
    msg = msg.replace("#sendlearn_F=>", "");
    msg = msg.replace("#sendlearn_L=>", "");
    msg = msg.replace("#reply", "");
    var msgs = msg.split(":");
    var userId = msgs[0];
    var msgDatas = msgs[1].split(",");
    var replyDatas = msgs[2].split(",");
    msgDatas = JSON.stringify(msgDatas);
    replyDatas = JSON.stringify(replyDatas);
    var resMsg = '{"userId":' + userId + ',"replyMsg":' + replyDatas + '}';
    var data = '{"msg":' + msgDatas + ',"replyMsg":' + replyDatas + '}';
    callParseServerCloudCode("botTraining", data, function (response) {
      console.log(response);
      res(resMsg);
    });
  } catch (err) {
    res(null);
    console.log(err);
  }
}

function isBotCommand(msg, res) {
  if (msg.length > 6) {
    if (msg.substring(0, 4) == "#bot") {
      res(true);
    } else {
      res(false);
    }
  } else {
    res(false);
  }
}

function containsAny(str, substrings) {
  for (var i = 0; i != substrings.length; i++) {
    var substring = substrings[i];
    if (str.indexOf(substring) != -1) {
      return substring;
    }
  }
  return null;
}


function badwordFilter(messageText) {
  var messageData = messageText;
  if (messageData != '' || messageData != null) {
    messageData = messageData.replace(/เย็ด/g, 'จุ๊บ');
    messageData = messageData.replace(/เยด/g, 'จุ๊บ');
    messageData = messageData.replace(/เย็ส/g, 'จุ๊บ');
    messageData = messageData.replace(/เยด/g, 'จุ๊บ');
    messageData = messageData.replace(/เยส/g, 'จุ๊บ');
    messageData = messageData.replace(/เย้ด/g, 'จุ๊บ');
    messageData = messageData.replace(/เย้ส/g, 'จุ๊บ');

    messageData = messageData.replace(/ควย/g, 'จู๋');
    messageData = messageData.replace(/หี/g, 'ฉี');
    messageData = messageData.replace(/ดอ/g, 'จู๋');

    messageData = messageData.replace(/เหี้ย/g, '*#$!');
    messageData = messageData.replace(/เหี่ย/g, '*#$!');

    messageData = messageData.replace(/บอด/g, '');

    messageData = messageData.replace(/ยุด/g, '_');
    messageData = messageData.replace(/ยุท/g, '_');
    messageData = messageData.replace(/ยุทธ/g, '_');
    messageData = messageData.replace(/ยุธ/g, '_');

    messageData = messageData.replace(/เงี่ยน/g, 'need');
    messageData = messageData.replace(/เงี่ย/g, 'need');
    messageData = messageData.replace(/เงี้ยน/g, 'need');
    messageData = messageData.replace(/เงียน/g, 'need');

    messageData = messageData.replace(/ชักว่าว/g, 'สาว');
    messageData = messageData.replace(/ชักว้าว/g, 'สาว');

    messageData = messageData.replace(/ตูด/g, 'ก้น');

    messageData = messageData.replace(/กู/g, 'เค้า');
    messageData = messageData.replace(/กุ/g, 'เค้า');

    messageData = messageData.replace(/มึง/g, 'เธอ');
    messageData = messageData.replace(/มิง/g, 'เธอ');
    messageData = messageData.replace(/เมิง/g, 'เธอ');

    messageData = messageData.replace(/สัด/g, 'จุ๊บ');
    messageData = messageData.replace(/สัส/g, 'จุ๊บ');

  }
  return messageData;
}

function testSynonym(messageText2) {
  var messageData2 = messageText2;
  if (messageData2 != '' || messageData2 != null) {
    
    messageData2 = messageData2.replace(/หมา/g, 'สุนัข');
    
  }
  return messageData2;
}

// ------ bot process ------//
