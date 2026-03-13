import { Link } from 'react-router-dom';
import { SiTiktok } from 'react-icons/si';
import { FaInstagram, FaYoutube, FaFacebookF, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { Mail, MapPin, Phone } from 'lucide-react';
import logoImage from '../assets/logo-profile.png';

const socialLinks = [
  { name: "TikTok", icon: SiTiktok, href: "#" },
  { name: "Instagram", icon: FaInstagram, href: "#" },
  { name: "YouTube", icon: FaYoutube, href: "#" },
  { name: "Facebook", icon: FaFacebookF, href: "#" },
  { name: "LinkedIn", icon: FaLinkedinIn, href: "#" },
  { name: "Telegram", icon: FaTelegramPlane, href: "#" }
];

export const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">Join Our Newsletter</h3>
              <p className="text-sm text-neutral-400">Get exclusive offers and design inspiration delivered to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-white outline-none flex-1 md:w-72 transition-colors"
              />
              <button className="bg-amber-500 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <img 
                src={logoImage} 
                alt="Yoseph Design" 
                className="h-14 w-14 rounded-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <span className="text-xl font-bold tracking-tighter uppercase group-hover:opacity-70 transition-opacity">Yoseph-Design</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Curating exceptional architectural design for modern living spaces. Quality furniture that transforms your home.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-amber-500 hover:text-white transition-all"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">Categories</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#collection" className="hover:text-amber-400 transition-colors">Living Room</a></li>
              <li><a href="#collection" className="hover:text-amber-400 transition-colors">Bedroom</a></li>
              <li><a href="#collection" className="hover:text-amber-400 transition-colors">Dining</a></li>
              <li><a href="#collection" className="hover:text-amber-400 transition-colors">Office</a></li>
              <li><a href="#collection" className="hover:text-amber-400 transition-colors">Outdoor</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">Support</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">Contact</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0" />
                <a href="tel:+251911000000" className="hover:text-amber-400 transition-colors">+251 911 000 000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0" />
                <a href="mailto:yosephteferi@gmail.com" className="hover:text-amber-400 transition-colors">yosephteferi@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-500">
              © 2026 Yoseph-Design. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-neutral-500">
              <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
