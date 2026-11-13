# CanchaYa

Prototipo web para la búsqueda, reserva, selección de modalidad de pago y división del costo de **canchas privadas de pago** de fútbol (6, 7 y 8) y pádel en **Medellín, Bello, Envigado, Itagüí y Sabaneta** (Valle de Aburrá).

> **Alcance del prototipo:** Escenarios privados ficticios (excluye escenarios del INDER). No existe conexión con pasarelas bancarias reales ni base de datos externa; toda la información de cuentas y reservas persiste localmente en el navegador mediante `localStorage`.

---

## 1. Descripción del producto

- **¿Qué es?** **CanchaYa** es una aplicación web deportiva responsiva enfocada en agilizar la organización de partidos aficionados con amigos.
- **Cliente objetivo:** Personas y grupos de amigos en Medellín y el Valle de Aburrá que organizan partidos semanales o esporádicos de fútbol 6, 7, 8 o pádel.
- **Propuesta de valor:** Reúne en un solo flujo la búsqueda por deporte/municipio/presupuesto, la disponibilidad real por hora en horario de Colombia (`America/Bogota`), la confirmación de reserva con modalidad de pago asociada a la cuenta de cada sede y el cálculo automático de cuánto debe aportar cada jugador, evitando cadenas largas de mensajes y llamadas telefónicas.

---

## 2. Las 5 funcionalidades implementadas

### 1. Registro, inicio y cierre de sesión (modal)
- Formulario modal accesible con pestañas **Iniciar sesión** y **Crear cuenta**.
- Registro con **nombre completo**, **correo electrónico**, **contraseña (mínimo 8 caracteres)** y **confirmación de contraseña**.
- Validación de campos vacíos, formato de correo, longitud mínima, coincidencia de contraseñas y correos duplicados.
- Botón para **mostrar/ocultar contraseña** en los campos de clave y nombre del cliente visible en el encabezado junto al botón **Cerrar sesión**.
- Las contraseñas se guardan en `localStorage` como resumen criptográfico **SHA-256 con sal aleatoria** por usuario (demostración local sin sincronización entre dispositivos).

### 2. Búsqueda y catálogo de canchas privadas
- Precarga de **10 canchas privadas ficticias** distribuidas en Medellín, Bello, Envigado, Itagüí y Sabaneta para las modalidades **Fútbol 6, Fútbol 7, Fútbol 8 y Pádel**.
- Tarjetas uniformes con fotografía deportiva (`4:3`), modalidad, municipio, dirección ficticia, servicios incluidos y tarifa por hora en COP.
- Filtros combinables por **modalidad**, **municipio** y **precio máximo por hora**, botón **Restablecer filtros** y vista clara de estado **sin resultados**.

### 3. Disponibilidad, reserva y modalidad de pago por sede
- Vista de detalle con selector de fecha desde **hoy hasta 30 días adelante** (en hora de Colombia, `America/Bogota`).
- Franjas horarias de **1 hora** desde las **06:00 hasta las 23:00** (último inicio a las **22:00**).
- Desactivación automática de horarios **pasados** (según la hora actual en Colombia) y horarios **ocupados** (compartidos entre cuentas del mismo navegador).
- Exige sesión activa para confirmar y vuelve a validar disponibilidad en `localStorage` al momento de guardar para prevenir conflictos.
- **Pasarela de pago simulada en el resumen de reserva** con dos opciones:
  1. **Pago en efectivo en el lugar**: el partido queda confirmado con estado de pago `Pendiente en sede`.
  2. **Pagar ya mediante transferencia**: muestra los datos bancarios / Nequi / Llave Bre-B ficticios asociados específicamente a la cuenta recaudadora de esa cancha (razón social, NIT, entidad, tipo y número de cuenta, llave y monto exacto en COP), botones para copiar cuenta/llave, campo opcional de comprobante simulado y registro con estado `Pagada (simulado)`.

### 4. Gestión en Mis reservas
- Muestra únicamente las reservas del cliente autenticado, ordenadas cronológicamente por fecha y hora.
- Calcula el estado en tiempo real según la hora de Colombia: **Confirmada**, **En curso**, **Finalizada** o **Cancelada**.
- Muestra el método de pago elegido, el estado del pago, la cuenta asociada de la sede y la referencia simulada (si aplica).
- Permite **cancelar solo antes de la hora de inicio** mediante diálogo de confirmación accesible; conserva el registro como historial (`Cancelada`) y libera de inmediato el horario para otros usuarios.

### 5. Calculadora de división del costo
- Integrada dentro de cada reserva no cancelada (`Confirmada`, `En curso` o `Finalizada`).
- Acepta un entero positivo de jugadores (con controles `-` / `+` e ingreso numérico validado).
- Divide la tarifa total en partes iguales y actualiza el aporte por jugador en **COP con hasta dos decimales** (`Intl.NumberFormat('es-CO')`).
- Conserva la cantidad de jugadores en `localStorage` e informa explícitamente que no procesa cobros ni transferencias reales.

---

## 3. Catálogo precargado (10 canchas ficticias)

