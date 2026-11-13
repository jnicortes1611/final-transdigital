# Documento de Entrega Final — Diseño y Transformación Organizacional

**Producto Digital:** CanchaYa  
**Enlace de la aplicación web funcional:** https://ais-pre-plov3d23iax7lvpcfsdmdf-116308288991.us-west1.run.app  

---

## 1. Descripción del producto, cliente objetivo y propuesta de valor

**¿Qué es el producto?**  
**CanchaYa** es una plataforma web responsiva para buscar, consultar disponibilidad en tiempo real, reservar, elegir modalidad de pago y dividir el costo de **canchas deportivas privadas de pago** (fútbol 6, fútbol 7, fútbol 8 y pádel) en **Medellín, Bello, Envigado, Itagüí y Sabaneta** (excluyendo escenarios públicos del INDER).  
*(Nota: El sistema funciona como un prototipo demostrativo con 10 canchas ficticias, sin pasarela bancaria real y con almacenamiento local en el navegador mediante `localStorage`).*

**¿A qué tipo de cliente se dirige?**  
Se dirige a **personas que organizan partidos de fútbol o pádel con amigos** en Medellín y el Valle de Aburrá (capitanes de grupo, compañeros de trabajo, grupos universitarios y jugadores frecuentes) que normalmente coordinan sus partidos por chat y llamadas.

**¿Cómo agrega valor?**  
Centraliza en un solo lugar todo el proceso que hoy está fragmentado entre WhatsApp, llamadas y hojas de cálculo: permite filtrar canchas según deporte, municipio y presupuesto; ver los horarios libres exactos en hora de Colombia sin esperar respuesta de un administrador; elegir si se paga en efectivo en la sede o mediante transferencia a la cuenta de esa cancha; cancelar a tiempo si el grupo no se completa; y calcular al instante cuánto debe aportar cada jugador en pesos colombianos (COP).

---

## 2. Lista y descripción detallada de las 5 funcionalidades principales

### Funcionalidad 1: Registro, inicio y cierre de sesión del cliente
- **¿Qué debe hacer?**  
  Permitir que el usuario cree una cuenta local con **nombre completo, correo electrónico, contraseña (mínimo 8 caracteres) y confirmación de contraseña**. Debe validar campos vacíos, formato válido de correo, longitud mínima, coincidencia entre contraseña y confirmación, y rechazar correos duplicados. También debe permitir **iniciar sesión**, **cerrar sesión** y alternar la visibilidad de las contraseñas. Las cuentas se almacenan en `localStorage` guardando la contraseña como un **resumen SHA-256 con sal aleatoria** e informando que es un acceso local demostrativo sin sincronización entre dispositivos.
- **¿Cómo debe verse?**  
  Un **formulario modal** limpio con pestañas para cambiar entre *Iniciar sesión* y *Crear cuenta*, etiquetas visibles encima de cada campo, un botón con ícono de ojo dentro de los campos de contraseña para mostrar/ocultar texto, mensajes de error en un recuadro rojo de alerta claro y un aviso informativo al pie del modal. Cuando el cliente inicia sesión, su **nombre** aparece en el encabezado superior junto al botón **Cerrar sesión**.

### Funcionalidad 2: Búsqueda y filtrado del catálogo de canchas privadas
- **¿Qué debe hacer?**  
  Mostrar un catálogo precargado de **10 canchas privadas ficticias** (fútbol 6, 7, 8 y pádel en Medellín, Bello, Envigado, Itagüí y Sabaneta) con **filtros combinables** por **modalidad**, **municipio** y **precio máximo por hora en COP**. Debe incluir un botón para **restablecer filtros** y mostrar un estado **sin resultados** cuando la combinación seleccionada no coincida con ninguna cancha.
- **¿Cómo debe verse?**  
  Debajo de la portada deportiva, una barra horizontal de filtros con botones segmentados para la modalidad, una lista desplegable para el municipio, un control deslizante con el valor en COP para el precio máximo y un botón para restablecer filtros, además del conteo dinámico de canchas encontradas. Debajo se muestra una cuadrícula responsiva (3 columnas en escritorio, 2 en tableta, 1 en celular) de tarjetas uniformes con foto `4:3`, modalidad y municipio, nombre en negrita, dirección ficticia, lista de servicios incluidos, tarifa por hora en cifras tabulares y botón **Ver horarios**. Si no hay coincidencias, aparece una tarjeta centrada con mensaje claro y botón para restablecer.

