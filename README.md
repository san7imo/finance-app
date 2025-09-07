# 💸 FinanceApp

Aplicación web para la gestión de finanzas personales.  
Desarrollada con **Next.js, TypeScript, Prisma y NextAuth**, implementando buenas prácticas de seguridad y autenticación con GitHub.

---

## 🚀 Características principales

- ✅ Registro e inicio de sesión con **NextAuth + GitHub**  
- ✅ Manejo de usuarios con roles (**ADMIN, USER**)  
- ✅ CRUD de movimientos financieros (ingresos/gastos)  
- ✅ Base de datos en **PostgreSQL** usando **Prisma ORM**  
- ✅ Arquitectura modular con **lib, services y middleware**  
- ✅ Estilo moderno con **TailwindCSS + shadcn/ui**  
- ✅ Pruebas unitarias con **Jest**  

---

## 🛠️ Tecnologías utilizadas

- [Next.js](https://nextjs.org/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Prisma](https://www.prisma.io/)  
- [NextAuth.js](https://next-auth.js.org/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [TailwindCSS](https://tailwindcss.com/)  
- [shadcn/ui](https://ui.shadcn.com/)  

---

## ⚙️ Instalación y configuración

1. **Clonar el repositorio**

```bash
git clone https://github.com/tuusuario/financeapp.git
cd financeapp
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz con el siguiente contenido:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/financeapp
NEXTAUTH_SECRET=tu_secret_key
GITHUB_ID=tu_github_client_id
GITHUB_SECRET=tu_github_client_secret
```

4. **Ejecutar migraciones de Prisma**

```bash
npx prisma migrate dev
```

5. **Iniciar servidor en desarrollo**

```bash
npm run dev
```

---

## 🧪 Pruebas

Ejecuta las pruebas unitarias con:

```bash
npm run test
```

---

## 📂 Estructura del proyecto

```
src/
 ├── lib/          # Configuración de Prisma y utilidades
 ├── pages/        # Rutas de Next.js (incluye API)
 │   ├── api/      # Endpoints (Next.js API routes)
 │   └── auth/     # Vistas de autenticación
 ├── components/   # Componentes UI reutilizables
 ├── types/        # Tipos personalizados (NextAuth, etc.)
 └── styles/       # Estilos globales
```

---

## 🚀 Deploy

Este proyecto está preparado para desplegarse en **Vercel**:

```bash
vercel
```

---

## 👨‍💻 Autor

Desarrollado por **[san7imo](https://github.com/san7imo)** ✨  
Con enfoque en **desarrollo seguro, escalable y profesional**.