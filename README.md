# 🏎️ Anraz Handling Editor

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Framework](https://img.shields.io/badge/framework-QBCore-red.svg)
![Language](https://img.shields.io/badge/language-TypeScript%20%7C%20React-blueviolet.svg)

Un script profesional y moderno para modificar el *handling* (manejo) de los vehículos en tiempo real en servidores de FiveM utilizando QBCore. Desarrollado íntegramente en **TypeScript** y con una interfaz gráfica ultra fluida creada con **React, Vite y TailwindCSS**.

## ✨ Características Principales

- **🎨 Diseño Nativo GTA V:** Interfaz moderna y minimalista inspirada en los menús nativos del juego (Los Santos Customs / Interaction Menu).
- **⚡ Edición en Vivo:** Modifica la aceleración, frenada, suspensión y tracción del vehículo y siente los cambios en tiempo real sin necesidad de reiniciar el script ni el servidor.
- **💾 Persistencia de Datos:** Todos los cambios se guardan permanentemente en la base de datos y se aplican automáticamente cada vez que el jugador saca el vehículo del garaje.
- **🔄 Sistema de Reset:** Botón integrado para restaurar el handling original (*stock*) del vehículo con un solo clic.
- **📋 Exportación e Importación:** Copia la configuración actual en formato XML (`handling.meta`) al portapapeles, o importa configuraciones externas pegando fragmentos de código XML.
- **🚀 Rendimiento Óptimo:** Escrito 100% en TypeScript y transpilado con `esbuild`, minimizando el impacto en el servidor (0.00ms de resmon).

## 🛠️ Requisitos Previos

Asegúrate de tener instalados y configurados los siguientes recursos en tu servidor:

- **[QBCore Framework](https://github.com/qbcore-framework/qb-core):** Framework base para la comprobación de permisos y trabajos.
- **[oxmysql](https://github.com/overextended/oxmysql):** Base de datos optimizada para interactuar con la persistencia del handling.

## 📥 Instalación

### Método 1: Instalación Rápida (Recomendado)
1. Descarga la última versión compilada (Release) del script.
2. Extrae la carpeta `anraz-handling-editor` dentro de la carpeta de recursos de tu servidor (ej. `resources/[qb]`).
3. Añade la siguiente línea a tu `server.cfg`:
   ```bash
   ensure anraz-handling-editor
   ```
4. Ejecuta el archivo SQL (si se incluye) o asegúrate de que la tabla `player_vehicles` de QBCore esté funcionando.
5. Reinicia tu servidor o inicia el script desde la consola.

### Método 2: Instalación para Desarrolladores (Desde el Código Fuente)
Si deseas modificar el código o compilarlo tú mismo:
1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/anraz-handling-editor.git
   ```
2. Instala las dependencias principales en la raíz del proyecto:
   ```bash
   npm install
   ```
3. Instala las dependencias del frontend (interfaz NUI):
   ```bash
   cd web
   npm install
   cd ..
   ```
4. Compila todo el proyecto (Servidor, Cliente e Interfaz web) usando el script automático:
   ```bash
   npm run deploy
   ```
5. La carpeta estará lista para usarse en tu servidor de FiveM.

## ⚙️ Configuración

El archivo de configuración principal se encuentra en `src/shared/config.ts`.
*(Nota: Si cambias la configuración en el código fuente, deberás volver a compilar usando `npm run deploy`)*.

```typescript
export const Config = {
  // Trabajos permitidos para usar el comando
  allowedJobs: ['tuner', 'mechanic'], 

  // Comando para abrir la interfaz
  commandName: 'tunehandling',
  
  // Lista de atributos que se mostrarán en la interfaz
  validAttributes: [
    'fInitialDriveForce',
    'fBrakeForce',
    'fMass',
    // ... puedes añadir o quitar atributos aquí
  ]
};
```

## 💻 Uso

1. Entra a tu servidor con un personaje que tenga el trabajo asignado (ej. `tuner`).
2. Sube a un vehículo (en el asiento del conductor).
3. Abre el chat (T) y escribe el comando:
   `/tunehandling`
4. Utiliza la interfaz arrastrable para ajustar los valores a tu gusto.
5. Pulsa **SAVE** para guardar los cambios en la base de datos.

## ⚠️ Notas Adicionales

- **Advertencia:** Modificar los multiplicadores de inercia o el centro de masa (`vecCentreOfMassOffset`) a valores extremos puede causar bugs físicos en el motor Havok de GTA V (coches voladores o bloqueos). Usa el sentido común en la afinación.
- Este proyecto ha sido migrado de Vanilla JS a React para un mantenimiento más sencillo y escalable. ¡Siéntete libre de contribuir!

---
**Desarrollado con ❤️ por Anraz.**
