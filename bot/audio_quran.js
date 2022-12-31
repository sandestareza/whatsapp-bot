const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const waiting = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const AudioQuran = async (idSurah, data) => {

    if (idSurah > '114') {
        return waiting(800).then(() => {
            return data.msg.reply('#AUDIO_QURAN_LIST\n\nMohon maaf tidak ada pilihan yang sesuai. Mohon diulang kembali');
        });
        
    }

    data.msg.reply('sedang diproses, tunggu bentar ya.');
    
    const baseUrl = `https://api.quran.com/api/v4/chapter_recitations/7/${idSurah}`;
    const response = await ApiQuranRequest(baseUrl);
    
    const audio = response.data.data.audio_file.audio_url;
    
    const media = await MessageMedia.fromUrl(audio);
    
    if (!response.success) {
        return data.msg.reply('#AUDIO_QURAN_LIST\n\nTerjadi kesalahan sistem sedang sibuk. Mohon diulang kembali');
    }
    
    const chat = await data.msg.getChat();
    await chat.sendMessage(media);
    
    return waiting(800).then(() => {
        return data.msg.reply(`#AUDIO_QURAN_LIST\n\nini hasilnya, terima kasih\n\nuntuk kembali ketik 0`);
    });
}

const ListAudioQuran = async (text, data) => {

    if (text !== '#audio_quran') {
        return waiting(800).then(() => {
            return data.msg.reply('#AUDIO_QURAN\n\nformat Salah. ketik *#audio_quran*');
        });
        
    }

    data.msg.reply('sedang diproses, tunggu bentar ya.');

    const baseUrl = `https://api.quran.com/api/v4/chapters?language=id`
    
    const response = await ApiQuranRequest(baseUrl)

    if (!response.success) {
        return data.msg.reply('#AUDIO_QURAN\n\nTerjadi kesalahan sistem sedang sibuk. Mohon diulang kembali');
    }

    return response.data

}


const ApiQuranRequest = async (baseUrl) => {
    
    const result = {
        success: false,
        data: null,
        message: "",
    }

    return await axios({
        method: 'get',
        url: baseUrl,
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip,deflate,compress"
        }
    })
        .then((response) => {

            if (response.status == 200) {
                result.success = true;
                result.data = response;
            } else {
                result.message = "Failed response";
            }

            return result;
        })
        .catch((error) => {
            console.log(error);
            result.message = "Error : " + error.message;
            return result;
        });
}

module.exports = {
    AudioQuran,
    ListAudioQuran
}