# WEB — Sitio web de marketing

## Propósito

Sitio web de marketing de Clásicos Garage. Conectado a GitHub con auto-deploy en Vercel.
Todo push a la rama principal despliega automáticamente en producción.

## Páginas

| Archivo | Contenido |
|---------|-----------|
| `index.html` | Home: experiencias, colección preview, testimonios, CTA |
| `coleccion.html` | Colección completa de autos con carruseles |
| `eventos.html` | Casamientos y eventos |
| `escapes.html` | Escapadas y rutas |
| `activaciones.html` | Activaciones de marca |
| `ejecutivo.html` | Traslados ejecutivos |
| `experiencias.html` | Overview de experiencias |

## Imágenes

`WEB/images/` es una **copia de deploy** de `IMAGENES/*/FINAL/` necesaria para Vercel.
**No editar `WEB/images/` manualmente.**

Cuando se agregan imágenes nuevas a `IMAGENES/*/FINAL/`:
→ Copiarlas también a `WEB/images/COLLECTION/<carpeta-del-auto>/`

Cuando se generan imágenes promo con `gen-promo.mjs`:
→ Copiarlas también a `WEB/images/PROMO/`

## ⚠️ Lo que NO va en WEB

- **No crear páginas de demo de Instagram aquí.** El demo de Instagram vive en `IG_DEMO/index.html`.
- El link "Instagram" en el nav apunta a la cuenta real: `https://www.instagram.com/clasicosgarage.rentals/`

## Despliegue

```bash
git add .
git commit -m "descripción"
git push
# → Vercel detecta el push y despliega automáticamente
```
