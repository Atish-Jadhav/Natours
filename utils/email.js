const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');


module.exports = class Email {
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Atish Jadhav <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            // Sendgrid for Real emails
            return nodemailer.createTransport({
                service : 'SendGrid',
                auth : {
                    user : process.env.SENDGRID_USERNAME,
                    pass : process.env.SENDGRID_PASSWORD
                }
            });
        }

        // When in development, send emails to your own inbox to verify if working
        return nodemailer.createTransport({
            host : process.env.EMAIL_HOST,
            port : process.env.EMAIL_PORT,
            auth : {
                user : process.env.EMAIL_USERNAME,
                pass : process.env.EMAIL_PASSWORD
            }
        });
        // return 1;
    }

    async send(template, subject) {
        // Send the actual email

        // 1) Render HTML based on pug template
        // This will take in the file and render the pug code into real HTML
        const templatePath = path.join(__dirname, '../views/emails', `${template}.pug`);
        const html = pug.renderFile(templatePath, {
            firstName : this.firstName,
            url : this.url,
            subject : subject
        });

        // 2) Define email options
        const mailOptions = {
            from : this.from,
            to : this.to, //options here is the one we are passing above into the function above
            subject : subject, //From send function
            html : html, //From above
            // In text, contains the same message as in html but in simple text without any formatting.
            text : htmlToText.convert(html)
        }

        // 3) Create a transport and send a email       
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }

}

