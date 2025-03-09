# Simple Time Tracker

A time tracking application built with Vue 3 and Supabase. Track your daily tasks, organize them with tags, and analyze your time usage patterns.

## Features

- **Task Tracking**

  - Start/stop time tracking for tasks
  - Add custom tags to tasks
  - Group entries by task
  - Resume previous tasks
  - Mark tasks as favorites
  - QR code scanning support
    ```json
    {
      "taskId": "optional-uuid",
      "name": "optional-task-name",
      "altCode": "optional-alternate-code"
    }
    ```

## Tech Stack

- Frontend:

  - Vue 3 + Vite
  - Tailwind CSS

- Backend:
  - Supabase
