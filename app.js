const express = require('express');
require('dotenv').config();
const twilio = require('twilio');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const FRONT_ALLOWED_ORIGIN = '*'; // en prod: "https://twilioforrrealtacos.onrender.com"
const verificationCodes = {};
const defaultPhone = '+1 404 287 1832';
const OTP_TTL_SECONDS = 2 * 60;      // 2 min de vida del OTP (opcional)
const GRANT_TTL_SECONDS = 30 * 60;   // 30 min de acceso en WP
const WP_DOMAIN = 'https://tacosuniversity.com'; // WP de destino

// Configurar CORS
app.use(cors({
    origin: '*', // Permitir todos los orígenes. Cambia esto a tu dominio específico en producción.
    methods: ['GET', 'POST'], // Métodos permitidos.
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos.
}));


app.use(express.json());
app.use(express.static('public'));

// Generar token firmado (base64url) para WP (/otp-grant)
function makeGrantToken(phone, ttlSeconds = GRANT_TTL_SECONDS) {

    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    const payload = `${phone}|${exp}`;
    const sig = crypto.createHmac('sha256', process.env.OTP_SHARED_SECRET).update(payload).digest('hex');

    return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

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

        const grant_token = makeGrantToken(defaultPhone);
        const nextParam = (req.query.next && typeof req.query.next === 'string') ? req.query.next : '/';
        const grant_url = `${WP_DOMAIN}/otp-grant?token=${encodeURIComponent(grant_token)}&next=${encodeURIComponent(nextParam)}`;

        res.json({ success: true, message: 'Código verificado correctamente.', grant_token, grant_url });
    } else {
        res.status(400).json({ success: false, message: 'Código incorrecto o expirado.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});