### Funcionalidad 3: Disponibilidad en hora de Colombia, reserva y modalidad de pago por sede
- **¿Qué debe hacer?**  
  Al abrir una cancha, permitir elegir una fecha desde **hoy hasta 30 días adelante** y mostrar franjas horarias de **1 hora desde las 06:00 hasta las 23:00** (último inicio a las **22:00**), calculado estrictamente en **hora de Colombia (`America/Bogota`)**. Debe desactivar automáticamente los horarios que ya pasaron en la hora actual de Colombia y los horarios ya ocupados por cualquier cuenta en ese navegador. Debe exigir sesión iniciada para confirmar, revalidar disponibilidad en `localStorage` justo al guardar para evitar reservas duplicadas, y ofrecer una **pasarela de pago simulada** con dos opciones: **Pago en efectivo en el lugar** (`Pendiente en sede`) o **Pagar ya mediante transferencia**, mostrando en este segundo caso la cuenta bancaria/Nequi ficticia asociada específicamente a esa cancha y registrando una referencia simulada (`Pagada (simulado)`).
- **¿Cómo debe verse?**  
  Una vista de detalle en dos columnas: a la izquierda, la ficha completa de la cancha (foto, superficie, dirección, servicios, precio y cuenta recaudadora de demostración de la sede); a la derecha, el reloj actual en hora de Colombia, un selector rápido horizontal de fechas más un menú desplegable (31 días), y una cuadrícula de 17 botones horarios con estado explícito (*Disponible*, *Ocupado*, *Pasado*, *Seleccionado*). Al elegir una franja aparece el **Resumen y método de pago** con el valor total y dos tarjetas seleccionables (*Pago en efectivo en el lugar* y *Pagar ya mediante transferencia*); al elegir transferencia se despliega un recuadro con razón social, NIT, banco, tipo y número de cuenta con botón *Copiar*, llave/Nequi y campo opcional de comprobante simulado, junto al botón principal verde lima para confirmar.

### Funcionalidad 4: Gestión de reservas personales en Mis reservas
- **¿Qué debe hacer?**  
  Mostrar **únicamente las reservas del cliente autenticado**, ordenadas cronológicamente por fecha y hora. Debe calcular automáticamente el estado de cada reserva según la hora actual en Colombia (**Confirmada**, **En curso**, **Finalizada** o **Cancelada**), mostrar la modalidad de pago elegida y la cuenta de la sede asociada, y permitir **cancelar la reserva únicamente antes de su hora de inicio** (cuando está en estado *Confirmada*) mediante un diálogo de confirmación. Al cancelar, debe conservar el registro en el historial con estado *Cancelada* y **liberar inmediatamente el horario** para que cualquier usuario pueda reservarlo de nuevo.
- **¿Cómo debe verse?**  
  Una lista vertical de tarjetas limpias en la sección **Mis reservas** (si no hay sesión iniciada, muestra un aviso con botón para ingresar). Cada tarjeta exhibe en la parte superior una etiqueta con ícono y texto del estado (*Confirmada*, *En curso*, *Finalizada* o *Cancelada*), nombre de la cancha, modalidad, municipio, dirección, fecha, horario en hora de Colombia, valor total, resumen del método de pago/cuenta receptora y, solo cuando aplica (*Confirmada*), el botón **Cancelar reserva**, que abre una ventana modal de confirmación antes de ejecutar el cambio.

### Funcionalidad 5: Calculadora de división del costo entre jugadores
- **¿Qué debe hacer?**  
  Incluir una calculadora dentro de **cada reserva no cancelada** (*Confirmada*, *En curso* o *Finalizada*) que acepte un **número entero positivo de jugadores**, divida el precio total de la reserva en partes iguales, actualice en tiempo real el aporte por jugador en **COP con hasta dos decimales**, **conserve la cantidad de jugadores** elegida en `localStorage` al recargar la página e informe explícitamente que no procesa pagos reales.
- **¿Cómo debe verse?**  
  Un bloque integrado en la parte inferior de cada tarjeta de reserva no cancelada, separado por una línea sutil, con etiqueta visible *Dividir costo entre jugadores*, botones táctiles `-` y `+` junto a un campo numérico centrado (con mensaje de error si se escribe 0, negativos o texto inválido), y un recuadro destacado a la derecha que muestra en cifras tabulares el valor exacto por persona (por ejemplo, `$ 21.428,57`), acompañado de una nota aclaratoria indicando que el cálculo es informativo y que CanchaYa no procesa pagos ni transferencias.

