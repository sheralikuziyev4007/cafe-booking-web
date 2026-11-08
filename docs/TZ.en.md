# Technical Specification
## Project: Landing page + mini admin panel for the "Coffee&Co" café

> English translation of the original client brief ([TZ.md](./TZ.md), in Russian). The delivered project goes beyond
> this brief; see the README for the full feature list.

---

## 1. Project overview

Build a one-page landing site for a café, with menu management through a separate admin panel. The café owner must be
able to add, edit and delete menu items without contacting a developer.

**Target audience:** café visitors looking for information about the venue and its menu.

---

## 2. Technical stack

- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **Data storage:** localStorage (for the MVP; in a real project, a backend and a database)
- **Routing:** React Router
- **Deployment:** Vercel or Netlify

---

## 3. Functional requirements

### 3.1 Public part (landing page)

**The page must contain these sections:**

1. **Header**: logo, navigation (Home, Menu, About, Contact), a "Book a table" button
2. **Hero section**: heading, subheading, background image, call-to-action button
3. **About us**: a short text about the café and 2–3 interior photos
4. **Menu**: cards for dishes and drinks grouped by category (Coffee, Desserts, Breakfast, etc.), each with a photo, name, description and price
5. **Reviews**: a slider or grid of customer reviews (name, text, star rating)
6. **Contact**: address, phone, opening hours, an embedded map (a static map image is acceptable) and a feedback form
7. **Footer**: social links, copyright, repeated navigation

**Required functions:**

- The menu must **load from localStorage** (the same data the admin panel edits)
- Filtering dishes by category (tab buttons above the menu list)
- A feedback form with validation (name, phone or email, message; all fields required, email must match the email format)
- Responsive layout: correct display on mobile (375px), tablet (768px) and desktop (1280px+)
- Smooth scrolling to a section when a Header navigation item is clicked

### 3.2 Admin panel (protected section `/admin`)

**Functions:**

1. **Simple authentication**: a login/password form (a single hardcoded account is acceptable for the MVP, for example login `admin`, password `admin123`); after sign-in the user is redirected to the panel, and `/admin` is closed to anyone who is not signed in
2. **Menu item list**: a table of all dishes with photo (thumbnail), name, category, price, and "Edit" and "Delete" buttons
3. **Add a new item**: a form with name, category (select from a list), price, description and image link; all fields validated
4. **Edit an item**: the same form, pre-filled with the current data
5. **Delete an item**: with a confirmation ("Are you sure?")
6. **Sign out** (logout)

**Important:** changes made in the admin panel must appear immediately on the public landing page (through the shared localStorage).

---

## 4. Data model

```typescript
interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'desserts' | 'breakfast' | 'main';
  price: number;
  description: string;
  imageUrl: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number; // 1-5
  text: string;
}

interface ContactFormData {
  name: string;
  contact: string; // email or phone
  message: string;
}
```

---

## 5. Non-functional requirements

- The code must be split into reusable components (not one large file)
- Use TypeScript types for all props and data (no `any`)
- Menu state is managed through the Context API or a simple state manager (Zustand is fine)
- The project must be on GitHub with a clear README (description, screenshots, technologies, demo link)
- Deployment to Vercel or Netlify with a working link is required

---

## 6. Acceptance criteria

- [ ] The landing page is responsive and looks tidy at all resolutions
- [ ] The menu on the landing page is in sync with the admin panel
- [ ] The feedback form validates correctly
- [ ] The admin panel is protected from unauthorized access
- [ ] CRUD operations (add / edit / delete) work without errors
- [ ] The code is structured into components and uses TypeScript
- [ ] The project is deployed and available at a link

---

## 7. Recommended timeline

**7–10 days** at 2–3 hours per day (a realistic pace for a junior developer learning the technologies along the way).

---

## 8. Optional extras (to make the project more challenging)

- Dark / light theme
- Scroll animations (for example, the Framer Motion library)
- Multi-language support (RU / UZ / EN)
- Moving from localStorage to a real backend (for example, Firebase or a simple Express + MongoDB)
