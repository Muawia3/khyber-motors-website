import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  PackageCheck,
  Wrench,
  Headphones,
  Calendar,
  CheckCircle2,
  Phone,
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { SERVICES_DATA } from '../../data/services';
import { validatePakistaniPhone, validateRequired } from '../../utils/validation';
import { contentService } from '../../services/contentService';
import { useContact } from '../../context/useContact';

// Helper icon mapping
const ICON_MAP = {
  Car: Car,
  ShieldCheck: ShieldCheck,
  PackageCheck: PackageCheck,
  Wrench: Wrench,
  Headphones: Headphones,
};

export const ServicesPage = () => {
  const { contactData } = useContact();
  const [servicesContent, setServicesContent] = useState(SERVICES_DATA);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await contentService.getServicesContent();
        if (isMounted && data) {
          if (Array.isArray(data) && data.length > 0) {
            setServicesContent(data);
          } else if (data.services && Array.isArray(data.services) && data.services.length > 0) {
            setServicesContent(data.services);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch Services content:', err);
      }
    };
    load();

    if (window.location.hash === '#book-service') {
      setTimeout(() => {
        const elem = document.getElementById('book-service');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Maintenance appointment form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleModel: 'JAC T9 4x4',
    registrationNumber: '',
    preferredDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Services & Maintenance | Khyber Motors';
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

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

    if (!validateRequired(formData.vehicleModel)) {
      newErrors.vehicleModel = 'Vehicle Model is required';
    }

    if (!validateRequired(formData.preferredDate)) {
      newErrors.preferredDate = 'Preferred Date is required';
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
      vehicleModel: true,
      preferredDate: true,
    });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          department: 'Authorized 3S Workshop',
          subject: `Service Appointment (${formData.vehicleModel})`,
          message: `Vehicle Model: ${formData.vehicleModel}\nRegistration No: ${formData.registrationNumber || 'N/A'}\nPreferred Date: ${formData.preferredDate}\nDetails / Notes: ${formData.notes || 'None'}`,
        }),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.warn('Service appointment submission error:', err);
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
          badge="Authorized 3S Facility"
          title={servicesContent?.hero?.title || "Professional Support Beyond the Sale"}
          subtitle={servicesContent?.hero?.subtitle || "From double cabin vehicle sales to certified after-sales service, genuine spare parts, and vehicle maintenance, our team ensures complete operational reliability."}
          align="center"
        />

        {/* 5 Core Services Grid */}
        <div className="my-6 sm:my-8">

          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Our Core Offerings
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              Comprehensive Dealership Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(servicesContent?.services || SERVICES_DATA).map((service) => {
              const ServiceIcon = ICON_MAP[service.iconName] || Wrench;
              return (
                <Card
                  key={service.id}
                  className="p-6 flex flex-col justify-between border border-gray-200/80 bg-white hover:border-[#C8102E] hover:shadow-md transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-red-50 text-[#C8102E] rounded-xs flex items-center justify-center font-bold group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                        <ServiceIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-xs">
                        {service.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight group-hover:text-[#C8102E] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      {service.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C8102E] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForModal(service)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#C8102E] focus:outline-none transition-colors"
                    >
                      <Info className="w-4 h-4" /> Learn More
                    </button>

                    {service.ctaLink?.includes('#book-service') ? (
                      <Button
                        variant="secondary"
                        size="xs"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={() => {
                          const elem = document.getElementById('book-service');
                          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {service.ctaText}
                      </Button>
                    ) : (
                      <Link to={service.ctaLink || '/contact'}>
                        <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          {service.ctaText}
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Maintenance Appointment Booking Form Section */}
        <div id="book-service" className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-8 border border-gray-200/80 bg-white shadow-sm">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-xl font-bold uppercase text-gray-900 tracking-tight">
                      Schedule Maintenance / Service Appointment
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Book your routine maintenance or repair slot directly with our 3S workshop team.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Customer Full Name"
                      placeholder="e.g. Tariq Khan"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      onBlur={() => handleBlur('fullName')}
                      error={touched.fullName && errors.fullName}
                    />

                    <Input
                      label="Phone / Mobile Number"
                      placeholder="e.g. 0300 9876543"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone && errors.phone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Vehicle Model"
                      placeholder="e.g. JAC T9 / T8 / Commercial Truck"
                      required
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      onBlur={() => handleBlur('vehicleModel')}
                      error={touched.vehicleModel && errors.vehicleModel}
                    />

                    <Input
                      label="Registration No. (Optional)"
                      placeholder="e.g. PR-1234"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <Input
                      label="Preferred Appointment Date"
                      type="date"
                      min={todayStr}
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      onBlur={() => handleBlur('preferredDate')}
                      error={touched.preferredDate && errors.preferredDate}
                    />
                  </div>

                  <Textarea
                    label="Notes / Specific Issues"
                    placeholder="Describe any symptoms, specific part requests, or notes for the workshop engineer..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Calendar className="w-5 h-5" />}
                    className="py-3 text-base uppercase font-bold tracking-wider"
                  >
                    Submit Service Appointment Request
                  </Button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-extrabold uppercase text-gray-900">
                    Service Appointment Requested!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-gray-900">{formData.fullName}</strong>. Our 3S Workshop Desk will call <strong className="text-gray-900">{formData.phone}</strong> to confirm your slot for <strong className="text-[#C8102E]">{formData.preferredDate}</strong>.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: '',
                        phone: '',
                        vehicleModel: 'JAC T9 4x4',
                        registrationNumber: '',
                        preferredDate: '',
                        notes: '',
                      });
                      setErrors({});
                      setTouched({});
                    }}
                  >
                    Book Another Service
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Workshop Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-[#111827] text-white space-y-4 border border-gray-800">
              <h4 className="text-sm font-extrabold uppercase text-white border-b border-gray-800 pb-2">
                3S Workshop Hours
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Monday – Saturday: 8:30 AM – 5:30 PM <br />
                Sunday: Emergency Service Only
              </p>
              <div className="pt-2 border-t border-gray-800">
                <a
                  href={`tel:${contactData.serviceDirect || contactData.phone}`}
                  className="flex items-center justify-center gap-2 bg-[#C8102E] text-white py-2.5 px-3 rounded-xs text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Service Direct: {contactData.serviceDirect || contactData.phone}
                </a>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* Service Detail Modal (Service-Detail-Ready Architecture) */}
      <Modal
        isOpen={Boolean(selectedServiceForModal)}
        onClose={() => setSelectedServiceForModal(null)}
        title={selectedServiceForModal?.title || 'Service Details'}
      >
        {selectedServiceForModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C8102E] uppercase">
              <span>{selectedServiceForModal.badge}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedServiceForModal.details}
            </p>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-2">Key Service Features</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {selectedServiceForModal.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedServiceForModal(null)}>
                Close
              </Button>
              <Link
                to={selectedServiceForModal.ctaLink}
                onClick={() => setSelectedServiceForModal(null)}
              >
                <Button variant="primary" size="sm">
                  {selectedServiceForModal.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
