import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Shield,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Cloud,
  MailCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { useAdminAuthStore } from '../../store/adminAuthStore';

interface ServiceStatus {
  mongodb: { connected: boolean };
  cloudinary: { configured: boolean };
  emailVerification: { configured: boolean };
}

const SectionCard = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-amber-600" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className="flex items-center gap-2">
    {ok ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    )}
    <span className={ok ? 'text-emerald-600 text-sm font-medium' : 'text-red-500 text-sm font-medium'}>
      {ok ? 'Active' : 'Not configured'}
    </span>
  </span>
);

export const SettingsManagement: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [services, setServices] = useState<ServiceStatus | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/profile`, { headers });
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email);
        }
      } catch {
        setEmail(user?.email ?? '');
      }
    };

    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/services`, { headers });
        if (res.ok) {
          setServices(await res.json());
        }
      } catch { /* ignore */ }
      setServicesLoading(false);
    };

    fetchProfile();
    fetchServices();
  }, []);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Email updated. Please log in again with your new email.');
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email');
    }
    setEmailLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Password changed successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    }
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile / Email */}
      <SectionCard title="Admin Email" description="Update your admin login email" icon={Mail}>
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <Button type="submit" disabled={emailLoading || !email.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">
            {emailLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Email
          </Button>
          <p className="text-xs text-neutral-400">You will be logged out after updating your email.</p>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password" description="Keep your account secure" icon={Shield}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Change Password
          </Button>
          <p className="text-xs text-neutral-400">You will be logged out after changing your password.</p>
        </form>
      </SectionCard>

      {/* Service Status */}
      <SectionCard title="Connected Services" description="Status of external integrations" icon={Cloud}>
        {servicesLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking services…
          </div>
        ) : services ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium">MongoDB</span>
              </div>
              <StatusDot ok={services.mongodb.connected} />
            </div>
            <div className="h-px bg-neutral-100" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Cloud className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium">Cloudinary</span>
              </div>
              <StatusDot ok={services.cloudinary.configured} />
            </div>
            <div className="h-px bg-neutral-100" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <MailCheck className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium">Email Verification (AbstractAPI)</span>
              </div>
              <StatusDot ok={services.emailVerification.configured} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-400">Could not load service status.</p>
        )}
      </SectionCard>
    </div>
  );
};
