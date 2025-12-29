# Torem - API de Mensajería para Evaluación Técnica

Una API de mensajería básica desarrollada con **TypeScript**, Node.js y Express para evaluaciones técnicas de desarrollo móvil.

## 🚀 Características

- **Autenticación JWT** con credenciales fijas
- **Envío de mensajes de texto** con respuesta automática
- **Envío de mensajes con imagen** con respuesta automática
- **Paginación de mensajes**
- **WebSockets**
- **Base de datos JSON** (sin dependencias externas)
- **Configuración hardcodeada** (sin variables de entorno)
- **CORS habilitado**

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- **TypeScript** (se instala automáticamente con las dependencias)

## 🛠️ Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/toremsoftware/messaging-api-for-eval.git
   cd messaging-api-for-eval
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Compilar TypeScript:**

   ```bash
   npm run build
   ```

4. **Iniciar el servidor:**

   ```bash
   npm start
   ```

5. **Verificar que funciona:**
   - Abrir http://localhost:8080 en el navegador
   - Deberías ver la información de la API


## 🔐 Autenticación

### Credenciales Fijas

- **Username:** `testuser`
- **Password:** `testpass123`

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}
```

**Respuesta exitosa:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "testuser"
  }
}
```

**Error (403):**

```json
{
  "error": "Invalid credentials",
  "message": "Incorrect username or password"
}
```

## 📝 Estructura de Respuestas

### Respuestas Exitosas

- **NO incluyen** el campo `message`
- Contienen directamente los datos relevantes (`token`, `user`, `data`, `pagination`, etc.)

### Respuestas de Error

- **Siempre incluyen** los campos `error` y `message`
- `error`: Tipo de error (ej: "Invalid credentials")
- `message`: Descripción detallada del error

## 💬 Endpoints de Mensajería

Todos los endpoints requieren el token JWT en el header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Enviar Mensaje de Texto

```bash
POST /api/messages/send-text
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "text": "Hola, este es mi mensaje"
}
```

**Respuesta:**

```json
{
  "data": {
    "id": "1703123456789",
    "text": "Hola, este es mi mensaje",
    "type": "text",
    "username": "testuser",
    "timestamp": "2025-12-06T15:30:00.000Z",
    "isAutoResponse": false
  }
}
```

**Estructura del objeto Message:**

| Campo            | Tipo              | Descripción                                                                                      |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `id`             | string            | Identificador único del mensaje (timestamp como string)                                          |
| `text`           | string            | Contenido del mensaje de texto                                                                   |
| `type`           | "text" \| "image" | Tipo de mensaje: texto o imagen                                                                  |
| `username`       | string            | Username del usuario que envió el mensaje                                                        |
| `timestamp`      | string            | Fecha y hora del mensaje en formato ISO                                                          |
| `isAutoResponse` | boolean           | **true** si es una respuesta automática del sistema, **false** si es un mensaje real del usuario |
| `imageUrl`       | string?           | URL de la imagen (solo para mensajes tipo "image")                                               |
| `imageName`      | string?           | Nombre original del archivo de imagen                                                            |
| `imageSize`      | number?           | Tamaño del archivo en bytes                                                                      |
| `replyTo`        | string?           | ID del mensaje al que está respondiendo automáticamente (solo para respuestas automáticas)       |

**Nota:** A los 2 segundos se enviará automáticamente un mensaje "Texto recibido" por WebSocket.

### 2. Enviar Mensaje con Imagen

```bash
POST /api/messages/send-image
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Form Data:
- image: [archivo de imagen]
- caption: "Descripción opcional"
```

**Respuesta:**

```json
{
  "data": {
    "id": "1703123456790",
    "text": "Descripción opcional",
    "type": "image",
    "username": "testuser",
    "imageUrl": "/uploads/image-1703123456790-123456789.jpg",
    "imageName": "mi_imagen.jpg",
    "imageSize": 1048576,
    "timestamp": "2025-12-06T15:31:00.000Z",
    "isAutoResponse": false
  }
}
```

**Nota:** A los 2 segundos se enviará automáticamente un mensaje "Imagen recibida" por WebSocket.

### 3. Obtener Mensajes

```bash
GET /api/messages?offset=0&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Parámetros de consulta:**

- `offset` (opcional): Número de elementos a saltar (default: 0)
- `limit` (opcional): Mensajes por página (default: 10, máximo: 50)

**Respuesta:**

```json
{
  "elements": [
    {
      "id": "1703123456790",
      "text": "Imagen recibida",
      "type": "text",
      "username": "system",
      "timestamp": "2025-12-06T15:31:02.000Z",
      "isAutoResponse": true,
      "replyTo": "1703123456789"
    },
    {
      "id": "1703123456789",
      "text": "Hola, este es mi mensaje",
      "type": "text",
      "username": "testuser",
      "timestamp": "2025-12-06T15:31:00.000Z",
      "isAutoResponse": false
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "totalMessages": 2,
    "hasMore": false
  }
}
```

## 🔌 WebSockets

La API incluye WebSockets para mensajes en tiempo real:

- **URL de conexión:** `http://localhost:8080`
- **Evento para unirse:** `join-chat` con `{ username: "tu_usuario" }`
- **Room del chat:** `chat-room`
- **Evento de mensajes nuevos:** `new-message`

### Límites

- **Tamaño de imagen:** Máximo 5MB
- **Tipos de imagen:** jpeg, jpg, png, gif, webp
- **Paginación:** Máximo 50 mensajes por página


## 🍀 Mucha suerte!