---

## 3. Prompt para la Inteligencia Artificial

> A continuación se presenta el prompt estructurado para que una IA desarrolle el producto completo con consistencia funcional y visual:

```text
Desarrolla un producto web llamado CanchaYa para una empresa propuesta de reservas de canchas privadas de pago en Medellín y municipios cercanos.
Cliente objetivo: personas que organizan partidos con amigos.
Propuesta de valor: reunir búsqueda, disponibilidad, reserva, elección de pago y reparto del costo en un solo lugar, reduciendo llamadas y mensajes. Excluye escenarios del INDER.

Precarga 10 canchas ficticias de Fútbol 6, Fútbol 7, Fútbol 8 y Pádel en Medellín, Bello, Envigado, Itagüí y Sabaneta, con nombres, direcciones ficticias, servicios incluidos, tarifas por hora en COP y datos ficticios de una cuenta bancaria/Nequi/Llave Bre-B asociada a cada sede. Indica claramente que es un prototipo sin pagos reales.

Implementa exactamente estas cinco funcionalidades:
1. Registro e inicio de sesión: formulario modal con nombre completo, correo y contraseña de mínimo 8 caracteres con confirmación. Valida campos vacíos, formato de correo, coincidencia y correos duplicados. Añade inicio y cierre de sesión, botón para mostrar/ocultar contraseña, mensajes de error claros y muestra el nombre del cliente activo en el encabezado. Guarda contraseñas como resumen SHA-256 con sal aleatoria en localStorage y aclara que el acceso local es demostrativo.
2. Búsqueda: catálogo de tarjetas con foto de referencia, nombre, modalidad, municipio, dirección, servicios y precio por hora en COP. Incluye filtros combinables de modalidad, municipio y precio máximo por hora, botón de restablecimiento y estado sin resultados.
3. Disponibilidad, reserva y pasarela de pago simulada: vista de detalle con selector de fecha desde hoy hasta 30 días adelante y horarios de una hora desde las 06:00 hasta las 23:00 (último inicio a las 22:00), siempre en hora de Colombia (America/Bogota). Desactiva horarios pasados y ocupados. Exige sesión iniciada para confirmar, muestra resumen con costo total y revalida disponibilidad en localStorage al guardar. Incluye una pasarela de pago simulada con dos opciones: "Pago en efectivo en el lugar" (Pendiente en sede) o "Pagar ya mediante transferencia", mostrando en esta última los datos de la cuenta bancaria/Nequi propia de la sede seleccionada, botón para copiar, campo opcional de comprobante simulado y estado "Pagada (simulado)".
4. Gestión en Mis reservas: muestra solo las reservas del cliente activo, ordenadas por fecha y hora, con estado Confirmada, En curso, Finalizada o Cancelada según la hora de Colombia, además del método de pago, estado de pago y cuenta asociada de la sede. Permite cancelar solo antes de la hora de inicio mediante diálogo modal de confirmación; conserva el registro como Cancelada y libera el horario inmediatamente.
5. División del costo: calculadora integrada en cada reserva no cancelada. Acepta un entero positivo de jugadores (con controles + y -), divide el precio en partes iguales y actualiza el aporte por jugador en COP con hasta dos decimales. Conserva la cantidad de jugadores en localStorage e informa que no procesa pagos reales.

Persistencia: guarda cuentas y reservas en localStorage; persiste al recargar y comparte disponibilidad entre cuentas del mismo navegador. Explica que no sincroniza entre dispositivos. Sin base de datos externa ni panel administrativo.

Diseño visual y accesibilidad:
- Estilo deportivo moderno y fácil de usar en celular y escritorio.
- Colores: verde oscuro #123C2D, lima eléctrico #D4F86B y fondo claro #F8F9F5.
- Tipografías: Manrope para títulos y DM Sans para texto general con respaldo sans-serif y números tabulares en precios y horarios.
- Encabezado con marca CanchaYa, enlaces "Explorar canchas" y "Mis reservas", y acceso/nombre del cliente.
- Portada con mensaje breve, fotografía deportiva y botón principal para ir a buscar canchas.
- Etiquetas visibles en todos los controles, foco visible de teclado, botones táctiles accesibles y contraste adecuado.
```
