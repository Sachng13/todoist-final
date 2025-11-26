# Todoist Final — Enhanced (Frontend Only)

A fully functional, frontend-only productivity app inspired by Todoist.  
Built using **React + TypeScript**, powered by **Zustand** for state management and **localForage** for fully persistent local storage.

This project demonstrates:

- Modular architecture
- Clean state management
- Real-world features (templates, subtasks, reminders, voice input)
- A polished user experience
- Component-driven design
- Advanced browser APIs (SpeechRecognition + Notification API)

---

# 🚀 Features

## 🎤 Voice Task Creation (Continuous Speech Recognition)

Add tasks using your voice:

- Continuous listening until **you manually stop**
- Converts speech → text → auto-fills task input
- Works cleanly in Chrome
- Natural-language date extraction (“tomorrow” → due date)
- Error-handling for unsupported browsers

---

## 📋 Templates System (Blueprint-Based)

Create highly reusable task templates:

- Template name
- Default priority
- Default notes
- Number of subtasks
- Custom subtask names
- Edit / Delete / Apply templates
- Preview templates before applying
- Applying a template generates tasks instantly

---

## 📦 Export & Import (Full Backup)

Export all your data:

- Tasks
- Subtasks
- Projects
- Templates
- Stats (if any)
- Ordering

Import JSON to fully restore your workspace.

Perfect for assignment reviewers.

---

## ⏱ Focus Mode (Pomodoro Timer)

A powerful built-in Focus / Pomodoro system:

### Focus features:

- Session durations: **1 / 5 / 25 / 45 / 60 minutes**
- Animated circular progress
- Auto-complete task on finish
- Quick break timer (default 5 min)
- Session → break → session cycle
- Sound notifications

### ⭐ Zen Mode (Fullscreen Focus)

A distraction-free focus environment:

- Fullscreen dark UI
- Large animated timer
- ESC to exit
- Clean & minimal

Perfect for deep work sessions.

---

## 🧩 Drag & Drop Tasks

Reorder tasks inside a project using **@dnd-kit**:

- Smooth animations
- Touch + pointer support
- Safe reordering with persistence
- Works with subtasks and priority indicators

---

## ✔ Subtasks (Nested)

Each task supports:

- Subtask creation
- Completion toggles
- Editable from task modal
- Included inside templates
- Persisted with parent task

---

## 🔔 Reminders (Notification API)

Tasks can trigger reminders:

- Quick shortcuts (5 minutes, 1 hour)
- Browser notifications (if permission granted)
- Persisted timers survive page reload

> Note: Browser must be open for notifications to fire.

---

## 🗂 Projects + Filtering

- Create projects
- Assign tasks to projects
- Project sidebar navigation
- Per-project ordering
- Quick search filter

---

## 💾 Local Persistence

Everything is stored in the browser using **localForage**:

- No backend required
- Data survives reloads
- Instant performance

---

# 📦 Tech Stack

### Frontend

- React + TypeScript
- Zustand
- TailwindCSS
- @dnd-kit
- localForage

### Browser APIs

- SpeechRecognition
- Notification API

### Build Tool

- Vite

---

# 🧪 How to Run Locally

1. Install dependencies

npm install

2. Start the development server

npm run dev
