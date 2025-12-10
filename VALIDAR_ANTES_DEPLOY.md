# ✅ VALIDAR ANTES DE DEPLOY

## 🧪 COMANDO PARA VALIDAR LOCALMENTE

Antes de hacer push a GitHub, ejecuta este comando para asegurarte que el build funciona:

```bash
npm run validate
```

Este comando:
1. ✅ Compila el proyecto completo
2. ✅ Verifica que no haya errores de TypeScript
3. ✅ Verifica que todos los imports se resuelvan correctamente
4. ✅ Genera el build de producción

---

## 📋 CHECKLIST PRE-DEPLOY

### **1. Instalar dependencias actualizadas**
```bash
npm install
```

### **2. Validar build**
```bash
npm run validate
```

**Si ves este mensaje, estás listo:**
```
✅ Build exitoso - listo para deploy
```

**Si hay errores:**
- Lee el error cuidadosamente
- Arregla el problema
- Vuelve a ejecutar `npm run validate`

### **3. Hacer commit y push**
```bash
git add .
git commit -m "Fix: [descripción del cambio]"
git push origin main
```

---

## 🐛 ERRORES COMUNES

### **Error: "Module not found: Can't resolve '@/...'"**

**Causa**: Los alias de path no están configurados correctamente.

**Solución**: Ya está arreglado en `next.config.js` y `tsconfig.json`

### **Error: "Cannot find module"**

**Causa**: Falta instalar dependencias.

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Error: Build tarda mucho**

**Causa**: Archivos `.next` o `node_modules` en el repo.

**Solución**: Ya están en `.gitignore`

---

## 🚀 FLUJO COMPLETO

```bash
# 1. Hacer cambios en el código
# 2. Validar localmente
npm run validate

# 3. Si pasa, hacer commit
git add .
git commit -m "Tu mensaje"

# 4. Push a GitHub
git push origin main

# 5. Vercel hace deploy automático
# 6. Verifica en https://tu-proyecto.vercel.app
```

---

## 📊 VERIFICAR EN VERCEL

Después del deploy, verifica:

1. **Build Logs**: Ve a Vercel Dashboard > Deployments > [último deploy]
2. **Busca**: `✓ Compiled successfully`
3. **Prueba**: Abre tu sitio y verifica que funcione

---

## ⚡ TIPS

- ✅ **Siempre** ejecuta `npm run validate` antes de push
- ✅ Mantén `.env.local` actualizado con tus variables
- ✅ No subas archivos `.next/` o `node_modules/`
- ✅ Verifica que `tsconfig.json` y `next.config.js` estén correctos

---

**¡Con esto evitas errores en Vercel!** 🎉
