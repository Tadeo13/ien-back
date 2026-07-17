require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Resend } = require('resend');

const DESTINATARIO = 'tadeofrr13@gmail.com';

async function testEmail() {
  console.log('=== Test de envío de correo (Resend) ===\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no está configurada en .env');
    process.exit(1);
  }

  console.log(`API Key: ${process.env.RESEND_API_KEY.slice(0, 10)}...`);
  console.log(`From: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);
  console.log(`To: ${DESTINATARIO}\n`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: DESTINATARIO,
      subject: 'Test IEN - El sistema de correos funciona correctamente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">✅ Test de correo exitoso</h2>
          <p>El sistema de envío de correos de <strong>IEN</strong> está funcionando correctamente.</p>
          <p>Fecha: ${new Date().toISOString()}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Este es un correo de prueba generado por scripts/test-email.js</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error de Resend:', error.message);
      console.error('   Código:', error.name);
      process.exit(1);
    }

    console.log('✅ Correo enviado exitosamente');
    console.log('   Message ID:', data.id);
    console.log('\nRevisá la bandeja de entrada de', DESTINATARIO);
  } catch (err) {
    console.error('❌ Excepción:', err.message);
    process.exit(1);
  }
}

testEmail();
