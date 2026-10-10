# By Sellens · Product Portal

Aplicación web independiente para la consulta y el control de existencias de By Sellens. Utiliza React 19, Ionic React 9, Vite 6 y `@bysellens/frontend-core@1.0.0`.

## Desarrollo

```bash
npm ci
npm run dev
```

Vite sirve Product en `http://localhost:5176`. El modo predeterminado usa datos MOCK y no requiere backend. Para iniciar sesión en modo MOCK, usa `admin@bysellens.com` y `demo123`.

## Pruebas y build

```bash
npm run test.unit
npm run lint
npm run build
```

## Docker

```bash
docker build -t bysellens-product .
docker run --rm -p 5176:80 bysellens-product
```

Nginx sirve la aplicación y `/health` responde `200` para el healthcheck del contenedor. La imagen no incluye backend ni base de datos.

## Alcance

El portal usa el arranque, login, sesión y configuración MOCK compartidos. La pantalla Product permite consultar, buscar y filtrar existencias, con indicadores de stock bajo y agotado. Los ajustes de inventario se incorporarán en un incremento posterior.

## Ramas

Los cambios se proponen mediante pull requests hacia `develop`. Las promociones a `qa` y `main` siguen la política del equipo y se realizan mediante `git cherry-pick -x`.
