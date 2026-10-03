# Simple Stock Flow · Frontend (SPA en React)

> **Prueba técnica SDD · Ficha ADSO 3413974**  
> Implementación del cliente web enriquecido para gestión de inventarios y punto de venta.

---

## 1. ¿Qué es este repositorio y qué rol cumple en Simple Stock Flow?

Este repositorio contiene la aplicación de una sola página (**SPA - Single Page Application**) construida en **React 18 + TypeScript + Vite**, empaquetada y servida a través de **Nginx** en contenedor Docker.

Cumple el rol de **interfaz de usuario principal** de *Simple Stock Flow*, permitiendo:
- **Autenticación JWT:** Inicio de sesión para administradores y vendedores, control de expiración y cierre de sesión seguro.
- **Catálogo de Productos:** Búsqueda en tiempo real por texto, filtrado por categorías, paginación, creación/edición de productos (sólo admin), carga de imágenes a `/api/products/{id}/image` (máximo 5 MB, JPEG/PNG/WebP) y eliminación lógica (soft-delete).
- **Punto de Venta / Carrito:** Selección de productos, control estricto de stock disponible y registro atómico de ventas.
- **Historial de Ventas:** Consulta filtrada por rango de fechas (`from` y `to` exclusivo), paginación y visualización del detalle de cada comprobante.
- **Reporte Consolidado de Ventas:** Visualización de métricas clave (ingresos totales en COP, cantidad de ventas, unidades vendidas) y tabla de rendimiento por producto con nombres históricos congelados (DP-01).
- **Gestión de Vendedores:** Creación de nuevos vendedores por parte de administradores bajo la regla DP-04 (sin selector de roles).

---

## 2. ¿Cómo se ejecuta localmente?

### Con Docker Compose (Recomendado)
El contenedor de la aplicación se ejecuta dentro del entorno orquestado en `test-simple-stock-flow-infra`:

```bash
cd ../test-simple-stock-flow-infra
docker compose up -d --build
```
La aplicación quedará accesible en: `http://localhost:8080`.  
Nginx se encarga de servir los archivos estáticos de la SPA y redirigir las peticiones a `/api/` y `/media/` hacia el servicio backend `api:8000`.

### Sin Docker (Desarrollo Local)
Requiere Node.js 20+ instalado:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo Vite con proxy
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 3. Variables de entorno requeridas

En modo contenedor, la configuración de conexión hacia el backend está centralizada en la configuración de Nginx (`nginx.conf`):
- Proxy de API: `http://api:8000/api/`
- Proxy de Media: `http://api:8000/media/` con límite `client_max_body_size 6m`

En modo de desarrollo local con Vite, el archivo `vite.config.ts` incluye el proxy inverso hacia `http://localhost:8000`.

---

## 4. ¿Cómo se ejecutan las pruebas y verificación de tipos?

```bash
# Verificación estricta de tipos de TypeScript y construcción de producción
npm run build
```

---

## 5. Decisiones técnicas relevantes tomadas durante la implementación

1. **Separación Limpia de Capas en Frontend:**
   - `application/`: Manejo de estado global reactivo mediante `AuthContext` (tokens JWT, carrito de compras persistente en `localStorage`).
   - `infrastructure/`: Clientes HTTP tipados (`apiClient.ts`) y Data Transfer Objects (`api.dto.ts`) que mapean fielmente el contrato OpenAPI/RFC 7807 del backend.
   - `presentation/`: Vistas y componentes modulares desacoplados de la lógica de red.
2. **Manejo de Respuestas de Error Vacías y RFC 7807:**
   - La capa de infraestructura (`apiClient`) maneja de forma diferenciada las respuestas vacías (401, 403, 404 con `Content-Length: 0`) y los errores de validación de negocio en formato `application/problem+json` (400 con `detail` y `errors`), mostrando alertas en español con tildes y ortografía correcta al usuario.
3. **Manejo Invariante de Fechas Exclusivas (H-3):**
   - El selector de rango de fechas ajusta automáticamente la fecha `to` al inicio del día siguiente (`T00:00:00Z`) para garantizar que la condición de backend `from <= sold_at < to` incluya las ventas de todo el día seleccionado.
4. **Cumplimiento Estricto de Seguridad (DP-04):**
   - La vista de nuevo vendedor (`/vendedores/nuevo`) no expone ningún selector de roles. El rol `seller` está fijado de forma inmutable tanto en la interfaz como en el backend.
5. **Configuración Nginx de Alto Rendimiento:**
   - `try_files $uri $uri/ /index.html` para soporte total de navegación SPA sin recargas.
   - `client_max_body_size 6m` en el bloque `/media/` y `/api/` para aceptar imágenes de hasta 5 MB sin que Nginx corte la petición con error 413.
