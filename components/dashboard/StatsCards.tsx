import { Package, TrendingUp, Eye, Star } from 'lucide-react';
import Link from 'next/link';

interface StatsCardsProps {
  totalListings: number;
  totalSales: number;
  profileViews: number;
  rating: number;
}

export function StatsCards({
  totalListings,
  totalSales,
  profileViews,
  rating,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Active Listings',
      value: totalListings,
      icon: Package,
      description: 'Items currently for sale',
      href: null,
    },
    {
      label: 'Total Sales',
      value: totalSales,
      icon: TrendingUp,
      description: 'Items sold all time',
      href: '/dashboard/orders',
    },
    {
      label: 'Profile Views',
      value: profileViews,
      icon: Eye,
      description: 'People who viewed your profile',
      href: null,
    },
    {
      label: 'Rating',
      value: rating.toFixed(1),
      icon: Star,
      description: 'Average rating from buyers',
      href: null,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const content = (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.label}
              </h3>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground hidden sm:block mt-1">
              {stat.description}
            </p>
          </>
        );

        if (stat.href) {
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-3 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={stat.label}
            className="p-3 sm:p-4 rounded-lg border bg-card"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
