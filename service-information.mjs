// Información facilitada por el titular: marca, iniciales y teléfono.
// No inventa nombre completo, NIF, domicilio, correo ni plazos de conservación.
export const STYLE_ID = 'ac-service-information-v1';
export const START = '<!-- AC-SERVICE-INFORMATION-START -->';
export const END = '<!-- AC-SERVICE-INFORMATION-END -->';

export const CSS = `
.ac-cookie-footer .ac-cookie-tools{align-items:flex-start;gap:8px 24px}
.ac-cookie-footer .ac-cookie-tools>details,.ac-cookie-footer .ac-cookie-tools>#ac-cookie-policy{min-width:0;max-width:100%;flex:0 1 auto}
.ac-cookie-footer .ac-cookie-tools>details[open],.ac-cookie-footer .ac-cookie-tools>#ac-cookie-policy[open]{flex:1 1 100%;order:2}
.ac-cookie-footer .ac-cookie-tools>details>summary{box-sizing:border-box;min-height:44px;padding:10px 0;cursor:pointer;font-weight:700;line-height:1.5;color:#fff;text-decoration:underline;text-underline-offset:3px}
.ac-cookie-footer .ac-cookie-tools>details>summary:focus-visible{outline:3px solid #ff8700;outline-offset:3px;border-radius:3px}
.ac-cookie-footer .ac-service-text{max-width:960px;padding:6px 0 10px;color:#e9f0f5;font:14px/1.65 Arial,Helvetica,sans-serif;overflow-wrap:anywhere}
.ac-cookie-footer .ac-service-text p{margin:8px 0}
.ac-cookie-footer .ac-service-text h3{font-size:17px;line-height:1.35;color:#fff;margin:16px 0 6px}
.ac-cookie-footer .ac-service-text a{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px}
.ac-cookie-footer .ac-service-text .ac-information-note{padding:10px 12px;border-left:3px solid #ff8700;background:#0a3f73;color:#fff;font-size:13px}
`;

export const INFORMATION = `${START}<details id="ac-service-info"><summary>Información del servicio</summary><div class="ac-service-text">
<p><strong>Marca:</strong> Antenista Cerca.<br><strong>Referencia del técnico:</strong> R.F.G.<br><strong>Teléfono:</strong> <a href="tel:+34641589394">641 589 394</a> · <a href="https://wa.me/34641589394" rel="noopener noreferrer">WhatsApp</a>.</p>
<p>El mismo técnico atiende las consultas y realiza los trabajos. Esta web presenta servicios de antenas TDT y parabólicas, amplificación, porteros automáticos y videoporteros, cobertura móvil y pequeñas reparaciones eléctricas.</p>
<p>Para consultar disponibilidad, condiciones del trabajo o presupuesto, contacta directamente con el técnico. La información de localidades describe zonas de servicio; no identifica una oficina o establecimiento en cada municipio.</p>
<p class="ac-information-note">Esta sección recoge los datos facilitados: R.F.G. y el teléfono de contacto. La identificación completa del titular está pendiente de completarse.</p>
</div></details>
<details id="ac-privacy-info"><summary>Privacidad</summary><div class="ac-service-text">
<p><strong>Referencia del responsable del servicio:</strong> R.F.G., bajo la marca Antenista Cerca. Contacto: <a href="tel:+34641589394">641 589 394</a> o <a href="https://wa.me/34641589394" rel="noopener noreferrer">WhatsApp</a>. Información actualizada el 15 de septiembre de 2026.</p>
<h3>Consultas y solicitudes de servicio</h3>
<p>Los datos que facilites al contactar, como tu nombre, teléfono, localidad y descripción de la avería o instalación, se utilizan para atender tu solicitud y, en su caso, organizar el trabajo solicitado. Facilita solo la información necesaria para gestionar el aviso.</p>
<p>La atención de solicitudes de presupuesto y de trabajos se basa en las medidas previas a una contratación solicitadas por ti o en la ejecución del servicio. La analítica de la web tiene una finalidad distinta y depende de tu consentimiento.</p>
<h3>Analítica opcional y servicios externos</h3>
<p>Google Analytics solo se activa cuando aceptas la analítica. Mide navegación y clics en los enlaces de contacto, no el contenido de tus llamadas o mensajes. Rechazarla no impide contactar con el técnico. Puedes cambiar o retirar tu decisión mediante «Configurar cookies» en este pie.</p>
<p>El alojamiento web en Netlify y los proveedores de imágenes reciben las conexiones técnicas necesarias para mostrar sus recursos. Al abrir WhatsApp utilizas un servicio externo con sus propias condiciones. Si aceptas la analítica, Google recibe datos de uso conforme a lo explicado en la política de cookies, que también informa sobre posibles tratamientos fuera del Espacio Económico Europeo.</p>
<h3>Conservación</h3>
<p>La duración de las cookies y las preferencias del navegador se detalla en la política de cookies. El plazo concreto de conservación de las consultas, la documentación del servicio y los datos guardados en la cuenta de analítica está pendiente de documentarse; no debe confundirse con la duración de las cookies.</p>
<h3>Derechos y contacto</h3>
<p>Puedes dirigirte a R.F.G. a través del <a href="tel:+34641589394">641 589 394</a> o por <a href="https://wa.me/34641589394" rel="noopener noreferrer">WhatsApp</a> para solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad de tus datos cuando corresponda. También puedes presentar una reclamación ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a>.</p>
</div></details>${END}`;

export function applyServiceInformation(html) {
  if (typeof html !== 'string' || !/<\/head>/i.test(html)) throw new Error('Información del servicio: falta head');
  const re = /<!-- AC-COOKIE-FOOTER-START -->[\s\S]*?<!-- AC-COOKIE-FOOTER-END -->/g;
  const footers = [...html.matchAll(re)];
  if (footers.length !== 1) throw new Error('Información del servicio: debe existir un pie de cookies');
  const oldFooter = footers[0][0];
  let footer = oldFooter.replace(/<!-- AC-SERVICE-INFORMATION-START -->[\s\S]*?<!-- AC-SERVICE-INFORMATION-END -->/g, '');
  if (!footer.includes('<div class="ac-cookie-tools">')) throw new Error('Información del servicio: no se encuentra el panel del pie');
  footer = footer.replace('<div class="ac-cookie-tools">', '<div class="ac-cookie-tools">' + INFORMATION)
    .replace('Contacto sobre esta web: <a href="tel:+34641589394">', 'Contacto sobre esta web: R.F.G. · <a href="tel:+34641589394">');
  let output = html.replace(oldFooter, footer);
  const oldStyle = new RegExp(`<style id="${STYLE_ID}">[\\s\\S]*?<\\/style>`, 'g');
  output = output.replace(oldStyle, '').replace(/<\/head>/i, `<style id="${STYLE_ID}">${CSS}</style></head>`);
  for (const id of ['ac-service-info', 'ac-privacy-info', 'ac-cookie-policy']) {
    if ((output.match(new RegExp(`id="${id}"`, 'g')) || []).length !== 1) throw new Error('Información del servicio: ID ausente o duplicado ' + id);
  }
  return output;
}
