# Ecommerce Catalogo Deployment Notes

Estas son las instrucciones clave para mantener en producción el backend (`api.aweshopmx.com`) y el frontend (`www.aweshopmx.com`).

## Backend en Elastic Beanstalk
- `NODE_ENV` debe quedar en `production` y `DATABASE_URL`, `JWT_ACCESS_SECRET`, `COOKIE_NAME`/`COOKIE_SECURE`/`COOKIE_SAME_SITE` y `TRUST_PROXY` configurados con los valores del entorno real. Estos se editan desde el panel de Elastic Beanstalk (`Configuration > Software`).
- El listener HTTPS se configura en EC2 > Load Balancers (agregar `HTTPS:443` con certificado ACM y security group permitiendo 443). El health `/health` debe devolver `{ "environment":"production" }`.
- Para crear un admin ejecuta `ADMIN_EMAIL=<x> ADMIN_PASSWORD=<segura> npx tsx backend/scripts/createAdmin.ts`. El script también se puede ejecutar dentro del entorno con las variables exportadas.

## Frontend en Amplify
- Conecta la rama `main` y usa el `amplify.yml` ya presente. Establece variables:
  - `AMPLIFY_MONOREPO_APP_ROOT=frontend`
  - `VITE_API_URL=https://api.aweshopmx.com`
- Configura `Domain management` con `aweshopmx.com` y `www.aweshopmx.com`, creando los registros CNAME/ALIAS que Amplify provee en Route 53.
- Bajo **Reescrituras y redireccionamientos** deja:
  ```json
  [
    {"source":"https://aweshopmx.com","status":"302","target":"https://www.aweshopmx.com"},
    {"source":"/<*>","status":"200","target":"/index.html"}
  ]
  ```
- Esto asegura que rutas SPA (`/admin/...`) carguen `index.html`.

## Validaciones
- En DevTools (Aplicación > Cookies) verifica que `ecom_access` existe con `Secure=true` y `SameSite=Lax` después del login.`/auth/me` debe responder 200. De no ser así, borra la cookie y vuelve a autenticar.
- Las peticiones deben ir a `https://api.aweshopmx.com`; el frontend usa la variable `VITE_API_URL` definida en Amplify.

## Scripts auxiliares
- `backend/scripts/createAdmin.ts`: crea/upserta el usuario admin usando las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Ejecutar:
  ```bash
  export ADMIN_EMAIL=admin@aweshopmx.com
  export ADMIN_PASSWORD='UnaClaveSegura123'
  npx tsx backend/scripts/createAdmin.ts
  ```
- También puedes usar el script para resetear la contraseña y rol de un email ya existente.

## Siguientes pasos recomendados
1. Valida que el login admin redirige a `/admin` y que todos los endpoints (`/auth/me`, `/products`, etc.) responden 200.
2. Documenta este flujo en `README.md` (ya creado) y registra la nueva regla de reescritura/redirect en Amplify para futuras referencias.
