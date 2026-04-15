# Ecommerce Catalogo Deployment Notes

Estas son las instrucciones clave para mantener en producción el backend (`api.aweshopmx.com`) y el frontend (`www.aweshopmx.com`) con una arquitectura simple y de menor costo.

## Estado actual
- Backend activo en `https://api.aweshopmx.com`
- Frontend activo en `https://www.aweshopmx.com`
- Dominio raíz `https://aweshopmx.com` redirige a `https://www.aweshopmx.com`
- Login/admin funcionando con sesión persistente
- Subida de imágenes a S3 pendiente de terminar; por ahora se puede seguir usando URLs externas

## Backend en instancia unica
- El backend puede vivir en una sola instancia Linux o en un entorno `single instance` de Elastic Beanstalk, sin `Application Load Balancer`.
- En el entorno deben existir al menos estas variables:
  - `NODE_ENV=production`
  - `DATABASE_URL=...`
  - `JWT_ACCESS_SECRET=...`
  - `WEB_ORIGINS=https://www.aweshopmx.com,https://aweshopmx.com`
  - `COOKIE_NAME=ecom_access`
  - `COOKIE_SECURE=true`
  - `COOKIE_SAME_SITE=none`
  - `TRUST_PROXY=1` si usas Nginx o un proxy inverso delante de Node; `TRUST_PROXY=0` si expones Node directamente
- Si quieres mantener HTTPS sin pagar ALB, termina SSL en Nginx dentro de la misma instancia y reenvia a Node por `localhost:4000`.
- El health `https://api.aweshopmx.com/health` debe devolver `environment: "production"`.

## Frontend en Amplify
- La app se despliega desde la rama `main` usando el `amplify.yml` del repo.
- Variables necesarias en Amplify:
  - `AMPLIFY_MONOREPO_APP_ROOT=frontend`
  - `VITE_API_URL=https://api.aweshopmx.com`
- En `Domain management` deben existir:
  - `aweshopmx.com` -> redirección a `https://www.aweshopmx.com`
  - `www.aweshopmx.com` -> rama `main`

## Reescrituras y redireccionamientos en Amplify
- Usar estas reglas exactas:
  ```json
  [
    {
      "source": "https://aweshopmx.com",
      "status": "302",
      "target": "https://www.aweshopmx.com",
      "condition": null
    },
    {
      "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|mjs|png|svg|webp|avif|woff|woff2|ttf|map|json|txt|webmanifest)$)([^.]+$)/>",
      "status": "200",
      "target": "/index.html",
      "condition": null
    }
  ]
  ```
- No usar una regla genérica `/<*> -> /index.html`, porque rompe los assets (`js` y `css`) y deja la pantalla en blanco.

## Validaciones de login/sesión
- El login se hace en `https://www.aweshopmx.com/login`
- La validación más confiable es:
  - `POST /auth/login` responde `200`
  - `GET /auth/me` responde `200`
  - el usuario regresado tiene `role: "ADMIN"` cuando corresponde
- En Firefox, aunque la cookie no siempre se vea claro en `Almacenamiento > Cookies`, si `/auth/me` responde `200` después del login entonces la sesión sí está persistiendo correctamente.

## Script para crear admin
- Archivo: `backend/scripts/createAdmin.ts`
- Uso:
  ```bash
  export ADMIN_EMAIL=admin@aweshopmx.com
  export ADMIN_PASSWORD='UnaClaveSegura123'
  npx tsx backend/scripts/createAdmin.ts
  ```
- El script hace upsert del usuario y asegura el rol `ADMIN`.

## Subida de imágenes / S3
- El backend ya tiene soporte para S3 en código, pero la infraestructura todavía no quedó terminada.
- Pendiente para otra sesión:
  1. Crear bucket S3
  2. Dar permisos IAM al rol de la instancia o del entorno
  3. Configurar variables `S3_BUCKET_NAME`, `AWS_REGION`, `S3_KEY_PREFIX`, etc.
  4. Resolver por completo el flujo de upload y URL pública

## Nota de costo
- Si el objetivo es bajar gasto, la ruta recomendada es:
  - frontend en Amplify
  - backend en instancia unica
  - base en RDS
- El `Application Load Balancer` se puede retirar siempre que el backend quede accesible por un unico servidor y el HTTPS se resuelva dentro de la instancia.

## Nota importante
- Si el frontend vuelve a quedar en blanco y en DevTools los archivos `index-*.js` o `index-*.css` salen con MIME `text/html`, el problema casi seguro es la regla de reescritura de Amplify y no el código del frontend.
