import prisma from '../server/config/db.js';

const ALLOWED_PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'WhatsApp'];

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'TikTok', url: 'https://tiktok.com/@khybermotors', icon: 'TikTok', displayOrder: 0, isActive: true },
  { platform: 'Instagram', url: 'https://instagram.com/khybermotors', icon: 'Instagram', displayOrder: 1, isActive: true },
  { platform: 'Facebook', url: 'https://facebook.com/khybermotors', icon: 'Facebook', displayOrder: 2, isActive: true },
  { platform: 'WhatsApp', url: 'https://wa.me/923000000000', icon: 'WhatsApp', displayOrder: 3, isActive: true },
];

async function verify() {
  console.log('--- VERIFYING SOCIAL LINKS QUERY ---');
  // Delete any non-allowed platforms
  await prisma.socialLink.deleteMany({
    where: { platform: { notIn: ALLOWED_PLATFORMS } }
  });

  const count = await prisma.socialLink.count();
  if (count === 0) {
    for (const item of DEFAULT_SOCIAL_LINKS) {
      await prisma.socialLink.create({ data: item });
    }
  }

  const links = await prisma.socialLink.findMany({
    where: { isActive: true, platform: { in: ALLOWED_PLATFORMS } },
    orderBy: { displayOrder: 'asc' }
  });

  console.log(`Found ${links.length} active social links:`);
  console.log(JSON.stringify(links, null, 2));

  console.log('\n--- VERIFYING CONTACT CONTENT QUERY ---');
  const contactContent = await prisma.pageContent.findUnique({
    where: { key: 'contact' }
  });
  console.log('Contact content found:');
  console.log(contactContent ? JSON.parse(contactContent.data) : 'NOT FOUND!');

  await prisma.$disconnect();
}

verify().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
