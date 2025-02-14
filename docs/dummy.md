# Authentication Service Documentation

## Docker Compose Commands

### Start the Authentication Service with All Dependencies
To launch the dummyentication service along with all required dependencies, run:
```sh
docker compose -f 'docker/dummy/docker-compose.yaml' up -d --build
```

### Start Only the Dependencies
To start only the essential dependencies (PostgreSQL, Redis, etc.), execute:
```sh
docker compose -f 'docker/dummy/docker-compose.resources.yaml' up -d --build
```

### Restart the Authentication Service with All Dependencies
To restart the dummyentication service along with all dependencies, use:
```sh
docker compose -f 'docker/dummy/docker-compose.yaml' down -v && \
docker compose -f 'docker/dummy/docker-compose.yaml' up -d --build
```

### Restart Only the Dependencies
To restart only the dependencies, run:
```sh
docker compose -f 'docker/dummy/docker-compose.resources.yaml' down -v && \
docker compose -f 'docker/dummy/docker-compose.resources.yaml' up -d --build
```

---

## API Endpoints

### Register a New User
**Request:**
```sh
curl -X POST http://localhost:5002/dummy/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
```

**Implementation:**
```js
/**
 * @description Registers a new user
 * @route POST /dummy/register
 * 
 * ✔ Validates request payload using Zod
 * ✔ Checks Redis cache for existing user
 * ✔ Queries PostgreSQL database for user existence
 * ✔ Generates a unique user ID
 * ✔ Stores user data in Redis cache
 * ✔ Publishes user registration event to Pub/Sub
 */

const userSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
```

### User Login
**Request:**
```sh
curl -X POST http://localhost:5002/dummy/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
```

**Implementation:**
```js
/**
 * @description Authenticates a user
 * @route POST /dummy/login
 * @access Public
 * 
 * ✔ Validates input using Zod
 * ✔ Checks Redis cache for user and verifies password
 * ✔ If not found in cache, checks PostgreSQL for user and verifies password
 * ✔ Generates and returns dummyentication token upon successful login
 */

app.post('/dummy/login', async (req, res) => {
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    // Authentication logic here
});
```

---

## Environment Variables
The dummyentication service requires the following environment variables:

### PostgreSQL Configuration
```env
AUTH_POSTGRES_IMAGE="postgres:latest"
AUTH_POSTGRES_CONTAINER="dummy_postgres_container"
AUTH_DB_HOST="localhost"
AUTH_DB_PORT=5432
AUTH_DB_USER="admin"
AUTH_DB_PASSWORD="password"
AUTH_DB_NAME="mydatabase"
```

### Redis Configuration
```env
AUTH_REDIS_IMAGE="redis:latest"
AUTH_REDIS_CONTAINER="dummy_redis_container"
AUTH_REDIS_HOST="localhost"
AUTH_REDIS_PORT=6379
AUTH_REDIS_PASSWORD="password"
```

### Authentication Service Configuration
```env
AUTH_IMAGE="dummy-service:latest"
AUTH_JWT_SECRET="helloworld"
AUTH_PORT=5001
```