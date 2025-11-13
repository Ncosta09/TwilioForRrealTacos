const API_BASE = window.location.origin;
const NEXT_PATH = "/";

const sendCodeButton = document.getElementById('sendCodeButton');
const validationFields = document.getElementById('validationFields');
const messageElement = document.getElementById('message');
const codeInput = document.getElementById('code');

const phoneNumber = '+1 404 287 1832';

sendCodeButton.addEventListener('click', async () => {
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = 'Enviado...';
    validationFields.style.display = 'block';

    // Enviar el código de verificación al número predeterminado
    try {
        const response = await fetch(`${API_BASE}/send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phoneNumber }),
        });

        const data = await response.json();

        if (data.success) {
            messageElement.textContent = 'Código enviado, ingresa el código recibido para validar.';
        } else {
            messageElement.textContent = 'Hubo un problema al enviar el código. Intenta de nuevo.';
            validationFields.style.display = 'none';
        }
    } catch (error) {
        messageElement.textContent = 'Error al enviar el código. Intenta de nuevo.';
        validationFields.style.display = 'none';
    }

    // Bloquear el botón
    setTimeout(() => {
        sendCodeButton.disabled = false;
        sendCodeButton.textContent = 'Enviar código';
    }, 30000); // 30000 milisegundos = 30 segundos
});

// Manejar la validación del código
document.getElementById('verificationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = codeInput.value;

    // Enviar la solicitud de validación
    try {
        const response = await fetch(`${API_BASE}/verify-code?next=${encodeURIComponent(NEXT_PATH)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phoneNumber, code }),
        });

        const data = await response.json();

        if (data.success && data.grant_url) {
            // Redirigir a otra página
            window.location.href = data.grant_url;
        } else {
            messageElement.textContent = 'Código incorrecto o expirado.';
        }
    } catch (error) {
        messageElement.textContent = 'Error al verificar el código. Intenta de nuevo.';
    }
});