import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import 'dotenv/config'

// Konfigurasi transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // Ganti dengan host SMTP Anda
    port: process.env.MAIL_PORT, // Port SMTP (587 untuk TLS, 465 untuk SSL, 25 untuk tanpa enkripsi)
    secure: process.env.MAIL_ENCRYPTION, // true untuk 465, false untuk lainnya
    auth: {
        user: process.env.MAIL_USERNAME, // Ganti dengan email Anda
        pass: process.env.MAIL_PASSWORD // Ganti dengan password email Anda
    }
} as SMTPTransport.Options);

// Fungsi untuk mengirim email
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // Ganti dengan nama dan email Anda
        to: to,
        subject: subject,
        text: text,
        html: html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};