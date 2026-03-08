# Prueba técnica 1
**Autor:** Juan Pablo Murillo Araya

## Referencias

**Especificación de la API:**  
https://documenter.getpostman.com/view/42538225/2sBXcGCecC

**Endpoint base:**  
https://apidev.cafebritt.com/test/functions/api.cfc?method=&token=

---

# Prueba Técnica – Sistema de Facturación Britt

Aplicación desarrollada en **Angular** que permite gestionar facturas y sus líneas de detalle consumiendo una API.

La aplicación permite crear facturas, agregar productos, eliminar líneas y visualizar el total acumulado de la factura.

---

# Tecnologías utilizadas

- Angular
- TypeScript
- Bootstrap
- RxJS
- HTML / CSS
- API REST (ColdFusion CFC)

---

# Funcionalidades principales

## Crear factura

Permite crear una factura indicando:

- Número de factura
- Fecha

Validaciones implementadas:

- El número de factura es obligatorio
- Solo se permiten números enteros positivos
- El número de factura tiene un máximo de 10 caracteres
- Manejo de errores cuando la factura ya existe

---

## Agregar líneas de factura

Se pueden agregar productos a la factura seleccionando:

- Producto
- Cantidad

Mejoras implementadas:

- Si el producto ya existe en la factura, la cantidad se acumula en lugar de crear una nueva línea
- Validación para evitar agregar líneas si no existe una factura activa
- Validación de cantidad mínima
- Se puede agregar o quitar cantidad de producto, actualizando el total y el precio

---

## Eliminar líneas

Permite eliminar una línea específica de la factura.

---

## Visualización del total

El total de la factura se actualiza automáticamente cada vez que:

- Se agrega una línea
- Se elimina una línea
- Se actualiza la cantidad de un producto

---

# Manejo de errores

La aplicación muestra mensajes claros cuando ocurren errores como:

- Factura duplicada
- Campos obligatorios vacíos
- Error de comunicación con la API
- Errores devueltos por el backend

---

# Mejoras implementadas

Durante el desarrollo se agregaron mejoras adicionales para mejorar la experiencia de usuario y la calidad del código:

- Mejora de la interfaz
- Manejo de errores del backend
- Validaciones en formularios reactivos
- Mensajes de alerta dinámicos
- Prevención de acciones inválidas
- Refactorización de funciones extensas en métodos auxiliares
- Tipado fuerte en servicios, modelos y componente
- Organización del código en componentes y servicios

---

# Instalación y ejecución

## 1. Clonar el repositorio

```bash
git clone https://github.com/jmurillo26/Prueba-tecnica-Juan-Pablo.git

## 1. Instalar dependencias
    npm install

## 3. Ejecutar el proyecto
    ng serve
    
## 4. Abrir en el navegador