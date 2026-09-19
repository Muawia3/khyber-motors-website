import prisma from '../server/config/db.js';
import { DEFAULT_CONTACT_CONTENT } from '../src/data/dealership.js';

async function updateContact() {
  console.log('Updating contact content in database...');
  const updatedData = {
    ...DEFAULT_CONTACT_CONTENT,
    address: 'XHQQ+8GV, Ring Road Sohailabad, near Kakakhel CNG, Hazara Khawani, Peshawar, 25000, Pakistan',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan',
    mapEmbedUrl: 'https://maps.google.com/maps?q=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed',
    plusCode: 'XHQQ+8GV, Peshawar',
  };

  await prisma.pageContent.upsert({
    where: { key: 'contact' },
    update: { data: JSON.stringify(updatedData) },
    create: { key: 'contact', data: JSON.stringify(updatedData) },
  });

  console.log('✔ Contact data in database successfully updated with new location!');
  await prisma.$disconnect();
}

updateContact().catch((err) => {
  console.error('Error updating DB:', err);
  process.exit(1);
});
