# InmoGest 2.0 — Instalación desde cero

## Paso 1: Borrar todo lo anterior
En tu carpeta `Escritorio\PROCESAL II\inmogest 2.0`, seleccioná **todo** lo
que hay adentro y borralo. Arrancamos limpio.

## Paso 2: Descargar estos archivos nuevos
Descargá todos los archivos que te compartí en el chat y ubicalos así,
respetando la estructura de carpetas:

```
inmogest 2.0/
├── index.html
├── inmogest.sql
├── css/
│   ├── style.css
│   └── mobile.css
└── js/
    ├── supabase.js
    ├── app.js
    ├── dashboard.js
    ├── propietarios.js
    ├── propiedades.js
    ├── inquilinos.js
    ├── contratos.js
    ├── impuestos.js
    ├── servicios.js
    ├── cobranzas.js
    ├── liquidaciones.js
    └── reportes.js
```

## Paso 3: Base de datos en Supabase
1. Andá a tu proyecto en supabase.com → **SQL Editor** → **New query**.
2. Pegá el contenido completo de `inmogest.sql`.
3. Ejecutalo. Si te pregunta por Row Level Security, ya viene manejado
   en el propio script (lo habilita con una política abierta), así que
   no hace falta elegir nada aparte.

## Paso 4: Credenciales
1. En Supabase: **Project Settings → API**.
2. Copiá el **Project URL** y la **anon public key**.
3. Abrí `js/supabase.js` con el Bloc de notas y reemplazá:
   ```js
   const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
   const SUPABASE_ANON_KEY = 'TU-ANON-KEY';
   ```
   por tus valores reales. Guardá.

## Paso 5: Levantar el servidor local
1. Abrí la consola (cmd) y escribí:
   ```
   cd "C:\Users\rospa\OneDrive\Desktop\PROCESAL II\inmogest 2.0"
   ```
2. Después:
   ```
   npx http-server
   ```
3. Si te pide instalar el paquete, escribí `y` y Enter.
4. Si Windows pregunta por el firewall, tocá **Permitir**.
5. Abrí en el navegador la dirección que te muestre, por ejemplo:
   `http://127.0.0.1:8080`

## Paso 6: Probar
Cargá en orden: un Propietario → una Propiedad → un Inquilino →
un Contrato. Recién ahí Impuestos, Servicios, Cobranzas y Liquidaciones
van a tener opciones para elegir en los desplegables.
