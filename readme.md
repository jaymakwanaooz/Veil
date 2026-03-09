# 🕶️ Veil — Secure Anonymous Chat

> **Anonymous. Encrypted. Yours.**

A highly secure, end-to-end encrypted anonymous chat application built with React Native (Expo) and Node.js.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **E2E Encryption** | All messages are encrypted client-side using NaCl Box (tweetnacl). The server only routes ciphertext. |
| 🕶️ **Anonymous Matching** | Omegle-style "Find a Match" pairs random users. Identities stay hidden until both users add each other. |
| 👤 **Username-only Auth** | No email, no phone number. Just a username and password. |
| 🔄 **Multi-Account** | Switch between multiple accounts instantly. All JWTs stored securely on device. |
| 💬 **Real-time Chat** | Socket.IO powered messaging with typing indicators and online status. |
| 🤝 **Add Friend** | Both users must tap "Add Friend" to reveal identities and save the conversation to Inbox. |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo), React Navigation |
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.IO |
| **Database** | MongoDB (Mongoose) |
| **Cache/Queue** | Redis (ioredis) |
| **Encryption** | tweetnacl (NaCl Box) |
| **Auth** | JWT + bcrypt |
| **Storage** | expo-secure-store |

---

## 📁 Project Structure

```
Veil/
├── server/                     # Node.js Backend
│   ├── src/
│   │   ├── config/             # Database, Redis, env config
│   │   ├── models/             # User, Conversation, Message schemas
│   │   ├── routes/             # Auth & conversation REST routes
│   │   ├── middleware/         # JWT authentication
│   │   ├── socket/             # Socket.IO event handlers
│   │   └── workers/            # Redis matchmaking worker
│   ├── .env.example
│   └── package.json
│
├── app/                        # React Native (Expo) Frontend
│   ├── src/
│   │   ├── api/                # Axios API client
│   │   ├── components/         # Avatar, Button, Input, ChatBubble
│   │   ├── context/            # AuthContext, ChatContext
│   │   ├── crypto/             # E2EE encryption module
│   │   ├── navigation/         # Tab & Stack navigators
│   │   ├── screens/            # Auth, Inbox, Discover, Chat
│   │   ├── services/           # Socket.IO, Secure Storage
│   │   └── theme/              # Colors, Typography, Spacing
│   ├── App.js
│   └── package.json
│
└── readme.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** running locally or on Atlas
- **Redis** running locally or on a cloud provider
- **Expo CLI** (`npm install -g expo-cli`)

### 1. Start the Backend

```bash
cd server
cp .env.example .env        # Edit with your config
npm install
npm run dev
```

### 2. Start the Mobile App

```bash
cd app
npm install
npx expo start
```

> **Important:** Update the API URL in `app/src/api/client.js` and `app/src/services/socket.js` to your machine's local IP address when testing on a physical device.

---

## 🔐 Security Architecture

### End-to-End Encryption (E2EE)

```
┌──────────┐                    ┌──────────┐
│  User A  │                    │  User B  │
│          │                    │          │
│ Generate │                    │ Generate │
│ KeyPair  │                    │ KeyPair  │
│          │                    │          │
│ Encrypt  │──── ciphertext ───>│ Decrypt  │
│ with B's │    (via server)    │ with A's │
│ pubKey + │                    │ pubKey + │
│ A's      │                    │ B's     │
│ secKey   │                    │ secKey   │
└──────────┘                    └──────────┘
```

- Keys are generated on the client using `tweetnacl.box.keyPair()`
- The **private key never leaves the device** — stored in `expo-secure-store`
- The server only stores **public keys** and routes **encrypted ciphertext**
- Each message includes a unique nonce for cryptographic freshness

### Authentication

- Passwords are hashed with `bcrypt` (12 salt rounds)
- JWTs are issued on login/register with configurable expiry
- Socket.IO connections are authenticated via JWT in handshake

---

## 🎯 Matchmaking Flow

1. User taps **"Find a Match"** → `find_match` socket event
2. User ID is added to a Redis FIFO queue
3. Background worker polls the queue every 1 second
4. When 2 users are in queue, the worker:
   - Creates a `Conversation` document (type: 'anonymous')
   - Generates a unique Socket.IO room
   - Emits `match_found` to both users with partner's public key
5. Both users join the room and can exchange E2EE messages
6. If both tap **"Add Friend"**, the conversation upgrades to `friend` type

---

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Auth** | Login / Register with username + password |
| **Inbox** | Signal-like list of saved (friend) conversations |
| **Discover** | "Find a Match" button with animated search rings |
| **Chat** | Real-time E2EE messaging with typing indicators |
| **Account Switcher** | Manage and switch between multiple accounts |

---

## 📄 License

MIT
