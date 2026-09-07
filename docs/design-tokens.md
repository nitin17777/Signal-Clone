# Design Tokens — Signal Visual Language

## Colors
--accent-blue: #2C6BED
--bg-dark: #1B1C1F
--bg-panel: #26282C
--bubble-sent: #2C6BED
--bubble-received: #2C2C2E
--text-primary: #E4E4E6
--text-secondary: #8B8E96
--online-green: #4CD964
--unread-badge: #2C6BED

## Shape & Spacing
--radius-bubble: 18px
--radius-panel: 8px
--spacing-message-gap: 4px
--spacing-panel-padding: 16px

## Typography
Font family: system-ui, -apple-system, "Inter", sans-serif
Message text: 15px / 1.4 line-height
Timestamps: 11px, --text-secondary
Conversation name: 16px, 600 weight

## Layout
Two-pane desktop: conversation list (fixed ~360px) + chat pane (flex-1)
Single-pane mobile: list OR chat pane, never both