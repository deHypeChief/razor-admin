import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASS
  }
});