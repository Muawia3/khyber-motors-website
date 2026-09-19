import { useContext } from 'react';
import { ContactContext } from './ContactContextObject';

export const useContact = () => useContext(ContactContext);

export default useContact;
