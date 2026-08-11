import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asigna la dirección donde quieres guardar guardar los archivos compilados(preferiblemente QBCore_######.base/resources/[scripts]/anraz-handling-editor)
let dest = "";
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const match = envFile.match(/DEPLOY_PATH=(.*)/);
    if (match) {
        dest = match[1].trim().replace(/['"]/g, ''); // Quitamos comillas si las hay
    }
}

// Crea la carpeta /release en el directorio actual en caso de no tener el pathing
if (!dest) {
    console.log("⚠️ No se encontró DEPLOY_PATH en .env. Compilando en la carpeta local 'release/anraz-handling-editor'...");
    dest = path.join(__dirname, "release", "anraz-handling-editor");
}

console.log(`Deploying to: ${dest}`);

// Crear la carpeta si no existe
if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

// Función auxiliar para copiar
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    const elements = fs.readdirSync(from);
    for (const element of elements) {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}

// 4. Copiar los archivos limpios
copyFolderSync(path.join(__dirname, "dist"), path.join(dest, "dist"));
copyFolderSync(path.join(__dirname, "web", "dist"), path.join(dest, "nui"));
fs.copyFileSync(path.join(__dirname, "fxmanifest.lua"), path.join(dest, "fxmanifest.lua"));

console.log("✅ Deployed successfully!");