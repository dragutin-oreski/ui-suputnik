# UI Suputnik

Static course companion for UI course encounters.

## Content audience

All visible course-page content must be student-facing. Do not put lecturer notes, delivery instructions, private reminders, or labels such as "for the teacher", "how to explain this", "discussion prompt", or "sentence for the board" inside public pages. If a concept needs guidance, phrase it as something the student can directly read, test, or answer, such as "Provjeri razumijevanje", "Obrati pozornost", or "Pokušaj zaključiti".

Expected repository structure:

```text
index.html
susret-01/
  index.html
  styles.css
  data.js
  app.jsx
  ...
susret-02/
  index.html
  styles.css
  app.jsx
susret-07/
  index.html
  styles.css
  app.jsx
```

The personal website deploy workflow checks out this repository and publishes `susret-01/` at:

```text
https://dragutinoreski.com/courses/ui-suputnik/
https://dragutinoreski.com/courses/ui-suputnik/susret-01/
https://dragutinoreski.com/courses/ui-suputnik/susret-02/
https://dragutinoreski.com/courses/ui-suputnik/susret-07/
```

## Agent-readable mirrors

Each public HTML entry point should have a same-path Markdown mirror:

```text
index.html -> index.html.md
susret-01/index.html -> susret-01/index.html.md
susret-02/index.html -> susret-02/index.html.md
susret-07/index.html -> susret-07/index.html.md
```

When changing course content in HTML/JSX/data files, update the relevant Markdown mirror in the same change.
