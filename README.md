<div align="center">

# GymTonic

**Aplicación web de entrenamiento y comunidad deportiva**

Crea entrenamientos a partir de rutinas diseñadas por profesionales, sigue tu progreso
y compárate con las personas a las que sigues.

[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-deploy-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
![Versión](https://img.shields.io/badge/versión-1.1.0-555555?style=flat-square)

[Demo en producción](http://deploy.fic.udc.es/gymtonic) ·
[Informe de cierre](FD%20-%20Informe%20de%20cierre.pdf)

</div>

---

## Índice

1. [Descripción](#descripción)
2. [Funcionalidades](#funcionalidades)
3. [Usuarios de prueba](#usuarios-de-prueba)
4. [Tecnologías](#tecnologías)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Puesta en marcha](#puesta-en-marcha)
7. [Despliegue](#despliegue)
8. [Calidad y pruebas](#calidad-y-pruebas)
9. [Desarrollo del proyecto](#desarrollo-del-proyecto)
10. [Información adicional](#información-adicional)
11. [Errores conocidos](#errores-conocidos)
12. [Equipo](#equipo)

---

## Descripción

GymTonic es una aplicación de gimnasio que permite a los usuarios crear entrenamientos basados
en rutinas elaboradas por entrenadores y, al mismo tiempo, participar en una comunidad online que
fomenta el alto rendimiento deportivo y los hábitos saludables.

Cada usuario dispone de un feed, un sistema de seguidores, estadísticas personales, medallas de
logros y rankings con los que comparar su progreso con el de las personas a las que sigue.

---

## Funcionalidades

La aplicación define tres roles con jerarquía creciente. Cada rol hereda todas las acciones de los
roles inferiores.

| Rol | Descripción |
| --- | --- |
| **Usuario** | Registra entrenamientos, sigue a otros usuarios y participa en la comunidad. |
| **Entrenador** | Diseña rutinas y solicita nuevos ejercicios para el catálogo. |
| **Administrador** | Gestiona el catálogo de ejercicios y los usuarios de la plataforma. |

### Usuario

- **Inicio.** Muestra las rutinas publicadas y el feed de entrenamientos de los usuarios seguidos.
  Desde el detalle de una rutina o entrenamiento se pueden consultar series y ejercicios, dar
  *like* y comentar.
- **Crear entrenamiento.** A partir de una rutina se configura nombre, descripción, duración,
  visibilidad y el peso de cada serie.
- **Perfil.** Seguidores y seguidos, estadísticas en gráficos, medallas de logros, historial de
  entrenamientos y resumen tipo *Wrapped*. Los perfiles de terceros son visibles si se les sigue.
- **Buscador.** Búsqueda de ejercicios, rutinas y usuarios, con opción de seguir rutinas y
  usuarios o bloquear a estos últimos.
- **Solicitudes.** Aceptación o rechazo de solicitudes de seguimiento, con notificación asociada.
- **Leaderboards.** Ranking entre seguidores por ejercicio (serie con mayor peso levantado) o por
  rutina (suma del peso de todas las series de todos los ejercicios).
- **Notificaciones.** Nuevas rutinas, medallas, solicitudes de seguimiento y aviso de pérdida de
  racha.

### Entrenador

- **Crear rutina.** Plantilla con nombre, duración, visibilidad pública o privada y ejercicios del
  catálogo. Sin cuenta premium se limita a 3 rutinas con un máximo de 5 ejercicios cada una.
- **Solicitar ejercicio.** Propuesta de nuevo ejercicio indicando grupo muscular, dificultad,
  nombre, equipamiento, número de series y descripción. Disponible solo para entrenadores premium.

### Administrador

- **Administración de ejercicios.** Aprobación o rechazo de las solicitudes de entrenadores y
  bloqueo de ejercicios existentes.
- **Administración de usuarios.** Listado de usuarios registrados y bloqueo permanente del acceso.

---

## Usuarios de prueba

Todos los usuarios comparten la contraseña `12345`.

| Usuario | Rol |
| --- | --- |
| `admin1` | Administrador |
| `trainer1` | Entrenador |
| `user1`, `user2`, `user3` | Usuario |

---

## Tecnologías

| Capa | Herramientas |
| --- | --- |
| Backend | Java 17, Spring Boot 3.3.3 (Web, Data JPA, Security, Actuator), JWT, Hibernate Validator |
| Base de datos | H2 (fichero local) |
| Frontend | React 18, React Router (HashRouter), Tailwind CSS, Recharts, React Calendar, Three.js |
| Pruebas | JUnit y JaCoCo (backend), Jest y Testing Library (frontend), Apache JMeter (rendimiento) |
| Integración continua | Jenkins, SonarQube |
| Despliegue | Docker, Kubernetes, Eclipse JKube |
| Gestión | Maven, Yarn, Redmine, GitFlow |

---

## Estructura del proyecto

```
FD-GymTonic
├── pom.xml
├── src
│   ├── main
│   │   ├── java/es/udc/fi/dc/fd
│   │   │   ├── model          # Entidades JPA y servicios de negocio
│   │   │   └── rest           # Controladores REST, DTOs y configuración común
│   │   ├── resources          # application.yml, schema.sql, data.sql
│   │   ├── docker             # Dockerfile
│   │   └── jkube              # Recursos de despliegue en Kubernetes
│   └── test/java/es/udc/fi/dc/fd
│       ├── model              # Tests de entidades y servicios
│       └── rest               # Tests de controladores
└── frontend
    ├── package.json
    └── src
        ├── backend            # Cliente de la API REST
        ├── modules            # Páginas y componentes
        └── tests              # Tests de páginas y componentes
```

Tanto el backend como el frontend se sirven bajo el path `/gymtonic`. Por requisitos del despliegue,
el frontend usa `HashRouter`, de modo que sus rutas siguen el patrón `/gymtonic/#/subruta`.

---

## Puesta en marcha

### Requisitos

Versiones con las que se ha probado el proyecto:

| Herramienta | Versión |
| --- | --- |
| Java | 17 |
| Apache Maven | 3.8.7 |
| Node | 22.18.0 |
| Yarn | 1.22.19 |

### Opción 1: backend en 8080 y frontend en 3000

Recomendada para desarrollo, ya que permite recarga en caliente del frontend.

```bash
# Compilar e instalar el proyecto
mvn clean install

# Arrancar el backend
mvn spring-boot:run
```

En otra terminal, dentro de `frontend/`:

```bash
# Instalar dependencias (innecesario si mvn install terminó correctamente)
yarn install

# Arrancar la aplicación React
yarn start
```

La aplicación queda disponible en <http://localhost:3000/gymtonic>.

### Opción 2: todo en el puerto 8080

```bash
mvn clean install
mvn spring-boot:run
```

Gracias a la configuración de plugins de Maven, el frontend compilado se sirve directamente en
<http://localhost:8080/gymtonic>.

### Ejecutar los tests

```bash
# Backend (genera el informe de cobertura de JaCoCo)
mvn test

# Frontend, dentro de frontend/
yarn test
```

---

## Despliegue

El despliegue en producción se realiza desde Jenkins sobre Kubernetes. La aplicación está
disponible en <http://deploy.fic.udc.es/gymtonic>.

El goal configurado en Jenkins encadena todo el proceso:

```bash
mvn clean install k8s:build k8s:resource k8s:undeploy k8s:push k8s:deploy
```

Los mismos pasos pueden ejecutarse de forma individual:

| Paso | Comando |
| --- | --- |
| Compilar el proyecto | `mvn clean install` |
| Construir la imagen Docker | `mvn k8s:build` |
| Retirar el despliegue anterior (si existe) | `mvn k8s:undeploy` |
| Subir la imagen al registro de GitLab | `mvn k8s:push` |
| Generar los ficheros de despliegue | `mvn k8s:resource` |
| Desplegar en Kubernetes | `mvn k8s:deploy` |

> **Nota sobre el health check.** Para evitar el error 503 persistente de nginx fue necesario
> permitir de forma explícita el acceso a los endpoints de Actuator en `SecurityConfig.java`,
> ya que Kubernetes no podía comprobar el estado del pod pese a que la ruta `/**` estaba abierta:
>
> ```java
> .requestMatchers(antMatcher("/actuator/**")).permitAll()
> ```

---

## Calidad y pruebas

### Métricas generales

| Indicador | Resultado |
| --- | --- |
| Cobertura global | 83,8 % |
| Tests de backend (JUnit) | 414 |
| Tests de frontend (Jest) | 756 |
| Ejecuciones en Jenkins | 140 |
| Quality Gate de SonarQube | Superado desde la tercera iteración |

Los tests de backend se dividen en `model` (servicios y entidades) y `rest` (controladores). Los de
frontend se dividen en páginas y componentes.

### Pruebas de rendimiento

Realizadas con Apache JMeter 5.6.3 sobre la aplicación desplegada en un contenedor Docker local,
para aproximar el entorno de producción. Equipo de pruebas: Ryzen 7 2700X (8 núcleos, 16 hilos),
32 GB de memoria y Windows 11.

| Prueba | Escenario | Resultado |
| --- | --- | --- |
| Carga | 3 grupos de 50 hilos, subida de 100 s, flujo habitual (login, crear entrenamiento, estadísticas, historial) | Respuestas correctas y tiempos bajos |
| Estrés | Carga creciente de usuarios concurrentes | Estable hasta unos 100 usuarios; degradación progresiva desde 150 |
| Estrés agresivo | 10.000 hilos en 50 s | Fallos significativos; latencia y errores se disparan a partir de 100 peticiones por segundo |
| Pico | 50 usuarios sostenidos más un pico de 200 usuarios en 5 s | Sin errores; percentil 90 cercano a 3 s durante el pico y recuperación posterior |
| Resistencia | Creación de entrenamientos con 10.000 usuarios y subida de 5 minutos | Se eligió por ser la operación más compleja: dos llamadas al backend y numerosas inserciones en la tabla `Serie` |

---

## Desarrollo del proyecto

El proyecto se desarrolló en cuatro sprints, cada uno con una metodología distinta.

### Sprint 1: metodología libre

- Gestión de rutinas (crear, modificar y eliminar)
- Gestión de usuarios (registro, login, cambio de contraseña y actualización de perfil)
- Alta y visualización de ejercicios y rutinas

El trabajo sobre una única rama y la escasa comunicación dificultaron la organización inicial.

### Sprint 2: Scrum

- Creación de ejercicios por parte de entrenadores
- Notificaciones básicas
- Red social: seguimiento entre usuarios y de rutinas
- Bloqueo de ejercicios y de usuarios por el administrador
- Registro de entrenamientos

La adopción de GitFlow redujo los conflictos al trabajar en paralelo, y Redmine permitió ver en todo
momento qué tareas estaban asignadas y cuáles libres.

### Sprint 3: Kanban

- Nuevos atributos de usuario (peso, altura, etc.)
- Entrenadores premium y suscripción a entrenadores
- Histórico de entrenamientos
- Bloqueo entre usuarios y solicitudes de seguimiento
- Mejoras en la búsqueda

Se incorporaron Jenkins y SonarQube, lo que agilizó las revisiones de código: cualquier cambio que no
compilara o no superara el Quality Gate se devolvía para su corrección.

### Sprint 4: XP

- Notificaciones de medallas, solicitudes y pérdida de racha
- Estadísticas personales, sistema de medallas y *Wrapped*
- Comentarios y *likes* en entrenamientos
- Feed de entrenamientos de amigos
- Leaderboards de rutina y ejercicio
- Verificación de entrenadores

Fue la iteración más exigente por la coincidencia con otras entregas y el cambio desde Kanban a una
metodología con más planificación. En ella se consolidó el uso de las herramientas y se introdujo
Docker.

---

## Información adicional

Para probar la notificación de pérdida de racha:

1. Crear un entrenamiento en el día actual.
2. Si al día siguiente no se ha registrado ningún entrenamiento antes de las 18:00, el usuario recibe
   un aviso de que va a perder su racha.

---

## Errores conocidos

- Tras realizar una búsqueda, la única forma de volver a ver todas las rutinas es acceder a la
  pestaña *Inicio* de la barra lateral.
- En ocasiones el contador de notificaciones sin leer no se actualiza correctamente.

---

## Equipo

### Equipo de desarrollo

| Nombre | Contacto |
| --- | --- |
| Diego Bouso Paz | diego.bouso@udc.es |
| Aarón Eiroa López | aaron.eiroa@udc.es |
| Marcos López Barrio | marcos.barrio@udc.es |
| Alejandro Luis Núñez Alvarellos | alejandro.luis.nunez@udc.es |
| Alejandro López Vila | alejandro.lopez.vila@udc.es |
| Adrián Rodríguez López | adrian.rodriguez12@udc.es |
| Diego Otero Fontáns | d.oterof@udc.es |

### Plantilla base

Proyecto construido a partir de la plantilla Spring Boot + React de **Jorge Gabín**,
**Alfonso Landín** y **Javier Parapar** (IRLab).

---

<div align="center">

Facultad de Informática · Universidade da Coruña · Frameworks de Desarrollo

</div>
