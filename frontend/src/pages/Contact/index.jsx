import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  Navigation,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Share2,
  ExternalLink,
  User,
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useContact } from '../../context/useContact';
import { socialLinkService } from '../../services/socialLinkService';
import { departmentService } from '../../services/departmentService';
import { SocialIcon } from '../../components/common/SocialIcons';
import { validatePakistaniPhone, validateEmail, validateRequired } from '../../utils/validation';

export const ContactPage = () => {
  const { contactData } = useContact();
  const [socialLinks, setSocialLinks] = useState([]);
  const [deptContacts, setDeptContacts] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSocial = async () => {
      try {
        const links = await socialLinkService.getSocialLinks(true);
        if (isMounted && links && links.length > 0) {
          setSocialLinks(links);
        }
      } catch (err) {
        console.warn('Contact social fetch notice:', err);
      }
    };

    const fetchDepartments = async () => {
      try {
        const data = await departmentService.getDepartments(true);
        if (isMounted && data) {
          setDeptContacts(data);
        }
      } catch (err) {
        console.warn('Contact departments fetch notice:', err);
      } finally {
        if (isMounted) setLoadingDepts(false);
      }
    };

    fetchSocial();
    fetchDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    department: 'sales',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us | Khyber Motors';
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Phone Number is required';
    } else if (!validatePakistaniPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Pakistani phone number (e.g. 0300 1234567)';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email, true)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!validateRequired(formData.message)) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      phone: true,
      email: true,
      subject: true,
      message: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          department: formData.department,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.warn('Lead submission API warning:', err.message);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-3 pb-6 bg-gray-50/50 min-h-screen">
      <Container size="xl">
        {/* Page Hero */}
        <SectionHeading
          badge="Get in Touch"
          title="Contact Khyber Motors"
          subtitle="Whether you require vehicle quotations, corporate fleet pricing, 3S maintenance appointments, or genuine spare parts, our dealership team is ready to assist."
          align="center"
        />



        {/* Main Grid: Inquiry Form (Left) & Map + Social Media (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form (Left Column) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 border border-gray-200/80 bg-white shadow-sm">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold uppercase text-gray-900 tracking-tight">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fill in the inquiry form below and our team will get back to you promptly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="e.g. Asadullah Khan"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      onBlur={() => handleBlur('fullName')}
                      error={touched.fullName && errors.fullName}
                    />

                    <Input
                      label="Phone Number"
                      placeholder="e.g. 0300 5554433"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone && errors.phone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => handleBlur('email')}
                      error={touched.email && errors.email}
                    />

                    <Select
                      label="Department"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      options={
                        deptContacts.length > 0
                          ? deptContacts.map((d) => ({
                              value: d.name.toLowerCase().replace(/\s+/g, '_'),
                              label: `${d.name} (${d.contactPerson || d.personName || ''})`,
                            }))
                          : [
                              { value: 'sales', label: 'New Vehicle Sales' },
                              { value: 'service', label: '3S Service & Maintenance' },
                              { value: 'parts', label: 'Genuine Spare Parts' },
                              { value: 'fleet', label: 'Corporate & Fleet Sales' },
                            ]
                      }
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="e.g. JAC T9 4x4 Quotation & Delivery Inquiry"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    onBlur={() => handleBlur('subject')}
                    error={touched.subject && errors.subject}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Write your detailed inquiry here..."
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    onBlur={() => handleBlur('message')}
                    error={touched.message && errors.message}
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="py-3.5 text-base uppercase font-bold tracking-wider"
                  >
                    Send Inquiry
                  </Button>
                </form>
              ) : (
                /* Success State Display */
                <div className="py-12 text-center space-y-5 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold uppercase text-gray-900 tracking-tight">
                      Thank You for Reaching Out!
                    </h2>
                    <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-medium">
                      Your inquiry has been received by our{' '}
                      <strong className="uppercase text-[#C8102E]">{formData.department}</strong>{' '}
                      department. A representative will contact you shortly via phone or email.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          fullName: '',
                          phone: '',
                          email: '',
                          department: 'sales',
                          subject: '',
                          message: '',
                        });
                        setErrors({});
                        setTouched({});
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Map & Social Media Side (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Dealership Google Map & Location Link */}
            <Card className="p-0 overflow-hidden border border-gray-200/80 bg-[#111827] text-white shadow-sm">
              <div className="relative h-64 bg-gray-900 border-b border-gray-800">
                <iframe
                  title="Khyber Motors Location Map"
                  src={
                    contactData.mapEmbedUrl ||
                    'https://maps.google.com/maps?q=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed'
                  }
                  className="w-full h-full border-0 grayscale opacity-90 hover:grayscale-0 transition-all duration-500"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-5 bg-gray-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">
                      {contactData.name || 'Khyber Motors 3S Dealership'}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                      {contactData.address ||
                        'XHQQ+8GV, Ring Road Sohailabad, near Kakakhel CNG, Hazara Khawani, Peshawar, 25000, Pakistan'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded-xs border border-gray-700">
                      Plus Code: {contactData.plusCode || 'XHQQ+8GV, Peshawar'}
                    </span>
                  </div>
                  <a
                    href={
                      contactData.mapLink ||
                      'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>

            {/* Official Social Channels Card */}
            <Card className="p-6 space-y-4 border border-gray-200/80 bg-white shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                <span>Official Social Channels</span>
                <Globe className="w-4 h-4 text-[#C8102E]" />
              </h3>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {socialLinks.length > 0 ? (
                  socialLinks
                    .filter((item) =>
                      ['tiktok', 'instagram', 'facebook', 'whatsapp'].some((p) =>
                        p === (item.platform || '').toLowerCase()
                      )
                    )
                    .map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold rounded-xs transition-colors"
                      >
                        <SocialIcon name={item.platform} icon={item.icon} className="w-4 h-4" />
                        <span>{item.platform}</span>
                      </a>
                    ))
                ) : (
                  contactData.social && (
                    <>
                      {contactData.social.tiktok && (
                        <a
                          href={contactData.social.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold rounded-xs transition-colors"
                        >
                          <SocialIcon name="TikTok" className="w-4 h-4" />
                          <span>TikTok</span>
                        </a>
                      )}
                      {contactData.social.instagram && (
                        <a
                          href={contactData.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold rounded-xs transition-colors"
                        >
                          <SocialIcon name="Instagram" className="w-4 h-4" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {contactData.social.facebook && (
                        <a
                          href={contactData.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold rounded-xs transition-colors"
                        >
                          <SocialIcon name="Facebook" className="w-4 h-4" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {contactData.social.whatsapp && (
                        <a
                          href={
                            contactData.social.whatsapp.startsWith('http')
                              ? contactData.social.whatsapp
                              : `https://wa.me/${contactData.social.whatsapp.replace(/[^0-9]/g, '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold rounded-xs transition-colors"
                        >
                          <SocialIcon name="WhatsApp" className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Full-width Department Direct Contacts Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200/80">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">
                Department Direct Contacts
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Reach out directly to our dedicated department managers and service desks.
              </p>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#C8102E] bg-red-50 px-3 py-1 rounded-xs border border-red-100">
              Live Facility Desk
            </span>
          </div>

          {loadingDepts ? (
            <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
              Loading department contacts...
            </div>
          ) : deptContacts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No active department contacts available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deptContacts.map((dept) => {
                const cleanWa = dept.whatsapp ? dept.whatsapp.replace(/[^0-9]/g, '') : '';
                const waLink = cleanWa.startsWith('92')
                  ? `https://wa.me/${cleanWa}`
                  : `https://wa.me/92${cleanWa.replace(/^0/, '')}`;
                const personName = dept.contactPerson || dept.personName;

                return (
                  <Card
                    key={dept.id}
                    className="p-5 border border-gray-200/80 bg-white hover:border-[#C8102E] transition-all flex flex-col justify-between shadow-xs space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header: Dept Name & Contact Person */}
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight">
                            {dept.name}
                          </h4>
                          {personName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 mt-1">
                              <User className="w-3 h-3 text-[#C8102E]" />
                              {personName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact Info: Phone & Email */}
                      <div className="space-y-2 text-xs">
                        {dept.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                            <a
                              href={`tel:${dept.phone}`}
                              className="font-mono font-semibold text-gray-800 hover:text-[#C8102E] transition-colors"
                              title={`Call ${personName || dept.name}`}
                            >
                              {dept.phone}
                            </a>
                          </div>
                        )}

                        {dept.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <a
                              href={`mailto:${dept.email}`}
                              className="text-gray-600 hover:text-[#C8102E] transition-colors truncate"
                              title={`Email ${personName || dept.name}`}
                            >
                              {dept.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action: WhatsApp Button if available */}
                    {dept.whatsapp && (
                      <div className="pt-3 border-t border-gray-100">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Chat</span>
                        </a>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};
