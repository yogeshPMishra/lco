const nodemailer = require("nodemailer");

const mailHelper = async (mailOptions) =>{
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const message = {
        from: 'ali.nausat97@gmail.com', // sender address
        to: mailOptions.toEmail, // list of receivers
        subject: mailOptions.subject, // Subject line
        text: mailOptions.text_message, // plain text body
        html: mailOptions.text_message, // html body
      }
    
      // send mail with defined transport object
      await transporter.sendMail(message);
}

module.exports = mailHelper