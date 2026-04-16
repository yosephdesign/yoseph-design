import { useState } from "react";
import { Link } from "react-router-dom";
import { SiTiktok } from "react-icons/si";
import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaLinkedinIn,
  FaTelegramPlane,
} from "react-icons/fa";
import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config";
import logoImage from "../assets/logo-profile.png";

const socialLinks = [
  {
    name: "TikTok",
    icon: SiTiktok,
    href: "https://www.tiktok.com/@yosephdesign",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/yosephdesign",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    href: "https://www.youtube.com/@yosephdesign1",
  },
  { name: "Facebook", icon: FaFacebookF, href: "#" },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/yosephdesign",
  },
  {
    name: "Telegram",
    icon: FaTelegramPlane,
    href: "https://t.me/yosephdesign",
  },
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data.error === "string"
            ? data.error
            : "Subscription failed. Please try again.",
        );
        return;
      }
      toast.success("Subscribed!", {
        description: "You'll receive our latest updates.",
      });
      setEmail("");
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">
                Join Our Newsletter
              </h3>
              <p className="text-sm text-neutral-400">
                Get exclusive offers and design inspiration delivered to your
                inbox.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-white outline-none flex-1 md:w-72 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:pointer-events-none inline-flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Subscribe
              </button>
            </form>
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
              <span className="text-xl font-bold tracking-tighter uppercase group-hover:opacity-70 transition-opacity">
                Yoseph-Design
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Curating exceptional architectural design for modern living
              spaces. Quality furniture that transforms your home.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                social.href === "#" ? (
                  <span
                    key={social.name}
                    aria-label={`${social.name} unavailable`}
                    title={`${social.name} coming soon`}
                    className="w-9 h-9 rounded-full bg-neutral-800/70 flex items-center justify-center text-neutral-500 cursor-not-allowed"
                  >
                    <social.icon size={16} />
                  </span>
                ) : (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.name}
                    className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-amber-500 hover:text-white transition-all"
                  >
                    <social.icon size={16} />
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">
              Categories
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link
                  to="/?category=LIVING"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Living Room
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=BEDROOM"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Bedroom
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=DINING"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Dining
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=OFFICE"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Office
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=OUTDOOR"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Outdoor
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=DECOR"
                  onClick={() =>
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  Decor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link
                  to="/contact?topic=faqs"
                  className="hover:text-amber-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/contact?topic=order-tracking"
                  className="hover:text-amber-400 transition-colors"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  to="/contact?topic=size-guide"
                  className="hover:text-amber-400 transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-neutral-300">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0" />
                <a
                  href="tel:+251947263021"
                  className="hover:text-amber-400 transition-colors"
                >
                  +251 947 263 021
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&to=yosephdesign@gmail.com"
                  className="hover:text-amber-400 transition-colors"
                >
                  yosephdesign@gmail.com
                </a>
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
              <Link
                to="/privacy-policy"
                className="hover:text-amber-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-amber-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