| ID | Nombre | Modalidad | Municipio | Tarifa / h (COP) | Cuenta receptora demo |
| --- | --- | --- | --- | --- | --- |
| `cancha-01` | La 10 Arena Poblado | Fútbol 6 | Medellín | $ 150.000 | La 10 Arena Poblado S.A.S. · Bancolombia |
| `cancha-02` | Conquistadores Turf 7 | Fútbol 7 | Medellín | $ 185.000 | Conquistadores Turf Club S.A.S. · Davivienda |
| `cancha-03` | Mirador Las Palmas Pádel | Pádel | Medellín | $ 135.000 | Mirador Pádel Antioquia S.A.S. · Bancolombia |
| `cancha-04` | Norte 6 Sintética Niquía | Fútbol 6 | Bello | $ 120.000 | Complejo Norte 6 Bello S.A.S. · Nequi Negocios |
| `cancha-05` | Club Pádel Cerro Claro | Pádel | Bello | $ 110.000 | Cerro Claro Deportes S.A.S. · Banco de Bogotá |
| `cancha-06` | Territorio 7 La Magnolia | Fútbol 7 | Envigado | $ 175.000 | Territorio 7 Envigado S.A.S. · Bancolombia |
| `cancha-07` | Distrito 8 San Marcos | Fútbol 8 | Envigado | $ 230.000 | Distrito Deportivo San Marcos S.A.S. · BBVA |
| `cancha-08` | Punta Sur Fútbol 6 | Fútbol 6 | Itagüí | $ 130.000 | Punta Sur Escenarios S.A.S. · Bancolombia |
| `cancha-09` | Arena Central Santa María | Fútbol 8 | Itagüí | $ 210.000 | Arena Central Sur S.A.S. · Davivienda |
| `cancha-10` | Sabaneta Pádel Club | Pádel | Sabaneta | $ 125.000 | Sabaneta Pádel Club S.A.S. · Bancolombia |

---

## 4. Diseño visual y arquitectura técnica

- **Paleta de colores:** Verde oscuro `#123C2D`, lima `#D4F86B`, fondo neutro `#F8F9F5`.
- **Tipografías:** `Manrope` (títulos) y `DM Sans` (cuerpo), con respaldo `sans-serif` y cifras tabulares (`tabular-nums`) para precios y horarios.
- **Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4 y `lucide-react`.

### Estructura del proyecto
```text
├── DOCUMENTO_ENTREGA_FINAL.md   # Documento listo para Word/PDF con funcionalidades y prompt
├── README.md                    # Documentación general del repositorio
├── index.html                   # Fuentes Google (Manrope, DM Sans) y metadatos SEO en español
├── metadata.json                # Metadatos del applet CanchaYa
└── src/
    ├── App.tsx                  # Estado global, navegación, filtros y sincronización entre pestañas
    ├── index.css                # Configuración Tailwind CSS y tokens de marca
    ├── types/index.ts           # Tipos TypeScript (canchas, cuentas, reservas, pagos)
    ├── data/courts.ts           # 10 canchas ficticias y sus cuentas receptoras de demostración
    ├── assets/images/           # Fotografías deportivas generadas localmente
    ├── utils/
    │   ├── authCrypto.ts        # Hash SHA-256 con sal aleatoria por usuario
    │   ├── colombiaTime.ts      # Lógica de fecha/hora en America/Bogota y formato COP
    │   └── storage.ts           # Persistencia atómica y validación de conflictos en localStorage
    └── components/
        ├── AuthModal.tsx        # Modal de registro e inicio de sesión
        ├── CatalogSection.tsx   # Filtros combinables, contador y estado vacío
        ├── CostSplitCalculator.tsx # Calculadora de división de costo por jugador
        ├── CourtCard.tsx        # Tarjeta de cancha del catálogo
        ├── CourtDetailView.tsx  # Calendario 30 días, franjas 06:00-23:00 y pasarela simulada
        ├── Footer.tsx           # Pie de página con alcance y avisos de prototipo
        ├── Header.tsx           # Encabezado con marca, navegación y usuario activo
        ├── Hero.tsx             # Portada deportiva con llamado a buscar
        └── MyReservationsView.tsx # Reservas del usuario, estados, pagos y cancelación
```

---

## 5. Ejecución local y publicación

### Requisitos
- Node.js 20 o superior.

### Comandos disponibles
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo en http://localhost:3000
npm run dev

# Verificar tipos TypeScript
npm run lint

# Generar compilación de producción en dist/
npm run build
```

### Documento para entrega académica
Consulta el archivo [`DOCUMENTO_ENTREGA_FINAL.md`](./DOCUMENTO_ENTREGA_FINAL.md) para copiar directamente a Word o exportar a PDF la descripción del producto, las 5 funcionalidades detalladas (qué hacen y cómo se ven) y el prompt completo utilizado para su desarrollo.

### Enlace de la aplicación publicada
- Aplicación web funcional: https://ais-pre-plov3d23iax7lvpcfsdmdf-116308288991.us-west1.run.app
