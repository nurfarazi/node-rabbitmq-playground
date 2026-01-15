# RabbitMQ + MongoDB Document Management System

A high-performance, asynchronous Node.js API for managing documents using RabbitMQ for task processing and MongoDB for persistent storage.

## 🚀 Architecture

This application follows a producer-consumer pattern to ensure high availability and responsiveness:

1.  **API Server (Producer)**: Accepts HTTP requests (`POST`, `PUT`). Instead of writing directly to the database, it publishes a task message to a RabbitMQ queue and returns a `202 Accepted` status immediately.
2.  **RabbitMQ (Message Broker)**: Acts as the buffer between the API and the database, ensuring no tasks are lost even if the consumer is temporarily down.
3.  **Consumer (Worker)**: A background process that listens to the RabbitMQ queue, processes tasks sequentially (or in parallel), and performs the actual `Insert` or `Update` operations on MongoDB.
4.  **Database (Storage)**: MongoDB stores the final document data and provides indexing for fast `Query` operations.

---

## 🛠️ Prerequisites

-   **Node.js**: v16+ (TypeScript supported)
-   **Docker**: Required to run RabbitMQ and MongoDB locally.

### Start Infrastructure
Run the following commands to get your environment ready:

```bash
# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo
```

---

## 📦 Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configuration**:
    The app uses a `.env` file (created automatically):
    ```env
    MONGODB_URI=mongodb://localhost:27017/rabbitmq_playground
    RABBITMQ_URL=amqp://localhost
    PORT=3000
    ```

---

## 🏃 Running the Application

You need to run **two separate processes**:

### 1. Start the API Server
```bash
npm run dev
```
*Server runs at http://localhost:3000*

### 2. Start the Background Consumer
```bash
npm run consumer
```
*Processes tasks from RabbitMQ queue.*

---

## 📡 API Endpoints

### Documents

| Method | Endpoint | Description | Type |
| :--- | :--- | :--- | :--- |
| `POST` | `/documents` | Create a new document | Asynchronous (RabbitMQ) |
| `PUT` | `/documents/:id` | Update an existing document | Asynchronous (RabbitMQ) |
| `GET` | `/documents` | List all documents / Search | Synchronous (MongoDB) |

### Query Filters
-   `title`: Search by title (regex).
-   `tag`: Filter by specific tag.
-   *Example*: `GET /documents?title=RabbitMQ&tag=tutorial`

---

## 🧪 Testing

The project includes a `test.http` file for use with the **REST Client** extension (VS Code).

1.  Open `test.http`.
2.  Click **"Send Request"** above each endpoint to test the full flow.
3.  Watch the **Consumer Terminal** to see the RabbitMQ messages being processed in real-time.

---

## 🛠️ Technical Details

-   **Indexing**: A Mongoose index is created on the `title` field to ensure queries are performant as the document count grows.
-   **Durability**: RabbitMQ queues are marked as `durable: true` and messages as `persistent: true` to prevent data loss on broker restart.
-   **Validation**: Mongoose schemas enforce required fields and data types.
