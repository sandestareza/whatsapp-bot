const { ConvertPdf } = require('./convert_pdf');
const { RemoveBg } = require('./bg_remove');
const { ChatOpenAI } = require('./open_ai');
const { ListAudioQuran, AudioQuran } = require('./audio_quran');

const waiting = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

module.exports = {

    // START 'BOT'
    step1: async function (data) {

        let firstChat = `#MENU\n\nSilahkan pilih menu dibawah ini:`;
        data.menu.forEach(value => {
            firstChat +=  `\n${value.choice}. ${value.title}`;
        });
        
        return waiting(800).then(() => {
            return data.msg.reply(firstChat);
        });
    },

    // PILIHAN MENU
    step2: async function (data) {
        reg1Choice = data.recordChat['#MENU'];
        let serviceChoice = await data.menu.find(({
            choice
        }) => choice == reg1Choice);
        
        if (reg1Choice === 0 || !serviceChoice) {
            return waiting(800).then(() => {
                return data.msg.reply('#MENU\n\nPilihan yang anda inputkan tidak ada, silahkan coba lagi');
            });
        }

        return waiting(800).then(() => {
            return data.msg.reply(`${serviceChoice.step}\n\nAnda memilih menu ${serviceChoice.title}\n${serviceChoice.guide} \n\n Untuk kembali ketik 0`);
        });
    },

    // MENU 'REMOVE_BG'
    step3: async function (data) {

        try {
            
            reg1Choice = data.recordChat['#MENU'];
            reg2Choice = data.recordChat['#REMOVE_BG'];

            if (!reg1Choice) {
                return this.step1(data);
            } 

            await RemoveBg(reg2Choice, data);

            
            
            
        } catch (error) {
            console.log(error.message);
            return waiting(800).then(() => {
                return data.msg.reply(`#REMOVE_BG\n\nTerjadi Kesalahan, Mohon dipilih kembali`);
            });
        }
        
    },

    // MENU 'CONVERT_PDF'
    step4: async function (data) {

        try {
            
            reg1Choice = data.recordChat['#MENU'];
            reg2Choice = data.recordChat['#CONVERT_PDF'];

            if (!reg1Choice) {
                return this.step1(data);
            } 

            await ConvertPdf(data);                        
            
        } catch (error) {
            console.log(error.message);
            return waiting(800).then(() => {
                return data.msg.reply(`#CONVERT_PDF\n\nTerjadi Kesalahan, Mohon dipilih kembali`);
            });
        }
        
    },

    // MENU 'CHAT_AI'
    step5: async function (data) {

        try {
            
            reg1Choice = data.recordChat['#MENU'];
            reg2Choice = data.recordChat['#CHAT_AI'];

            if (!reg1Choice) {
                return this.step1(data);
            } 

            await ChatOpenAI(reg2Choice, data);                        
            
        } catch (error) {
            console.log(error.message);
            return waiting(800).then(() => {
                return data.msg.reply(`#CHAT_AI\n\nTerjadi Kesalahan, Mohon dipilih kembali`);
            });
        }
        
    },

    // MENU 'AUDIO_QURAN'
    step6: async function (data) {

        try {
            
            reg1Choice = data.recordChat['#MENU'];
            reg2Choice = data.recordChat['#AUDIO_QURAN'];

            if (!reg1Choice) {
                return this.step1(data);
            } 

            const result = await ListAudioQuran(reg2Choice, data);
            
            if (result.data.chapters.length) {
                
                let listSurah = `#AUDIO_QURAN_LIST\n\nSilahkan pilih surat dibawah ini:`;
    
                result.data.chapters.forEach(value => {
                    listSurah +=  `\n${value.id}. ${value.name_simple} (${value.translated_name.name})`;
                });
                
                return waiting(800).then(() => {
                    return data.msg.reply(listSurah);
                });
            }
            
        } catch (error) {
            console.log(error.message);
            return waiting(800).then(() => {
                return data.msg.reply(`#AUDIO_QURAN\n\nTerjadi Kesalahan, Mohon dipilih kembali`);
            });
        }
        
    },

    // MENU 'AUDIO_QURAN_LIST'
    step7: async function (data) {

        try {
            
            reg1Choice = data.recordChat['#MENU'];
            reg2Choice = data.recordChat['#AUDIO_QURAN_LIST'];

            if (!reg1Choice) {
                return this.step1(data);
            } 

            await AudioQuran(reg2Choice, data);                        
            
        } catch (error) {
            console.log(error.message);
            return waiting(800).then(() => {
                return data.msg.reply(`#AUDIO_QURAN_LIST\n\nTerjadi Kesalahan, Mohon dipilih kembali`);
            });
        }
        
    },

}