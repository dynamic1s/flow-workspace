## 🌊 Flow

Flow is an all-in-one productivity ecosystem designed to help you stay focused, plan your growth, and manage your knowledge in one seamless interface.

### 🌟 Key Features

**⏱️ Focus & Planning**

- Focus Timer: Customizable Pomodoro-style timer to maintain deep work sessions.
- Task Setting: Integrated task manager to define and track daily objectives.
- Consistency Calendar: A visual heat-map/calendar to track your streaks and daily progress.

**📝 Reflection & Documentation**

- Journal Entries: A private space for daily reflections and notes.
- Task Annotations: Add specific context or sub-steps reflections to your completed tasks.

**📚 Knowledge Management**
Resource Manager: A centralized library for learning materials, documentation, and bookmarks, categorized by skill or goal.

**🛠️ Technical Architecture**
- Frontend: React (Vite) + Tailwind CSS
* Backend: Supabase (Database & Authentication)
* State Management: React Context API / Hooks

**🚀 Getting Started**
*Prerequisites*

- Node.js (v18+)
- A Supabase Project

**Installation**

Clone the Repository
```
  git clone https://github.com/your-username/flow.git
  cd flow
```
Install Dependencies
```
npm install
```
Environment Setup Create a .env.local file in the root:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
Run Locally
```
npm run dev```