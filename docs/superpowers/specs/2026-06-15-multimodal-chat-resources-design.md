# Multimodal Chat Resources Design Spec

## Goal Description
Enhance the chatbot assistant response capability by introducing multiple interactive resource cards embedded directly inside chat messages. Currently, only simple text is rendered. We will add rich, cyberpunk-styled cards for Quiz, Video Recommendation, Mermaid Mindmaps, Runnable Code blocks, Audio Slides, and Textbook PDFs to build a highly engaging multimodal learning environment.

## Proposed Changes

### Frontend Directory Structure
Create a new directory `frontend/src/components/chat` to isolate all chat-related sub-components.

- **[NEW] [QuizCard.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/QuizCard.jsx)**: Handles quiz questions rendering, interactive answer checking, explanation display, and neon-highlighted correct/incorrect states.
- **[NEW] [VideoRecommendCard.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/VideoRecommendCard.jsx)**: Renders a Bilibili recommendation card with a play count badge, customized reasoning, and an inline iframe player that triggers upon play click.
- **[NEW] [MermaidRenderer.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/MermaidRenderer.jsx)**: Utilizes the existing `mermaid` library to compile and render interactive graph nodes, and supports a high-resolution pan-and-zoom modal.
- **[NEW] [CodeSandboxCard.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/CodeSandboxCard.jsx)**: Simulates an IDE editor code container, supporting code copying, a togglable mini terminal to print local run results, and a click handler to import code into the main Sandbox workspace.
- **[NEW] [SlidesCarouselCard.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/SlidesCarouselCard.jsx)**: Formats presentation slide arrays with pagination indicators, slide animation transitions, and speech narration playback.
- **[NEW] [PDFDownloadCard.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/chat/PDFDownloadCard.jsx)**: Renders a PDF attachment placeholder. Clicking open modal triggers standard adaptive textbook viewport rendering.

### Chat View Integration

- **[MODIFY] [ChatView.jsx](file:///e:/AIproject/EduGenesis/frontend/src/components/dashboard/ChatView.jsx)**:
  - Import the new card components from `../chat/`.
  - Update `InteractiveChatBubble` to split message content by resource tags using a comprehensive regex pattern:
    `(\[QUIZ:\s*\{.*?\}\s*\]|\[VIDEO_RECOMMEND:\s*\{.*?\}\s*\]|\[MINDMAP:\s*[\s\S]*?\s*\]|\[CODE:\s*\w+\s*\|[\s\S]*?\s*\]|\[SLIDES:[\s\S]*?\]|\[PDF:\s*.*?\]|\[DIAGRAM:\s*[^\]|]+\s*\|\s*[^\]]+\]|\[VIDEO:\s*[^\]|]+\s*\|\s*[^\]]+\])`
  - Map complete closed tags to their corresponding React components inline, ignoring incomplete streaming tags.

## Verification Plan

### Automated Verification
Run compile check via Vite build:
```bash
npm run build
```

### Manual Verification
1. Launch app locally and navigate to the Chat interface.
2. Simulate or input message packets containing:
   - `[QUIZ: ...]`
   - `[VIDEO_RECOMMEND: ...]`
   - `[MINDMAP: ...]`
   - `[CODE: ...]`
   - `[SLIDES: ...]`
   - `[PDF: ...]`
3. Ensure cards render properly inline at the tag's exact placement.
4. Interact with each component:
   - Answer quiz questions, verify color coding, and confirm explanation dropdown.
   - Click recommended video, verify iframe expansion and playback.
   - Zoom/pan Mermaid mindmap within fullscreen modal.
   - Click "Run" on code block, inspect mini terminal log stream.
   - Play Slides audio, confirm slide transition synchronizes with narration.
   - View textbook modal from PDF card.
