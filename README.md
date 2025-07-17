# Week Calendar App

A simple, client-side weekly calendar app built with HTML, CSS, and JavaScript. Users can add, view, edit, and delete entries, and track direct and indirect hours for the week. All data is stored locally in the browser via `localStorage`.

## Features

* **Weekly view** showing days of the week and time slots from 6:00 AM to 11:00 PM.
* **Add entries** with time, date, type (`Direct`, `Indirect`, or `N/A`), activity label, duration, and notes.
* **View entries** in a read-only modal with full details.
* **Edit entries** via a dedicated modal, with the ability to update all fields or delete the entry.
* **Automatic resizing** of entries to span the correct number of time slots based on hours.
* **Totals display** of direct and indirect hours for the current week.
* **Persistent storage**: entries are saved in `localStorage` so they persist across page reloads.
* **Week navigation**: move forward or backward by one week.

## File Structure

```
├── index.html      # Main HTML file
├── style.css       # Stylesheet for layout and theming
├── script.js       # JavaScript logic for calendar, modals, and storage
└── README.md       # This file
```

## Getting Started

### Prerequisites

* Modern web browser (Chrome, Firefox, Edge, Safari)
* (Optional) A static file server for local testing, e.g., Python's `http.server` or Node's `serve`.

### Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/your-username/week-calendar-app.git
   cd week-calendar-app
   ```
2. Open `index.html` in your browser, or serve the folder:

   ```sh
   # Python 3
   python -m http.server 8000

   # Then visit http://localhost:8000
   ```

## Usage

1. **Navigate weeks** using the `Previous Week` and `Next Week` buttons.
2. Click **Add Entry** to open the form modal, fill in all required fields, and click **Confirm**.
3. Entries will appear in the calendar grid at the chosen date/time, sized to the selected duration.
4. Double-click an entry to view its details in a read-only modal.
5. From the view modal, click **Edit Entry** to modify or delete the entry.
6. Totals of direct and indirect hours are updated automatically at the top.

## Clearing Data

To reset the calendar and remove all saved entries:

1. Open the browser's DevTools (`F12` or `Ctrl+Shift+I`).
2. In the **Application** (Chrome) or **Storage** (Firefox) tab, find **Local Storage** → this site.
3. Click **Clear** to remove all calendar entries.

## Deployment

This app can be hosted on any static site hosting service:

* **GitHub Pages**: push to a repository’s `gh-pages` branch or enable Pages in settings.
* **Netlify**, **Vercel**, **Firebase Hosting**, etc.

> **Note:** All calendar data is stored per-user in their browser’s localStorage and is not shared between users.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with improvements.

## License

All Right Reserved. See [LICENSE](LICENSE) for details.
