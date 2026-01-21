Manual de Entrega: Plataforma Web Kebab & Shawarma
Fecha: 21 de Enero de 2026
Versión: 1.1.0

1. Resumen del Proyecto

Este proyecto consiste en una Plataforma Web E-commerce y Administrativa diseñada a medida para Kebab & Shawarma. El sistema permite a los clientes explorar el menú de forma interactiva, realizar pedidos en línea con integración de pagos segura y rastrear el estado de sus compras en tiempo real.

Simultáneamente, ofrece un Panel de Administración privado que permite al equipo de Kebab & Shawarma gestionar el negocio de manera eficiente, desde la recepción de pedidos hasta la actualización de precios e imágenes promocionales, sin necesidad de conocimientos técnicos avanzados.

2. Características Principales

Para el Cliente (Pública)
- **Menú Interactivo:** Visualización elegante de productos con efectos de zoom y detalles rápidos.
- **Carrito de Compras Premium:** Gestión intuitiva de productos con cálculo automático de totales.
- **Sistema de Geolocalización (OpenStreetMap):** Permite al cliente marcar su ubicación exacta en un mapa interactivo (totalmente gratuito, sin costos de API).
- **Cálculo Automático de Domicilio:** El sistema identifica el barrio o calcula la distancia desde el local (Los Ejecutivos) para asignar automáticamente la tarifa de envío correcta ($5.000, $8.000 o $12.000).
- **Pagos Integrados:** Conexión con Wompi para tarjetas, PSE y transferencias bancarias.
- **Rastreo en Vivo:** Página dedicada para seguir el progreso del pedido con línea de tiempo animada.
- **Diseño Ultra-Premium:** Estética oscura, urbana y profesional optimizada para móviles y escritorio.

Para el Administrador (Privada)
- **Dashboard Moderno:** Panel de control con estilo SaaS para monitorear pedidos en tiempo real.
- **Gestión de Estados:** Actualización fluida del ciclo del pedido (Pendiente -> Cocina -> Listo -> Entregado).
- **Control de Inventario:** Editor visual de productos y categorías con funciones de arrastrar y soltar (Drag & Drop).
- **Banners Dinámicos:** Gestión del carrusel principal (Hero) para actualizar promociones visuales fácilmente.

3. Acceso al Panel Administrativo

Para gestionar la plataforma, ingrese a la ruta de administración utilizando las credenciales asignadas a continuación.

URL de Acceso: https://kebabyshawarma.com/admin
Usuario: admin@kebabyshawarma.com
Contraseña: AdminSeguro2025.

Nota de Seguridad: Recomendamos cerrar sesión al finalizar sus tareas administrativas para proteger la información del negocio.

4. Guía de Uso de Nuevas Funciones

A. Uso del Mapa en Checkout
Al finalizar el pedido, el cliente verá un botón "Buscar mi dirección en el mapa". Al activarlo, puede:
1. Pulsar "Usar mi ubicación" para que el GPS detecte su casa.
2. Tocar el mapa para ajustar el punto de entrega.
El sistema escribirá la dirección y seleccionará el barrio y precio del domicilio automáticamente.

B. Gestión de Zonas de Domicilio
Los valores y barrios están configurados en el sistema de forma híbrida:
- **Prioridad 1:** Coincidencia por nombre de barrio (ej: Gaviotas, El Campestre).
- **Prioridad 2:** Si el barrio no es reconocido, se calcula la distancia en línea recta (Radio de 2km, 5km y 10km) para asignar el precio.

C. Branding Limitless Solutions
Se ha integrado la firma de desarrollador de forma elegante en el pie de página, permitiendo atraer nuevos clientes interesados en la tecnología de la plataforma.