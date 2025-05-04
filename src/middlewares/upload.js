import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Obtener el directorio actual del archivo (equivalente a __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración para multer (en memoria)
const storage = multer.memoryStorage(); // Almacena los archivos en la memoria
const upload = multer({ storage: storage }); // Configuración de multer

// Función para convertir un buffer a un stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Indica el final del stream
  return stream;
};

// Ruta de las credenciales
const credentialsPath = path.join(__dirname, '../../config/google-drive-credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

const cartasFolderId = '1Hj3H5jOWbASKB1ai9FDaiLJf-pW3Z2gk';
const propuestasFolderId = '1P_wQDR7TiCHC6yeF_YU4nHY6rHxvH6ub';

// Función para subir archivo a Google Drive
const uploadToGoogleDrive = async (fileBuffer, fileName, folderId) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    // Convertir el buffer a un stream
    const fileStream = bufferToStream(fileBuffer);

    const media = {
      mimeType: 'application/pdf', // O el tipo adecuado dependiendo del archivo
      body: fileStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Retorna el link de la vista previa en Google Drive
    if (response.data.webViewLink) {
      return response.data.webViewLink;
    } else {
      throw new Error('No se pudo obtener el enlace del archivo');
    }
  } catch (error) {
    console.error('Error al subir el archivo a Google Drive:', error);
    throw error;
  }
};

// Middleware para manejar la carga de archivos con multer
const fileUpload = upload.fields([
  { name: 'proyectoTrabajo', maxCount: 1 },
  { name: 'detallePropuesta', maxCount: 1 }
]);

export { fileUpload, uploadToGoogleDrive, cartasFolderId, propuestasFolderId };
