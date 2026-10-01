# PortfoliOS

The portfolio you're looking at right now. Instead of a scrolling page, it's a working Windows 98 desktop: every section is a program that opens in its own window, which you can drag, resize from any edge or corner, minimize to the taskbar, and maximize. It started from my own concept and design direction — a portfolio that's fun to poke around in, where the presentation itself shows how I build.

## Architecture

The desktop is built around a single registry of programs that drives the desktop icons, the Start menu, and the window layer at once, so adding a program is a one-entry change.

- All window state lives in one reducer behind split contexts.
- Gestures write straight to the DOM and only commit on release, so dragging never re-renders at pointer speed.
- Every word of portfolio copy lives in JSON, separate from the components that render it — this very README is generated from a project entry.

## The Programs

Each section is themed as a period program:

- An **Explorer** folder per project, with **Notepad**, an image viewer, and a media player for its files
- A **MySpace**-style About page
- A **Device Manager** skills inventory
- An **Outlook Express** contact form that really sends mail
- A **setup wizard** that installs my résumé into your Downloads
- A full **Klondike Solitaire**, with the bouncing-cards win cascade

## Process

Built with Claude Code using a structured skills workflow: brainstorm, a written design spec, an implementation plan, then test-driven development. Every design and change was reviewed for architecture, performance, and accessibility before merging, and the core logic — window state, the file system, and the Solitaire rules engine — is covered by unit tests.

## Built With

React 19 · Vite · JavaScript · Vitest · CSS · Claude Code
