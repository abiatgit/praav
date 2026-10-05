# praav.uk - UK Pre-Loved Indian Ethnic Fashion Marketplace

A trusted marketplace for buying and selling pre-owned Indian ethnic clothing in the UK.

## Project Status

This is the **initial foundation** of the marketplace. The current implementation includes:

- Production-ready landing page
- Responsive design system
- Component architecture ready for expansion
- Supabase integration structure
- Authentication route placeholders

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Backend**: Supabase (ready for integration)
- **Database**: PostgreSQL via Supabase (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
\`\`\`bash
cd ~/Desktop/praav.uk
\`\`\`

2. Install dependencies (already installed):
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:3000 (or the port shown in terminal) in your browser

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
praav.uk/
├── app/
│   ├── (marketing)/          # Marketing pages (landing page)
│   ├── (auth)/                # Auth pages (login, signup - placeholders)
│   ├── marketplace/           # Future marketplace pages
│   ├── sell/                  # Future seller pages
│   ├── dashboard/             # Future dashboard pages
│   ├── layout.tsx             # Root layout with SEO
│   └── globals.css            # Global styles and design tokens
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── marketing/             # Landing page sections
│   ├── marketplace/           # Marketplace components (ProductCard)
│   └── shared/                # Shared components (Container, Section)
├── lib/
│   ├── supabase/              # Supabase client utilities
│   ├── constants/             # Constants (categories, mock data)
│   └── utils.ts               # Utility functions
└── types/                     # TypeScript type definitions
\`\`\`

## Features Implemented

### Landing Page Sections

1. **Navigation Header** - Responsive navbar with mobile menu
2. **Hero Section** - Main value proposition with CTAs
3. **Value Proposition** - Four cards explaining benefits
4. **Category Section** - 8 product categories
5. **Featured Products** - Mock product showcase
6. **How It Works** - Three-step seller onboarding
7. **Seller CTA** - Call-to-action for sellers
8. **Mission Statement** - Community and sustainability focus
9. **Newsletter Signup** - Waitlist form with validation
10. **Footer** - Comprehensive footer with links

### Design System

- Premium neutral base colors with warm terracotta accent
- Responsive design (mobile, tablet, desktop)
- Clean typography with Inter font
- Accessible color contrasts (WCAG AA)
- Consistent spacing and rounded corners

### SEO & Metadata

- Optimized page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card metadata
- Proper semantic HTML structure
- robots.txt configuration

## Environment Variables

Create a \`.env.local\` file based on \`.env.example\`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

Note: The application works without Supabase configured (fails gracefully).

## Next Development Phases

Future implementation will include:

- **Phase 2**: Full authentication with Supabase Auth
- **Phase 3**: Seller onboarding and profile management
- **Phase 4**: Listing creation and management
- **Phase 5**: Marketplace search and filtering
- **Phase 6**: Stripe Connect payment integration
- **Phase 7**: Order management and shipping
- **Phase 8**: Buyer-seller messaging
- **Phase 9**: Reviews and trust system
- **Phase 10**: AI-powered listing generation
- **Phase 11**: Admin dashboard
- **Phase 12**: Analytics with Chart.js

## Code Quality

- Strong TypeScript typing throughout
- Reusable component architecture
- ESLint configured
- No hardcoded secrets
- Clean separation of concerns

## License

All rights reserved © 2026 praav.uk

## Development Notes

This project uses:
- Next.js 16 with Turbopack
- Tailwind CSS v4 with inline theme configuration
- shadcn/ui with base-nova style
- Server Components by default
- Client Components only where needed

The codebase is structured for easy handoff to other developers or AI agents.
