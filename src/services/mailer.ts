import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import 'dotenv/config'
import AppDataSource from '../config/ormconfig'
import { Setting } from '../modules/setting/models/setting.entity'

// Fungsi untuk mengirim email
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    const settingQuery = await AppDataSource.getRepository(Setting).find()
    const setting = settingQuery[0]
    // Konfigurasi transporter
    const transporter = nodemailer.createTransport({
        host: setting.mail_host, // Ganti dengan host SMTP Anda
        port: setting.mail_port, // Port SMTP (587 untuk TLS, 465 untuk SSL, 25 untuk tanpa enkripsi)
        secure: false, // true untuk 465, false untuk lainnya
        auth: {
            user: setting.mail_username, // Ganti dengan email Anda
            pass: setting.mail_password // Ganti dengan password email Anda
        }
    } as SMTPTransport.Options)
    const mailOptions = {
        from: `"${setting.mail_from_name}" <${setting.mail_from_address}>`, // Ganti dengan nama dan email Anda
        to: to,
        subject: subject,
        text: text,
        html: html,
    }
    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ' + info.response)
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}