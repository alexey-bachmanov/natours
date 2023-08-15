const nodemailer = require('nodemailer');

module.exports = class Email {
  // Email will be called like this:
  // new Email(user, url).sendWelcome()
  // user is an object, the document pulled from DB
  // url
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.userName.split(' ')[0];
    this.url = url;
    this.from = 'Alexey Bachmanov <alexbachmanov@gmail.com>';
  }
};

const sendEmail = async (options) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // define email options
  const mailOptions = {
    from: 'Alexey Bachmanov <alexbachmanov@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: <!DOCTYPE ...
  };

  // send with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
