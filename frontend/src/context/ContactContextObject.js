import { createContext } from 'react';
import { DEFAULT_CONTACT_CONTENT } from '../data/dealership';

export const ContactContext = createContext({
  contactData: DEFAULT_CONTACT_CONTENT,
  loading: true,
  refetchContactData: async () => {},
  updateContactData: () => {},
});
