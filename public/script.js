const sendCodeButton = document.getElementById('sendCodeButton');
const validationFields = document.getElementById('validationFields');
const messageElement = document.getElementById('message');
const codeInput = document.getElementById('code');

const phoneNumber = '+541151019149';

sendCodeButton.addEventListener('click', async () => {
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = 'Enviado...';
    validationFields.style.display = 'block';

    // Enviar el código de verificación al número predeterminado
    try {
        const response = await fetch('/send-code', {
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
        const response = await fetch('/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phoneNumber, code }),
        });

        const data = await response.json();

        if (data.success) {
            // Redirigir a otra página
            window.location.href = 'https://rrealtacos.com/';
        } else {
            messageElement.textContent = 'Código incorrecto o expirado.';
        }
    } catch (error) {
        messageElement.textContent = 'Error al verificar el código. Intenta de nuevo.';
    }
});