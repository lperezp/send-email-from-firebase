import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const corsHandler = cors({ origin: true });


const sendEmail = async (email: string) => {
    try {
        const data = {
            'to': email,
            'message': {
                'subject': 'Asunto del correo',
                'text': 'Texto del correo',
                'html': `<p>Hello World!</p>`,
            }
        }
        const emailRef = db.collection('email');
        await emailRef.add(data);
    } catch (error) {
        throw new Error("Ocurrió un error al enviar el correo");
    }
}

exports.register = functions.https.onRequest(async (request, response) => {
    try {
        corsHandler(request, response, async () => {
            const usersRef = db.collection('users');
            const { email } = request.body;
            await usersRef.doc(email).set(request.body);
            const resp = { 'message': 'Registrado' };
            // Aquí ejecutamos la función para enviar el correo
            sendEmail(email);
            response.status(201).json(resp);
        });
    } catch (error) {
        response.status(500).json({ message: `${error}` });
    }
});


