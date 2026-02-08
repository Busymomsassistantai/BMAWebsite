# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Busy Moms Assistant is a static informational landing page about an AI assistant designed to support busy moms. The project uses vanilla HTML, CSS, and JavaScript with no build system or dependencies.

## Development Commands

**Running the site:**
```bash
open index.html
```
Or use any local web server (e.g., Python's http.server, VS Code Live Server extension).

## Architecture

This is a simple three-file static website:

- **index.html** - Main landing page with sections: header, about, benefits, and contact form
- **style.css** - Currently empty; styling should be added here
- **script.js** - Currently empty; any interactive functionality should be added here

The HTML is structured as a single-page layout with multiple `<section>` elements. The contact form currently has no form handling logic - any submission behavior needs to be implemented in script.js.

## Key Considerations

- No external dependencies or frameworks
- No build/compile step required
- Form submission will need JavaScript implementation if backend integration is desired
- CSS styling is currently missing and should be added to style.css
