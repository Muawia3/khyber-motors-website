import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_DEFAULTS = {
  contact: {
    name: 'Khyber Motors',
    shortName: 'Khyber Motors',
    status: 'Authorized 3S Dealership (Sales, Service & Spare Parts)',
    tagline: 'Engineered for Performance. Built for Pakistan.',
    footerText: 'Khyber Pakhtunkhwa’s premier 3S Dealership for double cabin pickup trucks, commercial logistics vehicles, and modern crossover SUVs.',
    address: 'XHQQ+8GV, Ring Road Sohailabad, near Kakakhel CNG, Hazara Khawani, Peshawar, 25000, Pakistan',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan',
    mapEmbedUrl: 'https://maps.google.com/maps?q=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed',
    plusCode: 'XHQQ+8GV, Peshawar',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    postalCode: '25000',
    phone: '+92 (091) 5840900',
    salesDirect: '+92 300 1234567',
    serviceDirect: '+92 300 7654321',
    whatsapp: '+92 300 0000000',
    email: 'muawiakhan000@gmail.com',
    social: {
      tiktok: 'https://tiktok.com/@khybermotors',
      instagram: 'https://instagram.com/khybermotors',
      facebook: 'https://facebook.com/khybermotors',
      whatsapp: 'https://wa.me/923000000000',
    },
    businessHours: [
      { days: 'Monday – Saturday', hours: '9:00 AM – 7:00 PM' },
      { days: 'Sunday', hours: 'Emergency Service Only (10:00 AM – 4:00 PM)' },
    ],
    departments: [
      { name: 'Showroom & Sales', contact: '+92 (091) 5840901', timing: '9:00 AM – 7:00 PM' },
      { name: 'Authorized 3S Workshop', contact: '+92 (091) 5840902', timing: '8:30 AM – 5:30 PM' },
      { name: 'Genuine Spare Parts', contact: '+92 (091) 5840903', timing: '9:00 AM – 6:00 PM' },
      { name: 'Fleet & Corporate Sales', contact: '+92 (091) 5840904', timing: '9:00 AM – 6:00 PM' },
    ],
  },
  about: {
    hero: {
      title: 'About Our Dealership',
      subtitle: 'Authorized 3S Dealership (Sales, Service & Spare Parts) providing professional automotive solutions, double cabin pickups, and commercial transport support.',
    },
    whoWeAre: {
      heading: 'Authorized Automotive & Commercial Vehicle Representative',
      description: 'Khyber Motors operates as an authorized 3S dealership facility offering comprehensive vehicle sales, maintenance servicing, and factory genuine spare parts distribution.',
      paragraph2: 'Our dealership facility on Main Ring Road Bypass is structured to serve individual vehicle buyers, enterprise fleet operators, and commercial transport businesses with standardized manufacturer protocols and transparent consultation.',
      notice: 'Specific company milestones, historical figures, and corporate governance details can be customized here upon management review and official approval.',
    },
    facilityOverview: [
      {
        title: '3S Integrated Facility',
        description: 'Sales showroom, aftersales service workshop, and genuine parts counter under one roof.',
      },
      {
        title: 'Diagnostic & Service Machinery',
        description: 'Computerized diagnostic bay tools, hydraulic vehicle lifts, and alignment stations.',
      },
      {
        title: 'Customer Hospitality Lounge',
        description: 'Air-conditioned executive waiting lounge with transparent workshop view and refreshments.',
      },
    ],
    commitment: {
      heading: 'Our Commitment to Quality & Transparency',
      cards: [
        {
          title: 'Authentic Manufacturer Parts',
          description: 'We utilize only 100% genuine factory OEM parts and approved lubricants, ensuring safety, durability, and factory warranty compliance.',
          iconName: 'ShieldCheck',
        },
        {
          title: 'Transparent Operations',
          description: 'Every vehicle consultation, cost estimate, and maintenance recommendation is communicated clearly without hidden charges or unverified fees.',
          iconName: 'Building2',
        },
        {
          title: 'Professional Standards',
          description: 'Our technicians and sales advisors undergo continuous technical training according to standard JAC Motors operational guidelines.',
          iconName: 'Wrench',
        },
      ],
    },
    whyUs: {
      heading: 'Why Customers Choose Us',
      advantages: [
        {
          title: 'Full 3S Facility Integration',
          description: 'Consolidated showroom sales, after-sales service, and spare parts under a single facility for simplified customer management.',
        },
        {
          title: 'Commercial Fleet Expertise',
          description: 'Specialized fleet consultation for logistics businesses, commercial haulers, and corporate organizations.',
        },
        {
          title: 'Warranty Claim Support',
          description: 'Official factory warranty handling, diagnostic reporting, and replacement part processing for covered components.',
        },
        {
          title: 'Direct Helpline & Support Desk',
          description: 'Dedicated telephone and digital help channels for prompt customer assistance and service appointment scheduling.',
        },
      ],
    },
    teamStructure: {
      heading: 'Our Professional Team Structure',
      subtitle: 'Departmental overview with placeholder management roles ready for verified staff designations.',
      departments: [
        {
          title: 'Dealership Management',
          role: 'Executive Direction',
          description: 'Oversees facility operations, manufacturer compliance, and customer satisfaction standards.',
        },
        {
          title: 'Sales & Fleet Advisory',
          role: 'Commercial Consultants',
          description: 'Guides individual buyers and corporate clients through vehicle selection, options, and test drives.',
        },
        {
          title: 'Service & Workshop Engineers',
          role: 'Technical Operations',
          description: 'Certified mechanics executing computerized diagnostics, maintenance, and major overhauls.',
        },
        {
          title: 'Customer Support Desk',
          role: 'Client Relations',
          description: 'Handles appointments, phone inquiries, warranty documentation, and customer feedback.',
        },
      ],
    },
    mission: 'To deliver reliable, high-performance pickup trucks and commercial transport vehicles backed by dedicated after-sales support and genuine spare parts across Khyber Pakhtunkhwa.',
  },
  services: [
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
        'Transparent pricing and booking assistance',
      ],
      ctaText: 'Explore Vehicles',
      ctaLink: '/vehicles',
      isActive: true,
      displayOrder: 1,
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
        'Dedicated technical advisory desk',
      ],
      ctaText: 'Contact After-Sales',
      ctaLink: '/contact',
      isActive: true,
      displayOrder: 2,
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
        'Guaranteed fitment and warranty protection',
      ],
      ctaText: 'Inquire Parts',
      ctaLink: '/contact',
      isActive: true,
      displayOrder: 3,
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
        'Computerized engine & ECU diagnostic scanning',
      ],
      ctaText: 'Schedule Service',
      ctaLink: '/services#book-service',
      isActive: true,
      displayOrder: 4,
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
        'Customer feedback and quality assurance tracking',
      ],
      ctaText: 'Reach Support',
      ctaLink: '/contact',
      isActive: true,
      displayOrder: 5,
    },
  ],
};

