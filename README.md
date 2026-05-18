# TaskAI – AI Powered Task Management Application

TaskAI is a full-stack AI-powered task management application built using the **MERN stack**, **Google Gemini SDK**, and **Gemini Tool Calling**. Users can manage tasks simply by chatting with an AI assistant using natural language prompts, or perform complete CRUD operations through the task management dashboard.

---

## 🚀 Live Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |

---

## ✨ Main Feature – AI Assistant

TaskAI includes an intelligent AI assistant powered by **Google Gemini AI**. Just type natural language prompts like:

```
Create a task for gym tomorrow
Show my pending tasks
Update my project task status to completed
Delete my shopping task
```

The AI automatically understands your intent and performs the required task operations.

---

## 🤖 Gemini SDK Integration

This project uses the **Google Gemini SDK** (`@google/generative-ai`) and the `gemini-2.5-flash` model.

The SDK is responsible for:

- Connecting to Gemini AI
- Sending prompts and receiving AI responses
- Managing AI chat sessions
- Supporting Tool Calling

---

## 🔧 Gemini Tool Calling

The backend provides predefined tools to Gemini AI:

| Tool | Description |
|---|---|
| `createTask` | Creates a new task |
| `getTasks` | Fetches tasks |
| `updateTask` | Updates an existing task |
| `deleteTask` | Deletes a task |
| `completeTask` | Marks a task as complete |

> Gemini does **not** directly access the database. It only decides which tool to invoke, and the backend executes the actual MongoDB operation.

**Example:**

User prompt:
```
Create a task called Finish UI
```

Gemini returns:
```json
{
  "toolCall": {
    "name": "createTask",
    "args": {
      "title": "Finish UI"
    }
  }
}
```

The backend detects the tool call and executes the MongoDB operation.

---

## 🔄 AI Backend Flow

```
Frontend sends request
        ↓
Backend receives request
        ↓
Gemini SDK initialized
        ↓
Gemini model created
        ↓
Tool declarations attached
        ↓
Chat history loaded
        ↓
Message sent to Gemini
        ↓
Gemini analyzes user intent
        ↓
Gemini chooses tool
        ↓
Backend detects tool call
        ↓
executeToolCall() executes
        ↓
MongoDB operation performed
        ↓
Response returned to frontend
        ↓
Frontend fetches latest tasks
        ↓
React state updates
        ↓
UI automatically re-renders
```

---

## 💾 AI Chat History System

The AI conversation history is stored in **MongoDB**, enabling:

- Persistent conversations
- AI memory and context across sessions
- Better conversation continuity
- Personalized task interactions

---

## 📋 Manual Task Management

In addition to the AI assistant, users can manage tasks manually through the dashboard:

- Create Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- Complete Tasks
- Filter Tasks
- Search Tasks

---

## ⚡ Automatic UI Updates

Whenever the AI creates or updates a task, the UI reflects changes instantly:

```
MongoDB updates
        ↓
Frontend fetches latest tasks
        ↓
React state updates
        ↓
UI automatically re-renders
```

---

## 🔐 Authentication System

Cookie-based authentication with the following features:

- User Registration
- Login
- Protected Routes
- Session Validation
- Logout Handling

---

## 🛠️ Technologies Used

**Frontend**
- React.js
- Axios
- CSS
- React Hooks
- js-cookie

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**AI Integration**
- Google Gemini SDK
- Gemini 2.5 Flash
- Gemini Tool Calling

**Deployment**
- Vercel (Frontend)
- Render (Backend)

---

## 📁 Project Structure

```
client/
│
├── components/
├── pages/
├── App.jsx
└── styles/

server/
│
├── routes/
├── tools/
├── models/
├── middleware/
└── server.js
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

**Backend `.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend `.env`**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 5. Run the Application

Start the backend:
```bash
npm run server
```

Start the frontend:
```bash
npm start
```

---

## 💬 Example AI Prompts

```
Create a task for gym tomorrow
Show my completed tasks
Update my UI task status to completed
Delete my testing task
Show today's tasks
```

---

## 🧠 Key Concepts

- MERN Stack Architecture
- REST APIs
- Gemini SDK Integration
- Gemini Tool Calling
- CRUD Operations
- Authentication & Authorization
- Chat History Persistence
- Dynamic React Rendering
- AI Powered Automation

---

## 🔮 Future Improvements

- [ ] Voice Assistant
- [ ] Task Notifications
- [ ] AI Task Prioritization
- [ ] Calendar Integration
- [ ] Real-time Collaboration
- [ ] Drag & Drop Task Boards

---

## 👨‍💻 Author

**Baranidaran**  
Full Stack MERN Developer | AI Integrated Web Application Developer