const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  // Email will be called like this:
  // new Email(user, url).sendWelcome()
  // user is an object, the document pulled from DB
  // url
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.userName.split(' ')[0];
    this.url = url;
    this.from = `Alexey Bachmanov <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // create a transporter for sendgrid
      return null;
    }
    // otherwise, create transporter for mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // all the email sending logic goes here
    // render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject,
      }
    );
    const text = htmlToText.convert(html);

    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: text,
    };

    // create a transport and send
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    // call send() with the welcome template
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    // call send() with the password reset template
    await this.send(
      'passwordReset',
      'Natours password reset (valid for 10 minutes)'
    );
  }
};
