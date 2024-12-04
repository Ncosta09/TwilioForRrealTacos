const express = require('express');
require('dotenv').config();
const twilio = require('twilio');

const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(express.json());
app.use(express.static('public'));

const verificationCodes = {};
const defaultPhone = '+541151019149';

// Ruta para enviar el código
app.post('/send-code', async (req, res) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[defaultPhone] = code;

    try {
        await client.messages.create({
            body: `Tu código de verificación es: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: defaultPhone
        });
        res.json({ success: true, message: 'Código enviado por SMS.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ruta para verificar el código
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;

    if (verificationCodes[defaultPhone] === code) {
        delete verificationCodes[defaultPhone];
        res.json({ success: true, message: 'Código verificado correctamente.' });
    } else {
        res.status(400).json({ success: false, message: 'Código incorrecto o expirado.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});