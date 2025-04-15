# Web-Based API Test Project

This project aims to provide an interface similar to Postman or SwaggerUI for testing APIs within a web environment. Below is an overview of the structure, technologies, and purpose.

## Overview
- **Goal**: Offer a browser-based solution for creating, sending, and managing API requests.
- **Frontend**: Built on [Next.js](https://nextjs.org) with [Tailwind CSS](https://tailwindcss.com) for styling. Components are organized using [Shadcn UI](https://ui.shadcn.com/).
- **Backend**: Implemented using [Convex](https://docs.convex.dev) for server logic and database functionality.
- **Database**: Schema management through Convex’s built-in schema mechanism (`defineTable`, etc.).

## Project Structure
- **Next.js Pages**: Rely on a file-based routing system and server/client integration.
- **Shadcn UI**: Provides a consistent set of design elements, customized via Tailwind CSS.
- **Convex Functions**: Power data interactions and API calls. The schema (in [`convex/schema.js`](../convex/schema.js)) defines database tables and types.

## Technologies
1. **Next.js**  
   - File-based routing for pages (`app/layout.js`, `app/page.js`, etc.).  
   - Server-side rendering and static generation when needed.
2. **Tailwind CSS**  
   - Utility-first CSS framework that accelerates styling.
   - Configurable theme and design tokens.
3. **Shadcn UI**  
   - Pre-styled components built on Tailwind, easily themed and extended.
4. **Convex**  
   - Handles queries and mutations for real-time data updates.
   - Schema-based data modeling within [`schema.js`](../convex/schema.js).

## Purpose
This application provides a user-friendly interface to:
- Enter API endpoints, HTTP methods, and optional authentication details.
- Send requests and inspect results in real time.
- Serve as a lightweight, web-based alternative to tools like Postman or SwaggerUI.

## Future Development
- Add features like request history, environment management, and JSON response formatting.
- Enhance user interface with additional Shadcn UI components.
- Expand database schema to store and categorize API requests.
