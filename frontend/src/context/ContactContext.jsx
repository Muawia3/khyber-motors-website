import React, { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';
import { DEFAULT_CONTACT_CONTENT } from '../data/dealership';
import { ContactContext } from './ContactContextObject';

export const ContactProvider = ({ children }) => {
  const [contactData, setContactData] = useState(DEFAULT_CONTACT_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContactData = async () => {
    try {
      const data = await contentService.getContactContent();
      if (data) {
        setContactData({
          ...DEFAULT_CONTACT_CONTENT,
          ...data,
          social: {
            ...DEFAULT_CONTACT_CONTENT.social,
            ...(data.social || {}),
          },
        });
      }
    } catch (err) {
      console.warn('ContactContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  const updateContactData = (newData) => {
    setContactData((prev) => ({
      ...prev,
      ...newData,
      social: {
        ...(prev.social || {}),
        ...(newData.social || {}),
      },
    }));
  };

  return (
    <ContactContext.Provider
      value={{
        contactData,
        loading,
        refetchContactData: fetchContactData,
        updateContactData,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export default ContactProvider;
