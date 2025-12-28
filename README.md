# 📨 AI Holiday Postcard Builder

A full-stack-capable web application that leverages Generative AI to create personalized holiday postcards. Built with **React**, **TypeScript**, and **Google Gemini**, focusing on clean architecture and type safety.


## 🚀 Features

- **Generative AI Integration**: Utilizes Google's Gemini Pro model to generate context-aware messages based on recipient, tone, and occasion.
- **Real-time Rendering**: Dynamically renders a visual "postcard" component with custom CSS and festive animations (Snow Effect).
- **Type-Safe Architecture**: Fully typed codebase using TypeScript interfaces for API responses and component props.
- **Modular Design**: Separation of concerns between UI components (`/components`) and API logic (`/services`).

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Styling:** CSS Modules / Custom CSS
- **AI/LLM:** Google Gemini API (`@google/generative-ai`)

## 📂 Project Structure

```bash
/src
├── components/          # Reusable UI components
│   ├── HolidayForm.tsx  # User input handling
│   ├── PostcardPreview.tsx # Visual rendering logic
│   └── SnowOverlay.tsx  # Canvas-based animation
├── services/            # API integration layer
│   └── geminiService.ts # Isolated Gemini API calls
├── App.tsx              # Main application layout
└── main.tsx            # Entry point
