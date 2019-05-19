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
app.get('/policy', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/policy.html'));
});
app.get('/bot-train', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/bottrain.html'));
});
app.get('/synonym', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/synonym.html'));
});
app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/test.html'));
});
app.get('/json-upload-to-parse', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/json-upload-to-parse.html'));
});
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
                }, {
                    type: "sticker",
                    packageId: "2",
                    stickerId: "22"
                }]);
                break;
            /////////////////////
            case '#คำพ้องความหมาย':
            case '#คำพ้อง':
            case '#synonym':
                line_client.replyMessage(event.replyToken, [{
                    type: "template",
                    altText: "Synonym",
                    template: {
                        type: "buttons",
                        title: "เพิ่มคำพ้องความหมาย",
                        text: "แค่กดปุ่มด้านล่าง",
                        actions: [{
                            "type": "uri",
                            "label": "เพิ่มคำพ้องความหมาย",
                            "uri": "https://myhealthbot.herokuapp.com/synonym"
                        }]
                    }
                }]);
                break;

            /////////////////////
            case 'สอนน้องบอทพูด':
            case 'เพิ่มประโยคสนทนา':
            case 'เพิ่มการพูดคุย':
            case 'สอนบอท':
            case 'เพิ่มข้อความ':
            case 'เพิ่มการพูด':
            case '#เพิ่ม':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "สามารถเพิ่มประโยคสนทนาได้ด้วยวิธีการดังนี้",
                }, {
                    type: "image",
                    originalContentUrl: "https://myhealthbot.herokuapp.com/assets/Guide-1.png",
                    previewImageUrl: "https://myhealthbot.herokuapp.com/assets/Guide-1.png",
                    animated: false,
                }, {
                    type: "template",
                    altText: "วิธีเพิ่มประโยคสนทนา",
                    template: {
                        type: "buttons",
                        title: "เพิ่มประโยคสนทนา",
                        text: "วิธีง่ายๆแค่กดปุ่มด้านล่าง",
                        actions: [{
                            "type": "uri",
                            "label": "เพิ่มประโยคสนทนา",
                            "uri": "https://myhealthbot.herokuapp.com/bot-train"
                        }]
                    }
                }
                ]);
                break;
            /////////////////
            case 'วิเคราะห์โรค':
            case 'รู้สึกป่วย':
            case 'ตรวจสอบอาการโรค':
            case 'วิเคราะห์โรคเบื้องต้น':
            case 'ป่วย':
            case 'ไม่มีน้ำมูก':
            case '#ป่วย':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "สามารถพิมพ์บอกอาการของโรคเพื่อวิเคราะห์ความน่าจะเป็นในการเกิดโรคหรืออยากทราบอาการของโรคนั้น ๆ ได้โดยการกดเลือกเมนู",
                }, {
                    type: "template",
                    altText: "this is a carousel template",
                    template: {
                        type: "carousel",
                        actions: [],
                        columns: [
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "ไข้หวัด",
                                        text: "ไข้หวัด"
                                    },
                                    {
                                        type: "message",
                                        label: "ไข้หวัดใหญ่",
                                        text: "ไข้หวัดใหญ่"
                                    },
                                    {
                                        type: "message",
                                        label: "วัณโรค",
                                        text: "วัณโรค"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "เอ็นฝ่าเท้าอักเสบ",
                                        text: "เอ็นฝ่าเท้าอักเสบ"
                                    },
                                    {
                                        type: "message",
                                        label: "นิ้วล๊อค",
                                        text: "นิ้วล๊อค"
                                    },
                                    {
                                        type: "message",
                                        label: "ไข้เลือดออก",
                                        text: "ไข้เลือดออก"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "เบาหวาน",
                                        text: "เบาหวาน"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคกระเพาะอาหาร",
                                        text: "โรคกระเพาะอาหาร"
                                    },
                                    {
                                        type: "message",
                                        label: "ความดันโลหิตสูง",
                                        text: "ความดันโลหิตสูง"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "อาหารเป็นพิษ",
                                        text: "อาหารเป็นพิษ"
                                    },
                                    {
                                        type: "message",
                                        label: "อีสุกอีไส",
                                        text: "อีสุกอีไส"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคภูมิแพ้",
                                        text: "โรคภูมิแพ้"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "ปอดอักเสบ(ปอดบวม)",
                                        text: "ปอดอักเสบ(ปอดบวม)"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคหลอดเลือดหัวใจ",
                                        text: "โรคหลอดเลือดหัวใจ"
                                    },
                                    {
                                        type: "message",
                                        label: "ลมพิษ",
                                        text: "ลมพิษ"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "กรดไหลย้อน",
                                        text: "กรดไหลย้อน"
                                    },
                                    {
                                        type: "message",
                                        label: "เจ็บคอ",
                                        text: "เจ็บคอ"
                                    },
                                    {
                                        type: "message",
                                        label: "ไส้ติ่งอักเสบ",
                                        text: "ไส้ติ่งอักเสบ"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคหลอดเลือดหัวใจ",
                                        text: "โรคหลอดเลือดหัวใจ"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคไวรัสตับอักเสบ B",
                                        text: "โรคไวรัสตับอักเสบ B"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคหลอดเลือดสมอง",
                                        text: "โรคหลอดเลือดสมอง"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "ไทรอยด์",
                                        text: "ไทรอยด์"
                                    },
                                    {
                                        type: "message",
                                        label: "ปอดอุดกั้นเรื้อรัง",
                                        text: "โรคปอดอุดกั้นเรื้อรัง"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคหัวใจ",
                                        text: "โรคหัวใจ"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคลมพิษ",
                                        text: "โรคลมพิษ"
                                    },
                                    {
                                        type: "message",
                                        label: "ซิฟิลิส",
                                        text: "ซิฟิลิส"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคขาดวิตามินซี",
                                        text: "โรคขาดวิตามินซี"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคหนองในแท้",
                                        text: "โรคหนองในแท้"
                                    },
                                    {
                                        type: "message",
                                        label: "เบาจืด",
                                        text: "เบาจืด"
                                    },
                                    {
                                        type: "message",
                                        label: "ทอนซิลอักเสบ",
                                        text: "ทอนซิลอักเสบ"
                                    }
                                ]
                            }
                        ]
                    }
                }, {
                    type: "template",
                    altText: "this is a carousel template",
                    template: {
                        type: "carousel",
                        actions: [],
                        columns: [
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "สีน้ำมูกบอกโรค",
                                        text: "สีน้ำมูกบอกโรค"
                                    },
                                    {
                                        type: "message",
                                        label: "ไซนัสอักเสบ",
                                        text: "ไซนัสอักเสบ"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคเกาต์",
                                        text: "โรคเกาต์"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคหอบหืด",
                                        text: "โรคหอบหืด"
                                    },
                                    {
                                        type: "message",
                                        label: "อหิวาตกโรค",
                                        text: "อหิวาตกโรค"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคฉี่หนู",
                                        text: "โรคฉี่หนู"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคหัด",
                                        text: "โรคหัด"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคซาส์",
                                        text: "โรคซาส์"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคบาดทะยัก",
                                        text: "โรคบาดทะยัก"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคปากนกกระจอก",
                                        text: "โรคปากนกกระจอก"
                                    },
                                    {
                                        type: "message",
                                        label: "ภาวะเกล็ดเลือดต่ำ",
                                        text: "ภาวะเกล็ดเลือดต่ำ"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคริดสีดวงทวาร",
                                        text: "โรคริดสีดวงทวาร"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "โรคกรวยไตอักเสบ",
                                        text: "โรคกรวยไตอักเสบ"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคน้ำในหูไม่เท่ากัน",
                                        text: "โรคน้ำในหูไม่เท่ากัน"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคพิษสุนัขบ้า",
                                        text: "โรคพิษสุนัขบ้า"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "ถุงลมโป่งพอง",
                                        text: "ถุงลมโป่งพอง"
                                    },
                                    {
                                        type: "message",
                                        label: "โรคสะเก็ดเงิน",
                                        text: "โรคสะเก็ดเงิน"
                                    },
                                    {
                                        type: "message",
                                        label: "เริม",
                                        text: "เริม"
                                    }
                                ]
                            },
                            {
                                thumbnailImageUrl: "https://myhealthbot.herokuapp.com/img/disease_1.jpg",
                                text: "เพียงเลือกโรคด้านล่างเพื่อทราบข้อมูลอาการเบื้องต้น",
                                actions: [
                                    {
                                        type: "message",
                                        label: "หนองในเทียม",
                                        text: "หนองในเทียม"
                                    },
                                    {
                                        type: "message",
                                        label: "ตากุ้งยิง",
                                        text: "ตากุ้งยิง"
                                    },
                                    {
                                        type: "message",
                                        label: "กระเพาะปัสสาวะอักเสบ",
                                        text: "กระเพาะปัสสาวะอักเสบ"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    type: "template",
                    altText: "this is a buttons template",
                    template: {
                        type: "buttons",
                        actions: [
                            {
                                type: "message",
                                label: "บอกสีน้ำมูกกับเรา",
                                text: "วิเคราะห์สีน้ำมูก"
                            },
                            {
                                type: "message",
                                label: "ไม่มีน้ำมูก",
                                text: "ไม่มีน้ำมูก"
                            }
                        ],
                        title: "คุณมีน้ำมูกไหม",
                        text: "ลองใช้สีของน้ำมูกทำนายความเสี่ยงสิ"
                    }
                }
                ]);
                break;
            ///////////////////////
            ///////////////////////
            case 'น้ำมูก':
            case 'มีน้ำมูก':
            case 'สีน้ำมูกบอกโรค':
            case 'วิเคราะห์สีน้ำมูก':
                line_client.replyMessage(event.replyToken, [{
                    type: "imagemap",
                    baseUrl: "https://myhealthbot.herokuapp.com/img/imagemap.jpg#",
                    altText: "This is an imagemap",
                    baseSize: {
                        width: 1040,
                        height: 520
                    },
                    actions: [
                        {
                            type: "message",
                            area: {
                                x: 0,
                                y: 4,
                                width: 260,
                                height: 256
                            },
                            text: "น้ำมูกสีใส"
                        },
                        {
                            type: "message",
                            area: {
                                x: 262,
                                y: 7,
                                width: 260,
                                height: 248
                            },
                            text: "น้ำมูกสีเทา"
                        },
                        {
                            type: "message",
                            area: {
                                x: 525,
                                y: 5,
                                width: 255,
                                height: 250
                            },
                            text: "น้ำมูกสีเหลือง"
                        },
                        {
                            type: "message",
                            area: {
                                x: 784,
                                y: 9,
                                width: 254,
                                height: 511
                            },
                            text: "น้ำมูกสีเขียว"
                        },
                        {
                            type: "message",
                            area: {
                                x: 520,
                                y: 256,
                                width: 258,
                                height: 262
                            },
                            text: "น้ำมูกสีขาว"
                        },
                        {
                            type: "message",
                            area: {
                                x: 262,
                                y: 258,
                                width: 256,
                                height: 262
                            },
                            text: "น้ำมูกสีแดง"
                        },
                        {
                            type: "message",
                            area: {
                                x: 0,
                                y: 257,
                                width: 262,
                                height: 263
                            },
                            text: "น้ำมูกสีดำ"
                        }
                    ]
                }]);
                break;
            ////////////////////// 
            case 'help':
            case 'Help':
            case '#help':
            case '#Help':
            case 'วิธีการใช้งาน':
            case 'ขอความช่วยเหลือ':
            case 'ช่วยเหลือ':
            case 'ช่วยด้วย':
            case 'ช่วย':
            case '#ช่วย':
            case '#ช่วยหน่อย':
                line_client.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "ยินดีต้อนรับเข้าสู่เมนูช่วยเหลือ\n\nท่านสามารถเลือกเมนูได้จากปุ่มเมนูหรือสามารถพิมพ์การสนทนาทั่วไปได้เลย \n\nในการเพิ่มประโยคสนทนา ท่านสามารถกดปุ่มด้านล่าง หรือพิมพ์ตามตัวอย่างดังนี้\n#ถาม สวัสดี #ตอบ ว่ายังไงครับ\n\n บอทมี 4 เมนูด้วยกัน ได้แก่\nคำนวณแคลอรี่\nวิเคราะห์โรคเบื้องต้น\nเพิ่มประโยคสนทนา\nเมนูวิธีการใช้งาน\n\n ผู้ใช้สามารถเลือกได้ที่เมนูเลยครับ",
                },
                {
                    type: "text",
                    text : "ข้อแนะนำในการเข้าเมนูด่วน\nหากต้องการเข้า\nเมนูตรวจสอบปริมาณแคลอรี่ให้พิมพ์ #อาหาร\nเมนูวิเคราะห์โรคให้พิมพ์ #ป่วย\nเมนูเพิ่มประโยคสนทนาให้พิมพ์ #เพิ่ม\nเมนูช่วยเหลือให้พิมพ์ #ช่วย"
                }]);
                break;

            ////////
            default:
                var messageText = event.message.text;
                _reply.processMessage(messageText, function (responseMsg) {
                    if (responseMsg == messageText) {
                        _reply.callCloudCode("getReplyMsg", '{"msg":"' + messageText + '"}', function (response) {
                            if (response == "") {
                                        line_client.replyMessage(event.replyToken, [{
                                            type: "text",
                                            text: "บอทยังไม่เข้าใจสิ่งที่คุณพูด กรุณาตรวจสอบประโยคอีกครั้ง หรือบอทอาจจะยังไม่มีคำตอบในระบบ"
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