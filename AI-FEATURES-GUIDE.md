# AI Features User Guide

This guide walks you through every AI-powered feature in Magic Resume. Before using any AI feature, make sure you've configured an AI provider.

## Prerequisites: Configure AI

1. Go to **Dashboard** (the home screen with your resume list)
2. Click **AI Config** in the navigation
3. Select a provider (OpenAI, Anthropic, Gemini, DeepSeek, or Doubao)
4. Enter your **API key** and optional **model ID**
5. Click **Save**

You only need one provider configured. All AI features share the same configuration.

---

## 1. AI Resume Review

Get a comprehensive analysis of your entire resume with a numerical score and actionable fixes.

### How to use

1. Open any resume in the **workbench** (click a resume card from the dashboard)
2. Look at the **floating dock** on the right side of the screen: it's the vertical bar with icons
3. Click the **clipboard with checkmark** icon (second icon from the top, below the template switcher)

   <img width="20" height="20" src="https://img.icons8.com/fluency-systems-regular/48/clipboard-check.png" />

4. A **Review Drawer** slides in from the left side
5. Wait for the analysis to complete. You'll see:
   - A **circular score ring** at the top (0-100)
   - Score labels: Excellent (80+), Good (60-79), Needs Work (40-59), Poor (0-39)

### Understanding findings

Each finding shows:
- **Severity**: critical (red), warning (yellow), or info (blue)
- **Category**: Content, ATS, Keywords, Formatting, or Completeness
- **Section**: which resume section the finding relates to
- **Message**: description of the issue
- **Original text** (strikethrough red): what's currently in your resume
- **Suggested fix** (green): the recommended replacement

### Applying fixes

**Single fix:**
- Click **Apply** on a finding card
- A confirmation dialog shows the original vs. suggested text
- Click **Confirm** to apply the change to your resume

**Batch apply (checklist mode):**
- Click the **checklist icon** (top of the drawer, next to the cards icon)
- Check the boxes next to findings you want to apply
- Click **Apply Selected** at the bottom

### Filtering

Use the **category tabs** below the score ring to filter findings:
- **All** | **Content** | **ATS** | **Keywords** | **Formatting** | **Completeness**

### Ignoring findings

Click **Ignore** on any finding card to dismiss it without applying.

---

## 2. AI Chat Assistant

A persistent chat panel where you converse with an AI that has full context of your resume.

### How to open

1. In the workbench, click the **message bubble** icon in the floating dock (right side, below the AI Review icon)
2. The **Chat Panel** slides in from the right side

### Starting a conversation

1. Type your message in the text box at the bottom and press **Enter** (or click the send button)
2. The AI responds with streaming text. You'll see it type in real-time
3. Your chat history is **saved automatically** and persists across page reloads

### Quick Actions

Above the input box, you'll see **quick-action buttons** for common prompts:

| Button | What it does |
|--------|-------------|
| **Review Resume** | Asks the AI to review your entire resume and give detailed feedback |
| **Improve Experience** | Focuses on making your work experience bullet points more impactful with quantifiable achievements |
| **Suggest Keywords** | Asks for ATS-friendly keywords and skills relevant to your target role |
| **Rewrite Summary** | Helps rewrite your self-evaluation/summary section to be more compelling |

Click any quick-action button to instantly send that prompt to the AI.

### Managing sessions

- **New Session**: click the **+** button in the chat header to start a fresh conversation
- **View Sessions**: click the **message list** button in the header to see all your past sessions
- **Switch Sessions**: click any session in the list to resume it
- **Delete Session**: hover over a session and click the **trash** icon
- Sessions are organized **per resume**: each resume has its own chat history

### Example prompts to try

```
"What are the weakest parts of my resume?"
"Rewrite my experience at Acme Corp to highlight leadership"
"What keywords am I missing for a senior software engineer role?"
"Should I include a summary section? What should it say?"
"How can I make my resume more ATS-friendly?"
"Compare my skills section to what's typically expected for a PM role"
```

### Stopping a response

If the AI is taking too long or you want to change your prompt:
- Click the **stop button** (square icon) that appears in place of the send button during streaming

---

## 3. Section-Level AI Actions

Get AI help for a specific section of your resume without running a full review.

### How to use

1. In the workbench, select a section from the **left sidebar** (e.g., Experience, Skills, Education)
2. Look at the **section editor header** at the top of the middle panel, next to the section title, you'll see a **sparkles** icon ✨
3. Click the **sparkles icon** to open the actions popover
4. Choose one of the four actions:

| Action | What it does |
|--------|-------------|
| **Review** | Analyzes just this section for issues and suggestions. Results appear in the Review Drawer. |
| **Improve** | AI rewrites the section content for maximum impact and professionalism |
| **Rephrase** | Provides alternative phrasings for the section content |
| **Add Keywords** | Suggests industry-specific keywords relevant to this section |

### Tips

- Make sure the section has content before running AI actions. Empty sections will show an error
- **Review** findings appear in the same Review Drawer used by the full resume review
- **Add Keywords** shows suggestions as a toast notification. Copy the ones you want and add them to your section manually

---

## 4. AI Style Suggestions

Let AI analyze your resume content and recommend the best visual style: colors, fonts, spacing, and template.

### How to use

1. In the workbench, look at the **left sidebar** (Side Panel) with all the settings
2. Scroll to the bottom; you'll see a card titled **"AI Style Suggestion"** with a sparkles icon
3. (Optional) Enter a **target role** in the text input (e.g., "Software Engineer", "Marketing Manager", "Data Scientist")
4. Click **Generate**

### What you get

The AI analyzes your resume and returns:
- **Rationale**: a brief explanation of why the suggested style works for your resume and target industry
- **Apply Style** button: applies the suggested colors, fonts, and spacing in one click
- **Try Template** button: switches to the recommended template (if a different one is suggested)
- **Regenerate** button: get a new set of suggestions

### Tips

- The target role helps the AI tailor suggestions. "Financial Analyst" will get a more conservative style than "UX Designer"
- You can always undo style changes manually using the Theme, Typography, and Spacing cards above
- Try regenerating a few times to see different suggestions

---

## Tips for Best Results

### API Keys
- **OpenAI**: Works with any OpenAI-compatible endpoint (e.g., Azure OpenAI, local LLMs with OpenAI API)
- **Anthropic**: Best for nuanced writing feedback and detailed suggestions
- **Gemini**: Has a generous free tier and supports PDF import
- **DeepSeek**: Cost-effective for heavy usage

### General
- Fill out as much of your resume as possible before running AI features. More content means better analysis
- Use the **Chat Assistant** for open-ended exploration before committing to specific changes
- Run a **full Review** after making several changes to catch any new issues
- Use **Section-Level Actions** to iteratively improve one section at a time rather than all at once
- Check **AI Style Suggestions** after you've finalized your content. The style should complement your content, not the other way around

### Workflow Example

1. Import or create your resume
2. Run **AI Review** to get a baseline score
3. Use **Section-Level Actions** to improve weak sections one by one
4. Chat with the **AI Assistant** about career positioning and strategy
5. Run **AI Review** again to see your score improve
6. Use **AI Style Suggestions** to pick the right visual style
7. Export to PDF