// GET /api/content/:key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const lowerKey = key.toLowerCase();
    let content = await prisma.pageContent.findUnique({
      where: { key: lowerKey },
    });

    if (!content && DEFAULT_DEFAULTS[lowerKey]) {
      const stringified = JSON.stringify(DEFAULT_DEFAULTS[lowerKey]);
      content = await prisma.pageContent.create({
        data: { key: lowerKey, data: stringified },
      });
    }

    if (!content) {
      return res.status(404).json({ success: false, error: `Content key '${key}' not found.` });
    }

    const data = typeof content.data === 'string' ? JSON.parse(content.data) : content.data;
    return res.json({ success: true, key: content.key, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/content/:key (Admin protected)
const updateContentHandler = async (req, res) => {
  try {
    const { key } = req.params;
    let dataToSave = req.body.data !== undefined ? req.body.data : req.body;

    if (!dataToSave) {
      return res.status(400).json({ success: false, error: 'Content data is required.' });
    }

    const stringifiedData = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave);

    const updated = await prisma.pageContent.upsert({
      where: { key: key.toLowerCase() },
      update: { data: stringifiedData },
      create: { key: key.toLowerCase(), data: stringifiedData },
    });

    const parsed = typeof updated.data === 'string' ? JSON.parse(updated.data) : updated.data;
    return res.json({ success: true, key: updated.key, data: parsed });
  } catch (error) {
    console.error('Update content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

router.put('/:key', authMiddleware, updateContentHandler);
router.post('/:key', authMiddleware, updateContentHandler);

export default router;
