# 💸 FinanceApp

Aplicación web para la gestión de finanzas personales.
Desarrollada con **Next.js, TypeScript, Prisma y NextAuth**, implementando buenas prácticas de seguridad y autenticación con GitHub.

---

## 🚀 Características principales

* ✅ Registro e inicio de sesión con **NextAuth + GitHub**
* ✅ Manejo de usuarios con roles (**ADMIN, USER**)
* ✅ CRUD de movimientos financieros (ingresos/gastos)
* ✅ Generación de reportes y exportación en **CSV**
* ✅ Documentación de API con **OpenAPI/Swagger**
* ✅ Base de datos en **PostgreSQL** usando **Prisma ORM**
* ✅ Arquitectura modular con **lib, services y middleware**
* ✅ Estilo moderno con **TailwindCSS + shadcn/ui**
* ✅ Pruebas unitarias con **Jest**

---

## 🛠️ Tecnologías utilizadas

* [Next.js](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Prisma](https://www.prisma.io/)
* [NextAuth.js](https://next-auth.js.org/)
* [PostgreSQL](https://www.postgresql.org/)
* [TailwindCSS](https://tailwindcss.com/)
* [shadcn/ui](https://ui.shadcn.com/)

---

## ⚙️ Instalación y configuración

1. **Clonar el repositorio**

```bash
git clone https://github.com/san7imo/finance-app.git
cd finance-app
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz y define las siguientes variables (sin valores expuestos):

* DATABASE\_URL
* SUPABASE\_URL
* SUPABASE\_ANON\_KEY
* SUPABASE\_SERVICE\_ROLE\_KEY
* GITHUB\_ID
* GITHUB\_SECRET
* NEXTAUTH\_URL
* NEXTAUTH\_SECRET

> **Nota:** Para ejecutar la aplicación localmente:
>
> * Cambia `NEXTAUTH_URL` a `http://localhost:3000`
> * Genera un nuevo `NEXTAUTH_SECRET` seguro (ej: `openssl rand -base64 32`)
> * Se recomienda crear una nueva OAuth App en GitHub apuntando a `http://localhost:3000/api/auth/callback/github` para pruebas locales.

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
 ├── components/   
 │   ├── layout/ 
 │   └── ui/ 
 ├── hooks/
 ├── lib/         
 │   ├── middleware/
 │   └── services/
 │   └── utils/
 ├── pages/     
 │   ├── api/      
 │   └── auth/
 │   └── moviments/      
 │   └── reports/
 │   └── users/              
 ├── types/        
 └── styles/       
```

---

## 🚀 Deploy

Este proyecto está preparado para desplegarse en **Vercel**:

```bash
vercel
```

---

## 👨‍💻 Autor

Desarrollado por **[san7imo](https://github.com/san7imo)** 

