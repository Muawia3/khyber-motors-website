import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@jacmotors.pk');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 selection:bg-[#C8102E] selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-[#C8102E] text-white font-extrabold text-xl mb-2">
            JAC
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
            Dealership Admin CMS
          </h1>
          <p className="text-xs text-gray-400">
            Secure Administrator Authentication &amp; Management System
          </p>
        </div>

        <Card className="p-8 bg-gray-900 border border-gray-800 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 text-xs font-semibold rounded-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Admin Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jacmotors.pk"
                leftIcon={<Mail className="w-4 h-4 text-gray-500" />}
                className="bg-gray-800 border-gray-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-gray-500" />}
                className="bg-gray-800 border-gray-700 text-white text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="uppercase font-bold tracking-wider"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Admin CMS'}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-gray-800 text-center text-[11px] text-gray-500 space-y-1">
            <p>Default Super Admin: <code className="text-gray-300">admin@jacmotors.pk</code></p>
            <p>Password: <code className="text-gray-300">Admin@123456</code></p>
          </div>
        </Card>
      </div>
    </div>
  );
};
