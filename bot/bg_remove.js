const axios = require('axios');
const { API_KEY_RM_BG } = require('../config');

const waiting = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const RemoveBg = async (text, data) => {
    
    if (text !== '#remove_bg') {
        return waiting(800).then(() => {
            return data.msg.reply('#REMOVE_BG\n\nformat Salah. ketik *#remove_bg*');
        });
        
    }

    if (data.msg.hasMedia) {
        if (data.msg.type != 'image') {
            return waiting(800).then(() => {
                return data.msg.reply('#REMOVE_BG\n\nhanya bisa edit dengan format gambar');
            });
        }

        data.msg.reply('sedang diproses, mohon untuk menunggu.');

        const media = await data.msg.downloadMedia();

        if (media) {
            const newPhoto = await reqAPIRemoveBg(media.data)

            if (!newPhoto.success) {
                return waiting(800).then(() => {
                    return data.msg.reply('#REMOVE_BG\n\nTerjadi kesalahan. Mohon diulang kembali');
                });
               
            }

            const chat = await data.msg.getChat();
            media.data = newPhoto.base64;
            return waiting(800).then(() => {
                return chat.sendMessage(media, { caption: `#REMOVE_BG\n\nini hasilnya, terima kasih\n\nuntuk kembali ketik 0` })
            });
            
        }
    }

    return waiting(800).then(() => {
        return data.msg.reply('#REMOVE_BG\n\nharus kirim gambarnya terlebih dahulu.');
    });

}

const reqAPIRemoveBg = async (base64) => {

    const result = {
        success: false,
        base64: null,
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: {
            image_file_b64: base64,
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY_RM_BG,
        },
    })
        .then((response) => {
            if (response.status == 200) {
                result.success = true;
                result.base64 = response.data.data.result_b64
            } else {
                result.message = "Failed response";
            }

            return result;
        })
        .catch((error) => {
            result.message = "Error : " + error.message;
            return result;
        });
}


module.exports = {
    RemoveBg
}