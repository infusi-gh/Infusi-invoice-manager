# Infusi Technologies Invoice Management System

A modern, responsive invoice management application for Infusi Technologies Limited. Create, track, and manage invoices with payment tracking, receipt generation, and comprehensive activity logging.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.0-blue)

## Features

### Core Functionality
- **Invoice Creation** - Create detailed invoices with multiple line items
- **Payment Tracking** - Record partial and full payments with payment methods
- **Receipt Generation** - Automatically generate receipts for recorded payments
- **Status Management** - Track invoice status (Draft, Sent, Partially Paid, Paid, Overdue)
- **Activity Timeline** - Complete audit trail of all invoice actions
- **PDF Export** - Download invoices and receipts as HTML files

### Additional Features
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Logo Upload** - Add your company logo to invoices
- **Invoice Numbering** - Automatic sequential invoice numbering (INF-YYYY-###)
- **Due Date Tracking** - Set and monitor payment due dates
- **Client Management** - Store client information with each invoice
- **Payment Methods** - Support for Bank Transfer, Cash, Cheque, Mobile Money, and Other

## Tech Stack

- **Frontend Framework:** React 18.2
- **Language:** TypeScript 5.2
- **Styling:** Tailwind CSS 3.4
- **Build Tool:** Vite 5.0
- **Icons:** Lucide React
- **State Management:** React Hooks (useState)

## Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/infusi-invoice.git
   cd infusi-invoice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   Navigate to http://localhost:5173
   ```

## Project Structure

```
infusi-invoice/
├── public/
├── src/
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # React entry point
│   └── index.css            # Global styles with Tailwind
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md                # This file
```

## Usage

### Creating an Invoice

1. Click **"New Invoice"** button
2. Fill in client information
3. Add line items (expenses)
4. Set invoice and due dates
5. Add optional notes
6. Click **"Create Invoice"**

### Recording a Payment

1. Click on an invoice from the list
2. Click **"Record Payment"** button
3. Enter payment details:
   - Payment date
   - Amount paid
   - Payment method
   - Optional notes
4. Click **"Record Payment"**
5. Receipt is automatically generated and downloaded

### Managing Invoices

- **View Invoice** - Click on any invoice in the list
- **Edit Invoice** - Click the three-dot menu → Edit
- **Mark as Sent** - Click the three-dot menu → Mark as Sent
- **Download Invoice** - Click "Download Invoice" button
- **Delete Invoice** - Click the three-dot menu → Delete

## Available Scripts

### Development
```bash
npm run dev          # Start development server
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment

### Deploy to Vercel

#### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Click **"Deploy"**

Vercel will automatically:
- Detect it's a Vite project
- Install dependencies
- Build and deploy
- Provide a live URL

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Other Platforms

- **Netlify:** Connect GitHub repo or drag-and-drop `dist` folder
- **GitHub Pages:** Use `gh-pages` branch after building
- **Railway:** Connect repository and deploy
- **Render:** Connect GitHub and auto-deploy

## Environment Variables

Currently, the app doesn't require environment variables. For future backend integration, create a `.env` file:

```env
VITE_API_URL=your_api_url
VITE_FIREBASE_KEY=your_firebase_key
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Known Limitations

### Current Version
- **Data Storage:** Invoices are stored in browser memory only. Data is lost on page refresh.
- **Multi-user:** No authentication or user management
- **Email:** No automatic email sending
- **PDF Export:** Exports as HTML, not native PDF

### Planned Features
- Backend database integration (Firebase/Supabase)
- User authentication
- Email invoice sending
- Native PDF export
- Client management system
- Dashboard with analytics
- Search and filter functionality
- Invoice templates
- Multi-currency support

## Roadmap

### Version 2.0 (Q2 2025)
- [ ] Firebase backend integration
- [ ] Persistent data storage
- [ ] User authentication
- [ ] Email functionality

### Version 3.0 (Q3 2025)
- [ ] Dashboard with analytics
- [ ] Client management
- [ ] Invoice templates
- [ ] Search and filtering

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind CSS Not Working

```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### TypeScript Errors

```bash
# Install type definitions
npm install -D @types/react @types/react-dom
```

### Port Already in Use

```bash
# Use different port
npm run dev -- --port 3000
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact:
- **Email:** support@infusitech.com
- **Website:** [www.infusitech.com](https://www.infusitech.com)

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Bundled with [Vite](https://vitejs.dev/)

---

**© 2025 Infusi Technologies Limited. All rights reserved.**

Made with ❤️ in Ghana