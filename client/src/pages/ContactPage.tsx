import { useState, useCallback } from 'react';
import { MapPin, Phone, Mail, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { STUDIO_CATEGORIES } from '../context/StudioCategoryContext';
import { API_URL } from '../config';

/** Matches homepage collection sidebar + 3D filter (Footer labels). */
const SHOP_CATEGORY_OPTIONS = [
  { value: 'LIVING', label: 'Living Room' },
  { value: 'BEDROOM', label: 'Bedroom' },
  { value: 'DINING', label: 'Dining' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'OUTDOOR', label: 'Outdoor' },
  { value: 'DECOR', label: 'Decor' },
  { value: '3D_MODEL', label: '3D Model' },
] as const;

const STUDIO_CATEGORY_OPTIONS = STUDIO_CATEGORIES.filter((c) => c.id !== 'all');

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmailFormat = useCallback((value: string) => {
    if (!value) {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    const [local, domain] = value.split('@');
    const rules: Record<string, { min: number; pattern?: RegExp; label: string }> = {
      'gmail.com':      { min: 6, pattern: /^[a-zA-Z0-9.]+$/, label: 'Gmail' },
      'googlemail.com': { min: 6, pattern: /^[a-zA-Z0-9.]+$/, label: 'Gmail' },
      'yahoo.com':      { min: 4, label: 'Yahoo' },
      'ymail.com':      { min: 4, label: 'Yahoo' },
      'outlook.com':    { min: 3, label: 'Outlook' },
      'hotmail.com':    { min: 3, label: 'Hotmail' },
      'live.com':       { min: 3, label: 'Outlook' },
    };
    const rule = rules[domain?.toLowerCase()];
    if (rule) {
      if (local.length < rule.min) {
        setEmailError(`${rule.label} usernames must be at least ${rule.min} characters.`);
        return;
      }
      if (rule.pattern && !rule.pattern.test(local)) {
        setEmailError(`${rule.label} usernames can only contain letters, numbers, and dots.`);
        return;
      }
    } else if (local.length < 2) {
      setEmailError('Email username is too short.');
      return;
    }
    setEmailError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          category: formData.category,
          message: formData.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error('Could not send message', {
          description: typeof data.error === 'string' ? data.error : 'Please try again later.',
        });
        return;
      }
      toast.success('Message sent!', {
        description: "We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', phone: '', category: '', message: '' });
    } catch {
      toast.error('Network error', {
        description: 'Check your connection and that the server is running.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
            Get in touch
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-neutral-900">
            Contact Us
          </h1>
          <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
            Have a question or want to work together? Send us a message and we’ll respond as soon as we can.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-600">Name</label>
              <input
                required
                type="text"
                className="w-full border-b border-neutral-200 py-2 focus:border-amber-500 outline-none text-sm transition-colors"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-600">Email</label>
              <input
                required
                type="email"
                className={`w-full border-b py-2 outline-none text-sm transition-colors ${
                  emailError ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-amber-500'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (emailError) validateEmailFormat(e.target.value);
                }}
                onBlur={(e) => validateEmailFormat(e.target.value)}
              />
              {emailError && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle size={12} />
                  {emailError}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-600">
                Phone <span className="text-neutral-400 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                className="w-full border-b border-neutral-200 py-2 focus:border-amber-500 outline-none text-sm transition-colors"
                placeholder="+251 9XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contact-category" className="text-[10px] uppercase font-bold text-neutral-600">
                Category
              </label>
              <div className="relative">
                <select
                  id="contact-category"
                  required
                  className="w-full appearance-none border-b border-neutral-200 bg-transparent py-2 pr-8 text-sm text-neutral-900 outline-none transition-colors focus:border-amber-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {SHOP_CATEGORY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={label}>
                      {label}
                    </option>
                  ))}
                  {STUDIO_CATEGORY_OPTIONS.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="Others">Others</option>
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-600">Message</label>
              <textarea
                required
                rows={5}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:border-amber-500 outline-none text-sm resize-y transition-colors"
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-amber-600 transition-colors rounded-lg disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                'Send message'
              )}
            </button>
          </form>

          {/* Contact info */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-6">
              Other ways to reach us
            </h2>
            <ul className="space-y-6 text-neutral-700">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Address</span>
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone size={20} className="shrink-0 text-amber-600" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Phone</span>
                  <a href="tel:+251947263021" className="hover:text-amber-600 transition-colors">
                    +251 947 263 021
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Mail size={20} className="shrink-0 text-amber-600" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Email</span>
                  <a href="mailto:yosephteferi@gmail.com" className="hover:text-amber-600 transition-colors">
                    yosephdesign@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
