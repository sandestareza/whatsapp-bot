const qrcode = require('qrcode-terminal');
const Bot = require('./bot');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
		args: ['--no-sandbox'],
	}
});
 

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('INFO [WA] : Client is ready!');
});

client.on('message', async msg => {

    const chats = await msg.getChat();

    if (chats.isGroup || msg.type === 'group_notification') {
        console.log("INFO [WA] : CHAT GROUP OR OTHER");
        
        return false;
    }

    chats.fetchMessages({
        limit: 50
    }).then(async (messages) => {
        
        let stepReg = 0;
        let recordChat = {};
        let answers = "";
        let lastAnswer = "";
        let oldTimeStamp = 0;
        
        messages.forEach((element) => {

            let msg = element;

            if (msg.body === "BOT") {
                recordChat = {};
            }

            if (msg.body !== '') {
                msgBefore = msg.body.split(/[\r\n]+/);
                
                if (oldTimeStamp != msg.timestamp) {
                    oldTimeStamp = msg.timestamp;
                    lastAnswer = msgBefore[0];
                } else {
                    recordChat[stepReg] = lastAnswer
                }

                // Is Chat From Bot ?
                if (!msg.id.fromMe) {
                    recordChat[stepReg] = answers = msg.body;
                } else {
                    msgBefore = msg.body.split(/[\r\n]+/);
                    stepReg = msgBefore[0];                    
                }

                if (msg.id.remote === 'status@broadcast') {
                    console.log("INFO [WA] : STATUS BROADCAST");

                    return false;
                }
            }
        });


        let menu = [
            {
                choice : 1,
                title : 'Hapus Background Foto',
                guide : 'Cara menggunkannya silahkan kirim gambar bertipe JPG, JPEG, atau PNG kemudian ketik *#remove_bg*',
                step : '#REMOVE_BG'
            },
            {
                choice : 2,
                title : 'Ubah File ke PDF',
                guide : 'Cara menggunkannya silahkan kirim file bertipe docx atau pptx',
                step : '#CONVERT_PDF'
            },
            {
                choice : 3,
                title : 'Tanya-tanya',
                guide : 'Cara menggunkannya silahkan ketik *#tanya/pertnyaan kamu*',
                step : '#CHAT_AI'
            },
            {
                choice : 4,
                title : 'Audio Quran',
                guide : 'Cara menggunkannya silahkan ketik *#audio_quran* untuk melihat daftar surah',
                step : '#AUDIO_QURAN'
            },

        ];

        

        let dataStep = {
            msg: msg,
            recordChat: recordChat,
            menu : menu,
        };
        
        if (stepReg == 0 || answers === "BOT" || answers === "0") {
            
            return Bot.step1(dataStep);
        }

        if (stepReg == '#MENU') {
            
            return Bot.step2(dataStep);
            
        }

        if (stepReg == '#REMOVE_BG') {
            
            return Bot.step3(dataStep);
            
        }

        if (stepReg == '#CONVERT_PDF') {
            
            return Bot.step4(dataStep);
            
        }

        if (stepReg == '#CHAT_AI') {
            
            return Bot.step5(dataStep);
            
        }

        if (stepReg == '#AUDIO_QURAN') {
            
            return Bot.step6(dataStep);
            
        }

        if (stepReg == '#AUDIO_QURAN_LIST') {
            
            return Bot.step7(dataStep);
            
        }


        return msg.reply(`#BOT\n\nSelamat Datang di Whatsapp Bot. Untuk memulai silahkan Ketik *BOT*`);

    })
});

client.on('disconnected', () => {

    console.log('INFO [WA] : Client was logged out');
});
 

client.initialize();
