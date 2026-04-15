# Corte a Dominio Propio

## Objetivo

Terminar rápido con la infraestructura que ya tienes:

- Backend en una sola instancia o Elastic Beanstalk `single instance`
- Frontend en Amplify
- HTTPS en `api.tudominio.com`
- Cookies funcionando sin depender para siempre de `SameSite=None`

## Orden recomendado

1. Configura `api.tudominio.com` apuntando a una sola instancia sin ALB.
2. Verifica `https://api.tudominio.com/health`.
3. Mientras frontend siga en Vercel, usa:
   - `COOKIE_SAME_SITE=none`
   - `COOKIE_SECURE=true`
   - `WEB_ORIGINS=https://tu-frontend.vercel.app`
4. Despliega frontend en Amplify con `www.tudominio.com`.
5. Cambia el backend a:
   - `COOKIE_SAME_SITE=lax`
   - `COOKIE_SECURE=true`
   - `WEB_ORIGINS=https://www.tudominio.com,https://tudominio.com`
6. Apaga Vercel si ya no lo usarás.

## Validación

- login correcto desde frontend
- cookie presente y marcada como `Secure`
- peticiones autenticadas funcionan con `withCredentials`
- `GET /health` responde `200`
- subida de imágenes devuelve URLs finales de S3 o CDN
- no hay `Application Load Balancer` activo
