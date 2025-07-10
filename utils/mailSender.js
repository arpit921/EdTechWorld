const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) =>{

    try{

        // create transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });

        // send mail
        const info = await transporter.sendMail({
            from: 'Arpit Giri',
            to: `${email}`,
            subject: `${title}`,
            html : `${body}`,
        });

        console.log(info);

        return info;
        }

    catch(error){
        console.log('something went wrong while sending mail ', error);
        throw error;
    }

}

module.exports = mailSender;
