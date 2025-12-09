# 🚀 Guía de Deployment - Xolonica.store

Esta guía te ayudará a deployar Xolonica.store en producción.

## 📋 Pre-requisitos

Antes de deployar, asegúrate de:

- ✅ Haber ejecutado el schema SQL en Supabase
- ✅ Tener los 3 negocios de ejemplo cargados
- ✅ Haber probado la app localmente
- ✅ Verificar que la autenticación funciona
- ✅ Verificar que el chat en tiempo real funciona

## 🌐 Opciones de Deployment

### Opción 1: Vercel (Recomendado)

Vercel es la plataforma recomendada para Next.js, creada por el mismo equipo.

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Login en Vercel

```bash
vercel login
```

#### Paso 3: Deploy

```bash
# Desde la raíz del proyecto
vercel
```

Sigue las instrucciones en pantalla:
- Set up and deploy? **Yes**
- Which scope? **Selecciona tu cuenta**
- Link to existing project? **No**
- What's your project's name? **xolonica-store**
- In which directory is your code located? **./**
- Want to override settings? **No**

#### Paso 4: Configurar Variables de Entorno

Ve a tu proyecto en Vercel Dashboard y agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://mptnhektozvjowoydjha.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota**: Las variables ya están en el código, pero es mejor práctica usar variables de entorno.

#### Paso 5: Deploy a Producción

```bash
vercel --prod
```

Tu app estará disponible en: `https://xolonica-store.vercel.app`

---

### Opción 2: Netlify

#### Paso 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

#### Paso 2: Login y Deploy

```bash
netlify login
netlify init
netlify deploy --prod
```

#### Paso 3: Configurar Variables de Entorno

En Netlify Dashboard:
- Site settings → Build & deploy → Environment variables
- Agrega las mismas variables que en Vercel

---

### Opción 3: Servidor Propio (VPS)

#### Requisitos:
- Node.js 18+
- PM2 para process management
- Nginx como reverse proxy

#### Paso 1: Build de Producción

```bash
npm run build
```

#### Paso 2: Configurar PM2

```bash
npm install -g pm2
pm2 start npm --name "xolonica" -- start
pm2 save
pm2 startup
```

#### Paso 3: Configurar Nginx

```nginx
server {
    listen 80;
    server_name xolonica.store;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Paso 4: SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d xolonica.store
```

---

## 🔒 Configuración de Supabase para Producción

### 1. Configurar URLs Permitidas

En Supabase Dashboard:
- Authentication → URL Configuration
- Agrega tu dominio de producción:
  - Site URL: `https://xolonica.store`
  - Redirect URLs: 
    - `https://xolonica.store/**`
    - `https://*.vercel.app/**` (si usas Vercel)

### 2. Habilitar RLS en Producción

Verifica que todas las políticas RLS estén activas:

```sql
-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Todas las tablas deben tener `rowsecurity = true`.

### 3. Configurar Rate Limiting

En Supabase Dashboard:
- Settings → API → Rate Limiting
- Configura límites apropiados:
  - Auth: 30 requests/hour por IP
  - Database: 100 requests/minute por usuario

### 4. Configurar Realtime

Asegúrate de que `chat_messages` esté habilitada para Realtime:
- Database → Replication
- Habilita `chat_messages`

---

## ⚡ Optimizaciones de Producción

### 1. Configurar ISR (Incremental Static Regeneration)

Ya configurado en el código:
- Home page: revalidación cada 1 hora
- Business profiles: revalidación cada 30 minutos

### 2. Optimización de Imágenes

Cuando implementes carga de imágenes, usa Next.js Image:

```tsx
import Image from 'next/image';

<Image 
  src={logoUrl} 
  alt={businessName}
  width={200}
  height={200}
  priority
/>
```

### 3. Configurar CDN

Vercel y Netlify incluyen CDN automáticamente.

Para servidor propio, considera:
- Cloudflare
- AWS CloudFront
- Fastly

### 4. Analytics

Instala analytics para monitorear:

```bash
npm install @vercel/analytics
```

En `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔍 Monitoreo y Logging

### 1. Supabase Logs

En Supabase Dashboard:
- Logs → Database logs
- Logs → API logs
- Monitorea errores y performance

### 2. Vercel Analytics

Si usas Vercel:
- Vercel Dashboard → Analytics
- Monitorea:
  - Page views
  - Top pages
  - Geographic distribution
  - Real User Metrics (Web Vitals)

### 3. Error Tracking

Considera implementar Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🧪 Testing Pre-Deployment

Antes de deployar a producción, prueba:

### Funcionalidad
- [ ] Landing page carga correctamente
- [ ] Directorio de negocios muestra los 3 negocios
- [ ] Perfiles de negocio muestran información completa
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Dejar reseñas funciona
- [ ] Chat en tiempo real funciona
- [ ] Registro de negocio funciona

### Performance
- [ ] Lighthouse score > 90 en todas las categorías
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

### SEO
- [ ] Meta tags correctos en todas las páginas
- [ ] Sitemap generado
- [ ] robots.txt configurado
- [ ] Open Graph tags para compartir en redes

### Seguridad
- [ ] RLS habilitado en todas las tablas
- [ ] HTTPS configurado
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo

---

## 📊 Métricas de Éxito

Después del deployment, monitorea:

### Métricas Técnicas
- Uptime > 99.9%
- Response time < 500ms (p95)
- Error rate < 0.1%

### Métricas de Negocio
- Número de negocios registrados
- Número de usuarios registrados
- Número de reseñas publicadas
- Número de conversaciones de chat
- Tasa de conversión (visitantes → registro)

---

## 🚨 Troubleshooting en Producción

### Error: "Failed to fetch from Supabase"

**Causa**: URLs de Supabase no configuradas
**Solución**: Verifica que las variables de entorno estén correctamente configuradas

### Error: "RLS policy violation"

**Causa**: Políticas de seguridad demasiado restrictivas
**Solución**: Revisa las políticas RLS en el schema SQL

### Error: "Chat messages not updating in real-time"

**Causa**: Realtime no habilitado para chat_messages
**Solución**: Habilita Realtime en Database → Replication

### Performance lento

**Causas posibles**:
1. ISR no configurado → Verifica `revalidate` en las páginas
2. Muchas queries a Supabase → Implementa caching
3. Imágenes sin optimizar → Usa Next.js Image component

---

## 📅 Mantenimiento

### Semanal
- [ ] Revisar logs de errores
- [ ] Monitorear performance
- [ ] Verificar uptime

### Mensual
- [ ] Actualizar dependencias: `npm update`
- [ ] Revisar y moderar negocios pendientes
- [ ] Analizar métricas de uso
- [ ] Backup de base de datos

### Trimestral
- [ ] Revisar y optimizar queries SQL
- [ ] Auditoría de seguridad
- [ ] Actualizar Next.js a última versión
- [ ] Revisar costos de infraestructura

---

## 💰 Costos Estimados

### Supabase (Free Tier)
- ✅ Hasta 500MB database
- ✅ Hasta 1GB bandwidth
- ✅ Hasta 50,000 usuarios activos mensuales
- **Costo**: $0/mes

### Vercel (Hobby Tier)
- ✅ Unlimited websites
- ✅ 100GB bandwidth
- ✅ Serverless functions
- **Costo**: $0/mes

**Total MVP**: $0/mes

### Cuando escales (Pro)
- Supabase Pro: $25/mes
- Vercel Pro: $20/mes
- **Total**: $45/mes

---

## 🎯 Checklist Final de Deployment

Antes de marcar como "deployed":

- [ ] Schema SQL ejecutado en Supabase
- [ ] 3 negocios de ejemplo cargados
- [ ] Variables de entorno configuradas
- [ ] Build de producción exitoso
- [ ] Deploy en plataforma elegida
- [ ] URLs de Supabase configuradas
- [ ] HTTPS habilitado
- [ ] DNS configurado (si tienes dominio propio)
- [ ] Testing completo en producción
- [ ] Analytics configurado
- [ ] Monitoring activo
- [ ] Backup configurado

---

## 🎉 ¡Listo!

Tu plataforma Xolonica.store está ahora en producción y lista para conectar negocios nicaragüenses con clientes.

Para soporte continuo:
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Comunidad de Vercel: https://vercel.com/community

**¡Éxito con Xolonica.store! 🇳🇮**
