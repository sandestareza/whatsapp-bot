const fs = require('fs');
const { MessageMedia } = require("whatsapp-web.js");

const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');

const { PUBLIC_KEY_ILPDF, SECRET_KEY_ILPDF } = require('../config');

const api = new ILovePDFApi(PUBLIC_KEY_ILPDF, SECRET_KEY_ILPDF);

const waiting = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const ConvertPdf = async (data) => {    

    if (data.msg.hasMedia) {
        if (data.msg.type != 'document') {
            return waiting(800).then(() => {
                return data.msg.reply('#CONVERT_PDF\n\nhanya bisa edit dengan format docx atau pptx.');
            });
        }

        data.msg.reply('sedang diproses, mohon unutk menunggu.');        

        const media = await data.msg.downloadMedia(); 
        fs.writeFileSync("public/assets/newFile.docx", media.data, { encoding: 'base64'});

        if (media) {
            const newFile = await reqApicompresPdf()
            
            if (!newFile.success) {
                return waiting(800).then(() => {
                    return data.msg.reply('#CONVERT_PDF\n\nTerjadi kesalahan. Mohon diulang kembali');
                });
               
            }
            
            const chat = await data.msg.getChat();
            const path = "public/assets/newFileConvert.pdf";
            const file = MessageMedia.fromFilePath(path);
            
            await chat.sendMessage(file);

            return waiting(800).then(() => {
                return data.msg.reply('#CONVERT_PDF\n\nini hasilnya, terima kasih\n\nuntuk kembali ketik 0');
            });
            
        }
    }
    

    return waiting(800).then(() => {
        return data.msg.reply('#CONVERT_PDF\n\nsilahkan kirim file bertipe docx atau pptx');
    });
}

const reqApicompresPdf = async () => {

    const result = {
        success: false,
        base64: null,
        message: "",
    }

    try {

        const path = './public/assets/newFile.docx';
        const file = new ILovePDFFile(path)

        let task = api.newTask('officepdf');

        await task.start();
        await task.addFile(file);
        await task.process();

        const data = await task.download();
        fs.writeFileSync("public/assets/newFileConvert.pdf", data, { encoding: 'base64'});
        result.success = true;
        result.base64 = data;

        return result;
        
    } catch (error) {
        result.message = "Error : " + error.message;
        return result;
    }

}

module.exports = {
    ConvertPdf
}
