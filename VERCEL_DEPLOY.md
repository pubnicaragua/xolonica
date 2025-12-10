# 🚀 DEPLOY EN VERCEL - XOLONICA.STORE

## ✅ PASOS PARA DEPLOY EXITOSO

### 1. **Configurar Variables de Entorno en Vercel**

Ve a tu proyecto en Vercel → Settings → Environment Variables

Agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_GROQ_API_KEY=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
```

**IMPORTANTE**: 
- ✅ `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son **OBLIGATORIOS**
- ⚠️ `NEXT_PUBLIC_GROQ_API_KEY` es **OPCIONAL** (el chatbot mostrará un mensaje si no está disponible)

---

### 2. **Configurar Supabase**

Ejecuta estos SQL en tu Supabase SQL Editor:

#### **A. Tabla de Notificaciones**
```sql
-- Ejecuta el contenido completo de SQL_NOTIFICACIONES.sql
```

#### **B. Columnas Faltantes**
```sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS has_online_store BOOLEAN DEFAULT false;

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
```

#### **C. Crear Usuario Admin**
1. Ve a **Authentication > Users** en Supabase
2. Click **"Add user"**
3. Email: `adminileana@gmail.com`
4. Password: `@Managua2024%$`
5. Copia el **User ID**

```sql
INSERT INTO admins (user_id, email)
VALUES ('USER_ID_AQUI', 'adminileana@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
```

---

### 3. **Deploy en Vercel**

#### **Opción A: Desde GitHub (Recomendado)**
1. Conecta tu repo de GitHub a Vercel
2. Vercel detectará automáticamente Next.js
3. Agrega las variables de entorno
4. Click **Deploy**

#### **Opción B: Desde CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### 4. **Verificar Deploy**

Después del deploy, verifica:

- [ ] ✅ Página principal carga sin errores
- [ ] ✅ Logo aparece correctamente
- [ ] ✅ Navbar y Footer funcionan
- [ ] ✅ `/negocios` muestra negocios
- [ ] ✅ `/registrar-negocio` muestra formulario
- [ ] ✅ `/admin` requiere login
- [ ] ✅ Chatbot responde (si configuraste Groq)

---

## 🐛 TROUBLESHOOTING

### **Error: Module not found '@/...'**
✅ **Solucionado**: `tsconfig.json` y `next.config.js` ya están configurados

### **Error: GROQ_API_KEY missing**
✅ **Solucionado**: El chatbot ahora es opcional y muestra un mensaje amigable

### **Error: Logo no aparece**
✅ **Solucionado**: Logo está en `/public/Logo.png`

### **Error: Build fails**
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente primero
- Verifica que no haya errores de TypeScript

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] Variables de entorno configuradas en Vercel
- [ ] SQL ejecutado en Supabase
- [ ] Usuario admin creado
- [ ] `package.json` correcto (sin Vite)
- [ ] `tsconfig.json` con paths configurados
- [ ] `next.config.js` existe
- [ ] Logo en `/public/Logo.png`
- [ ] `.gitignore` excluye `node_modules`

---

## 🎯 DESPUÉS DEL DEPLOY

1. **Prueba el formulario de registro**
2. **Login como admin y aprueba un negocio**
3. **Verifica que las notificaciones se crean**
4. **Prueba el chatbot** (si configuraste Groq)

---

## 🔗 LINKS ÚTILES

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Documentación Next.js**: https://nextjs.org/docs

---

**¡Todo está listo para producción!** 🚀
