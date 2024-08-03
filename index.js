import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import readline from 'readline';
import { createReadStream } from 'fs';

// Colores para la consola.
const green = '\x1b[32m'; // Verde
const red = '\x1b[31m'; // Rojo
const blue = '\x1b[34m'; // Azul
const yellow = '\x1b[33m'; // Amarillo
const reset = '\x1b[0m'; // Reset

// El CSV fue extraído de: https://resultadosconvzla.com (situado en el footer de esta misma) -> https://static.resultadosconvzla.com/RESULTADOS_2024_CSV_V1.csv (enlace directo).
const csvFilePath = './resultados_2024_v1.csv';
const outputDir = path.join(process.cwd(), 'actas');
const errorLogPath = path.join(process.cwd(), 'errores.txt');

// Expresión regular para validar URLs
const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

// Crear la carpeta si no existe.
try {
  await fs.mkdir(outputDir, { recursive: true });
} catch (err) {
  console.error('Error al crear el directorio', err);
}

// Función para descargar una imagen
const downloadImage = async (url, dest) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error al descargar la acta: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(dest, buffer);
};

// Función para registrar errores
const logError = async (url) => {
  try {
    await fs.appendFile(errorLogPath, url + '\n');
  } catch (err) {
    console.error('Error al registrar la URL fallida', err);
  }
};

// Función para eliminar una URL del archivo de errores
const removeErrorUrl = async (url) => {
  try {
    const data = await fs.readFile(errorLogPath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== url.trim());
    await fs.writeFile(errorLogPath, lines.join('\n'));
  } catch (err) {
    console.error('Error al eliminar la URL del archivo de errores', err);
  }
};

// Función para reintentar las descargas de actas fallidas
const retryFailedDownloads = async () => {
  console.log(`${blue}Verificando URLs de actas que no se hayan podido descargar...${reset}`);
  let hasErrors = true;

  while (hasErrors) {
    const errorUrls = await fs.readFile(errorLogPath, 'utf8');
    const urls = errorUrls.split('\n').filter(line => line.trim() && urlRegex.test(line.trim()));

    if (!urls.length) console.log(`${yellow}No se encontraron URLs de actas fallidas para reintentar.${reset}`);

    hasErrors = urls.length > 0;

    for (const url of urls) {
      const fileName = path.basename(url);
      const filePath = path.join(outputDir, fileName);

      try {
        await downloadImage(url, filePath);
        console.log(`${green}Reintento exitoso. Acta descargada: ${fileName}${reset}`);
        await removeErrorUrl(url);
      } catch (error) {
        console.error(`${red}Error al reintentar la descarga de la acta ${fileName}: ${error.message}${reset}`);
      }
    }
  }
};

// Función para leer y procesar el CSV
const processCSV = async () => {
  console.log(`${blue}Procesando el archivo CSV...${reset}`);
  const fileStream = createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Procesar cada línea del CSV
  for await (const line of rl) {
    const columns = line.split(',');
    const imageUrl = columns[21];

    // Verificar si la URL es válida
    if (!urlRegex.test(imageUrl)) {
      console.error(`${red}URL inválida encontrada en el CSV: ${imageUrl}${reset}`);
      continue;
    }

    const fileName = path.basename(imageUrl);
    const filePath = path.join(outputDir, fileName);

    try {
      // Verificar si la acta ya existe
      try {
        await fs.access(filePath);
        console.log(`${blue}La acta ${yellow}${fileName} ${blue}ya existe. Omisión.${reset}`);
        continue;
      } catch {
        // Acta no existe, proceder con la descarga
        await downloadImage(imageUrl, filePath);
        console.log(`${green}Acta descargada: ${fileName}${reset}`);
      }
    } catch (error) {
      console.error(`${red}Error al descargar la acta ${fileName}: ${error.message}${reset}`);
      await logError(imageUrl);
    }
  }
};

// Ejecutar el procesamiento del CSV
const main = async () => {
  await retryFailedDownloads();
  await processCSV();
};

main().catch(console.error);
