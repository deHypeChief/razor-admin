import Elysia from "elysia";
import { transporter } from "../configs/nodemail.config";

export const sendMail = (app: Elysia) =>
  app
    .derive(async function handler({ set }) {
      function mailConfig(to: string, subject: string, html: string) {
        const mailOptions = {
          from: `Email Send Test ${process.env.MAIL}`,
          to,
          subject,
          html,
        };

        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            set.status = 400
          } else {
            console.log('Email sent successfully:', info.response);
            set.status = 200
          }
        });
      }

      function generateEmail(payload?: { title: string; content: string; }): string {
        return `Email Test ${payload || "no payload"}`
      }

      return {
        mailConfig,
        generateEmail
      }
    })

    // can be used with bothr admin and user


