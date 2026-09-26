/**
 * Structured service data supporting service listings and expandable/detail routing.
 */
export const SERVICES_DATA = [
  {
    id: 'vehicle-sales',
    slug: 'vehicle-sales',
    title: 'Vehicle Sales',
    iconName: 'Car',
    badge: 'Showroom & Fleet',
    description: 'Explore the full lineup of JAC pickups and commercial vehicles. Our sales specialists assist with model selection, fleet configuration, and customized procurement plans.',
    details: 'From rugged double-cabin pickup trucks to heavy-duty commercial transport, our sales team provides transparent guidance to meet personal, commercial, and enterprise transport needs.',
    features: [
      'Double cabin pickup trucks and commercial utility lineup',
      'Corporate fleet procurement & tailored business packages',
      'On-site vehicle demonstration & model walk-throughs',
      'Transparent pricing and booking assistance'
    ],
    ctaText: 'Explore Vehicles',
    ctaLink: '/vehicles'
  },
  {
    id: 'after-sales-service',
    slug: 'after-sales-service',
    title: 'After-Sales Service',
    iconName: 'ShieldCheck',
    badge: '3S Service Desk',
    description: 'Comprehensive warranty support, routine vehicle health inspections, and technical assistance backed by certified technicians and diagnostic equipment.',
    details: 'Our dedicated after-sales team ensures long-term vehicle reliability through structured routine inspections, official warranty handling, and rapid response technical support.',
    features: [
      'Official factory warranty claims processing',
      'Multi-point vehicle digital health diagnostics',
      'Preventative vehicle care and seasonal checks',
      'Dedicated technical advisory desk'
    ],
    ctaText: 'Contact After-Sales',
    ctaLink: '/contact'
  },
  {
    id: 'genuine-spare-parts',
    slug: 'genuine-spare-parts',
    title: 'Genuine Spare Parts',
    iconName: 'PackageCheck',
    badge: 'Factory Parts Inventory',
    description: '100% OEM factory spare parts, filters, engine components, and body panels direct from JAC Motors for maximum longevity and perfect fitment.',
    details: 'Maintain your vehicle with genuine factory-certified parts engineered specifically for JAC models, preserving safety standards and vehicle resale value.',
    features: [
      'Direct factory OEM spare parts inventory',
      'Brake pads, filters, clutch kits, and suspension parts',
      'Fast order fulfillment for fleet operators',
      'Guaranteed fitment and warranty protection'
    ],
    ctaText: 'Inquire Parts',
    ctaLink: '/contact'
  },
  {
    id: 'vehicle-maintenance',
    slug: 'vehicle-maintenance',
    title: 'Vehicle Maintenance',
    iconName: 'Wrench',
    badge: 'Authorized Workshop',
    description: 'Scheduled lube services, oil changes, engine tuning, brake servicing, and complete mechanical overhauls using state-of-the-art workshop bays.',
    details: 'Keep your vehicle operating at peak efficiency. Our authorized workshop provides scheduled periodic maintenance, fluid exchanges, and precision mechanical servicing.',
    features: [
      'Routine oil change & filter replacements',
      'Brake system inspection and pad replacement',
      'Wheel alignment, balancing & suspension tuning',
      'Computerized engine & ECU diagnostic scanning'
    ],
    ctaText: 'Schedule Service',
    ctaLink: '/services#book-service'
  },
  {
    id: 'customer-support',
    slug: 'customer-support',
    title: 'Customer Support',
    iconName: 'Headphones',
    badge: 'Help Desk',
    description: 'Dedicated customer care desk for inquiries, appointment bookings, emergency breakdown guidance, and feedback resolution.',
    details: 'We are committed to delivering prompt, respectful, and clear communication. Our support desk assists with questions, service tracking, and operational help.',
    features: [
      'Direct telephone and WhatsApp helpline support',
      'Prompt response to general and technical inquiries',
      'Service appointment confirmation & updates',
      'Customer feedback and quality assurance tracking'
    ],
    ctaText: 'Reach Support',
    ctaLink: '/contact'
  }
];
