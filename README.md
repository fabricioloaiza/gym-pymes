# GymXXX · Renovación de membresía

Prototipo web del flujo **TO BE** del proyecto *Finanzas de las PyMES* (UCB Cochabamba): cobro de membresías por **QR Simple**, verificación humana contra la app del banco, vencimientos con recordatorios por WhatsApp y revisión semanal del propietario.

> Todos los datos son **simulados y anonimizados** (30 cobros de octubre 2026, 120 socios activos).

## Pantallas

| Ruta | Pantalla | Quién la usa |
| --- | --- | --- |
| `#/formulario` | Formulario del socio (móvil) | Socio |
| `#/confirmacion/:id` | Confirmación del envío | Socio |
| `#/cobros` | Panel de recepción (inicio) | Recepcionista |
| `#/verificar/:id` | Verificación de un pago | Recepcionista |
| `#/vencimientos` | Vencimientos y recordatorios | Recepcionista |
| `#/revision` | Revisión semanal y muestra de control | Propietario |

## Qué funciona

- El formulario crea un cobro **Pendiente** que aparece en el panel.
- **Control de duplicados:** un N.º de operación repetido se marca en rojo. No se puede aprobar un N.º que ya fue aprobado en otro cobro.
- **Supervisión humana:** "Aprobar" solo se habilita después de marcar "Verifiqué el abono en la app del banco". Para rechazar hay que escribir un motivo.
- Al aprobar, el **vencimiento se calcula por fórmula** (`FECHA.MES(inicio; 1 o 3)`) y la membresía del socio se renueva.
- Los recordatorios abren WhatsApp con el mensaje precargado. **Nada se envía automáticamente.**
- La revisión semanal calcula los indicadores, lista las excepciones, sortea una muestra de control de 5 cobros y **exporta un CSV** que abre en Excel.
- Los cambios se guardan en el navegador. "Restablecer datos de demostración" vuelve al estado inicial.

## Supuestos editables (`config.ts`)

- Fecha de referencia del piloto: **21/10/2026**. Pon `null` para usar la fecha real.
- Precios: Mensual **Bs 150**, Trimestral **Bs 400**.
- Días de aviso de vencimiento: **7**. Tamaño de la muestra de control: **5**.

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Estructura

```
App.tsx            enrutador de pantallas
config.ts          supuestos editables
types.ts           modelo de datos (Cobro, Membresia, EntradaBitacora)
store.tsx          estado de la app (equivale a la hoja de cálculo)
data/seed.ts       datos simulados
lib/utils.ts       fechas, formato Bs, control de duplicados, CSV
components/        cabecera, insignias, íconos
pages/             las 6 pantallas
```

## Limitaciones del prototipo

- No hay servidor: los datos viven en el navegador de quien abre la demo. En la operación real, esta capa sería Google Forms + Google Sheets, como plantea el diseño de la solución.
- La verificación en el banco la hace una persona. La app no se conecta al banco.
- El tiempo por cobro no se mide automáticamente: se registra en el piloto.
