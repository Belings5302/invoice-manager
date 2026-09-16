import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Receipt, LogIn, UserPlus, Shield, User } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@invoicemanager.com');
      setPassword('admin123');
    } else {
      setEmail('user@invoicemanager.com');
      setPassword('user123');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <ThemeToggle showLabel={false} />
          </div>
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Receipt size={28} color="white" />
            </div>
            <h1>Flow<span>Bill</span></h1>
            <p>Invoice, Partial Payments & Financial Operating System</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marie Uwase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
              Quick Demo Logins:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('admin')}
                style={{ fontSize: '11px', padding: '6px 8px' }}
              >
                <Shield size={12} color="var(--accent-blue)" /> Fill Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('user')}
                style={{ fontSize: '11px', padding: '6px 8px' }}
              >
                <User size={12} color="var(--success)" /> Fill User
              </button>
            </div>
          </div>

          <div className="auth-toggle">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegister(false)}>
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button type="button" onClick={() => setIsRegister(true)}>
                  Create one
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
