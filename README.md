# MAPA COMERCIAL DE COLOMBIA

Un proyecto para visualizar estadísticas comerciales en Colombia

## Instrucciones

1. Descargar los datos estadísticos más actualizados para departamentos y municipios de Colombia del sitio web del [DANE](https://geoportal.dane.gov.co/servicios/descarga-y-metadatos/datos-geoestadisticos/)
   
   > En este caso se descargaron los archivos  
   > - "Versión MGN2023-Nivel Departamento"
   > - "Versión MGN2023-Nivel Municipio"
   > - "Proyecciones y Densidad de población por departamento 2020-2035"
   > - "Proyecciones y Densidad de población por municipio 2020-2035"

2. Convertir el archivo .shp a .geojson:

   - **Windows**:
     
     1. Descargar la última versión (en este caso gdal-3-10-0) .zip de los binarios y el .zip de las librerías y los headers en el sitio web de [_GisInternals_](https://gisinternals.com/release.php)

     2. Descomprimir y copiar el contenido en una misma carpeta: ejemplo **C:\Users\[user]\gis\gdal**
     
     3. Crear variables de entorno:
     
        - GDAL_DATA: para la carpeta gdal-data en **C:\Users\[user]\gis\gdal\bin\gdal-data**
        - PROJ_LIB: para el archivo **proj.db** en **C:\Users\[user]\gis\gdal\bin\proj9\share**
     
     4. Abrir CMD en la carpeta de apps DE GDAL: **C:\Users\[user]\gis\gdal\bin\gdal\apps**
     
     5. Ejecutar el comando `ogr2ogr [file].geojson [file].shp` para los archivos de interés

3. Procesar los archivos .geojson:

   1. Ingresar al sitio web del creador de GeoJSON.
   
   2. Presionar el botón para generar el GeoJSON de departamentos
   
   3. Presionar el botón para generar el GeoJSON de municipios
  
  > Los archivos se crean autoáticamente en server/data