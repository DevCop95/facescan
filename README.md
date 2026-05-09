<div align="center">
  <h1>🕵️‍♂️ FB Sentinel Pro</h1>
  <p><b>Facebook Unfriend Tracker & OSINT Dashboard</b></p>

  ![Version](https://img.shields.io/badge/Version-2.0_Pro-blue?style=for-the-badge)
  ![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=for-the-badge)
  ![Privacy](https://img.shields.io/badge/Privacy-100%25_Local-success?style=for-the-badge)
</div>

<br>

> **FB Sentinel** es un script de JavaScript puro (*Vanilla JS*) que se inyecta directamente en el navegador. Funciona como un dashboard de observabilidad para tu cuenta de Facebook, permitiéndote extraer tu lista de amigos completa (con fotos y amigos mutuos) y, lo más importante, **detectar quién te ha eliminado** a lo largo del tiempo.
> 
> 🔒 *Sin extensiones de terceros, sin inicios de sesión externos y sin bloqueos de API. Todo se procesa de forma local y segura en tu navegador.*

---

## 🚀 Instrucciones de Ejecución

Debido a las estrictas medidas de seguridad anti-XSS de los navegadores actuales, no puedes simplemente pegar código en Facebook. Sigue estos pasos exactos:

1. 👥 **Abre tu lista de amigos:** Ve a tu perfil de Facebook y abre la pestaña de Amigos desde una PC (`https://www.facebook.com/me/friends`). Asegúrate de ver la cuadrícula donde aparecen las tarjetas de tus contactos.
2. 💻 **Abre la Consola del Navegador:** Presiona <kbd>F12</kbd> (o haz clic derecho en la página y selecciona **Inspeccionar**) y dirígete a la pestaña **Console** (Consola).
3. 🔓 **Desbloquea el portapapeles (Importante):** Facebook bloquea pegar código por defecto y te mostrará una advertencia roja de "¡Detente!". Para habilitar la consola, escribe literalmente la frase `allow pasting` y presiona <kbd>Enter</kbd>.
4. 💉 **Inyecta el script:** Ahora copia el código fuente de `fb_sentinel.js`, pégalo en la consola y presiona <kbd>Enter</kbd>.
5. 🔄 **Escanear:** Aparecerá automáticamente el Dashboard de FB Sentinel. Si es tu primera vez o quieres actualizar tu base de datos, haz clic en el botón violeta **"🔄 Escanear Ahora"**. 

<details>
<summary>💡 <b>Tip importante durante el escaneo (Clic para expandir)</b></summary>
<br>
No toques, hagas scroll manual, ni cierres la página mientras la pantalla esté oscurecida mostrando el <i>Spinner</i> de escaneo. El script necesita mantener el foco en la página para bajar automáticamente por tu lista hasta terminar de leer el DOM.
</details>

---

## ⚙️ Arquitectura y Funcionamiento Técnico

El script es una herramienta de extracción de datos (*Web Scraping*) combinada con una Interfaz de Usuario (UI) reactiva. Su funcionamiento técnico se divide en 5 pilares:

* 📜 **Navegación Autónoma (Auto-Scroll):** Utiliza un bucle asíncrono para forzar a la página a cargar más perfiles haciendo scroll hacia abajo de manera progresiva, superando el *Lazy Loading* nativo sin romper el DOM.
* 🧹 **Filtro de Ruido Integrado:** Identifica e ignora automáticamente las tarjetas promocionales de UI que Facebook intercala (como *"Añadir a historia"*, *"Reels"*, *"Fotos"* y los bloques de *"Amigos en común"*).
* 🕵️ **Extracción Profunda y Evasión CSP:** 
  * Captura el **ID**, el **Nombre** y usa una Expresión Regular (`Regex`) para extraer la cantidad exacta de **"Amigos en común"**.
  * Evita los bloqueos de *Content Security Policy (CSP)* extrayendo el enlace original `.jpg` de los servidores estáticos de Facebook (`fbcdn.net`) o inyectando un SVG en Base64 seguro como *fallback*.
* 💾 **Almacenamiento Local (Local Backup):** Guarda la información estructurada en formato `JSON` en el `localStorage` de tu navegador bajo la llave `fb_friends_db`. Tus datos nunca salen de tu máquina.
* 🧠 **Motor de Diferencias (Diffing para Unfollows):** 
  * **Baseline (Hoy):** Ejecutas el script y guardas el estado actual de tus amigos.
  * **Comparación (Futuro):** FB Sentinel compara los IDs extraídos en un nuevo escaneo con los IDs guardados en el `localStorage`.
  * Si detecta que un ID estaba en la lista anterior pero no en la actual, lo marca automáticamente en rojo y lo clasifica en la pestaña **"💔 Eliminados"**.
