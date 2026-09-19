import {
  LayoutDashboard,
  Car,
  Truck,
  Home,
  Image as ImageIcon,
  Share2,
  Star,
  Phone,
  Wrench,
  Info,
  Users,
  UserCheck,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
} from 'lucide-react';

export const ADMIN_NAV_GROUPS = [
  {
    groupLabel: null,
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }],
  },
  {
    groupLabel: 'Content',
    items: [
      { label: 'All Vehicles', path: '/admin/vehicles', icon: Car },
      { label: 'Passengers', path: '/admin/vehicles/passengers', icon: Car },
      { label: 'Heavy Trucks', path: '/admin/vehicles/trucks/heavy', icon: Truck },
      { label: 'Light Trucks', path: '/admin/vehicles/trucks/light', icon: Truck },
      { label: 'Homepage', path: '/admin/content/homepage', icon: Home },
      { label: 'Hero Images', path: '/admin/content/homepage/hero-images', icon: ImageIcon },
      { label: 'Social Media', path: '/admin/content/social-media', icon: Share2 },
      { label: 'Customer Reviews', path: '/admin/content/reviews', icon: Star },
      { label: 'Contact', path: '/admin/content/contact', icon: Phone },
      { label: 'Profiles / Our Team', path: '/admin/content/team', icon: Users },
      { label: 'Services', path: '/admin/content/services', icon: Wrench },
      { label: 'About Us', path: '/admin/content/about', icon: Info },

    ],
  },
  {
    groupLabel: 'Sales',
    items: [
      { label: 'Leads', path: '/admin/leads', icon: Users },
      { label: 'Customers', path: '/admin/customers', icon: UserCheck },
    ],
  },
  {
    groupLabel: 'Operations',
    items: [
      { label: 'Service Requests', path: '/admin/operations/services', icon: Clock },
      { label: 'Sales Log', path: '/admin/sales', icon: TrendingUp },
    ],
  },
  {
    groupLabel: 'System',
    items: [
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];
