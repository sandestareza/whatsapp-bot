const axios = require('axios');
const { API_KEY_OPEN_AI } = require('../config');

const ChatOpenAI = async (text, data) => {

    const cmd = text.split('/');

    if (cmd.length < 2) {
        return data.msg.reply('#CHAT_AI\n\nFormat Salah. ketik *#tanya/pertanyaan kamu*');
    }

    data.msg.reply('sedang diproses, tunggu bentar ya.');

    const question = cmd[1];
    const response = await ChatGPTRequest(question)
    
    if (!response.success) {
        return data.msg.reply('#CHAT_AI\n\nTerjadi kesalahan sistem sedang sibuk. Mohon diulang kembali');
    }

    return data.msg.reply(`#CHAT_AI${response.data}\n\nsemoga membantu, untuk kembali ketik 0`);
}


const ChatGPTRequest = async (text) => {

    const result = {
        success: false,
        data: null,
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        data: {
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 1000,
            temperature: 0
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Language": "in-ID",
            "Authorization": `Bearer ${API_KEY_OPEN_AI}`,
        },
    })
        .then((response) => {
            if (response.status == 200) {
                result.success = true;
                result.data = response?.data?.choices?.[0].text || 'Mohon maaf pertnyaanya kurang jelas, mohon diulang kembali';
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
    ChatOpenAI
}