# Actas 2024

En solidaridad con la comunidad de desarrolladores que combate el fraude electoral perpetrado por la dictadura de Nicolás Maduro, aporto esta herramienta desarrollada en Node.js. Diseñada para descargar actas desde un archivo CSV extraído de [resultadosconvzla.com](https://resultadosconvzla.com) (footer), esta herramienta gestiona automáticamente las descargas fallidas y las reintenta, garantizando que todas las actas sean descargadas de manera completa y correcta.

La intención es que todos puedan tener la posibilidad de descargar las actas y almacenarlas localmente, y posteriormente en la nube si así lo desean. Todos deben tener acceso a las actas, asegurando su disponibilidad y transparencia.

## Descripción

La herramienta procesa el archivo CSV que contiene URLs de las actas. Verifica si las actas ya han sido descargadas y, en caso contrario, las descarga. Si se produce un error durante la descarga, registra la URL en un archivo de errores y la reintenta hasta que se complete la descarga. 

## Funcionalidades

- Descarga actas desde URLs especificadas en el archivo CSV.
- Maneja y reintenta descargas fallidas automáticamente.
- Valida las URLs antes de intentar la descarga.
- Registra errores y elimina URLs exitosas del archivo de errores.

## Instalación

1. **Clona el repositorio:**

    ```bash
    git clone https://github.com/cha5e369/actas_ve.git
    ```

2. **Navega al directorio del proyecto:**

    ```bash
    cd actas_ve
    ```

3. **Instala las dependencias:**

    ```bash
    npm install
    ```

## Uso

1. **Prepara el archivo CSV**: Asegúrate de que el archivo `resultados_2024_v1.csv` esté en el directorio raíz del proyecto. Este archivo debe contener una columna con las URLs de las actas.

2. **Ejecuta el código**:

    ```bash
    npm start
    ```

   El código procesará el archivo CSV, descargará las actas y manejará cualquier error de descarga.


## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un **issue** o una **pull request** para contribuir al proyecto. 