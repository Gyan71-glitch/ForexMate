"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth, WORKFORCE_API_URL } from '@/context/WorkforceAuthContext';
import { setWorkforceToken } from '@/lib/workforceApi';

export default function WorkforceLoginPage() {
  const { login, employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If employee is already authenticated, redirect them to their dashboard
  useEffect(() => {
    if (!authLoading && employee) {
      if (employee.mustChangePassword) {
        window.location.href = '/workforce/change-password';
      } else if (employee.role === 'BRANCH_MANAGER') {
        window.location.href = '/manager/dashboard';
      } else if (employee.role === 'BRANCH_CASHIER') {
        window.location.href = '/workforce/cashier';
      } else if (employee.role === 'DELIVERY_PARTNER') {
        window.location.href = '/workforce/delivery';
      }
    }
  }, [employee, authLoading]);

  // Show loading spinner while auth is being resolved
  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1e1b4b 0%, #4338CA 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, opacity: 0.8 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${WORKFORCE_API_URL}/workforce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode: employeeCode.trim().toUpperCase(), password }),
      });
      const json = await res.json();
      const data = json.data ?? json;
      if (!res.ok) throw new Error(data.message || 'Login failed');

      const { access_token, employee } = data;
      setWorkforceToken(access_token);
      login(access_token, employee);

      localStorage.setItem('forexmate_token', access_token);
      sessionStorage.setItem('forexmate_token', access_token);
      sessionStorage.setItem('forexmate_user', JSON.stringify({
        id: employee.id,
        email: employee.email || `${employee.employeeCode.toLowerCase()}@forexmate.local`,
        fullName: employee.name,
        role: employee.role,
      }));

      if (employee.mustChangePassword) {
        window.location.href = '/workforce/change-password';
      } else if (employee.role === 'BRANCH_MANAGER') {
        window.location.href = '/manager/dashboard';
      } else if (employee.role === 'BRANCH_CASHIER') {
        window.location.href = '/workforce/cashier';
      } else if (employee.role === 'DELIVERY_PARTNER') {
        window.location.href = '/workforce/delivery';
      } else {
        window.location.href = '/manager/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoWrapper}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 style={styles.appName}>Forexmate</h1>
        <p style={styles.appSubtitle}>Workforce Portal</p>
      </div>

      {/* Login Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Employee Login</h2>
        <p style={styles.cardSubtitle}>Enter your credentials to access your workspace</p>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Employee ID</label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="e.g. EMP-000001"
              required
              autoCapitalize="characters"
              style={styles.input}
            />
            <p style={styles.hint}>Enter your Employee ID provided by your branch manager</p>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ ...styles.input, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={styles.spinner} /> Signing in...
              </span>
            ) : 'Login to Workspace'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>🔒 Secured • Operational Staff Only</p>
        <p style={styles.footerText}>Having trouble? Contact your branch manager.</p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
        input:focus { outline: none; border-color: #4338CA !important; box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.12); }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100dvh', background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 30%, #4338CA 70%, #6366f1 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px 32px' },
  header: { textAlign: 'center', marginBottom: 32 },
  logoWrapper: { width: 64, height: 64, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.2)' },
  appName: { color: 'white', fontSize: 28, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' },
  appSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, fontWeight: 500 },
  card: { background: 'white', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  cardTitle: { fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' },
  cardSubtitle: { fontSize: 13, color: '#6b7280', margin: '0 0 24px', fontWeight: 500 },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#991b1b', fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit', fontWeight: 600, transition: 'border-color 0.2s, box-shadow 0.2s', background: '#f9fafb', width: '100%', boxSizing: 'border-box' as const },
  hint: { fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 500 },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 },
  loginBtn: { background: 'linear-gradient(135deg, #4338CA, #6366f1)', color: 'white', border: 'none', borderRadius: 14, padding: '15px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s, transform 0.1s', letterSpacing: '-0.2px', marginTop: 4 },
  spinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' },
  footer: { textAlign: 'center', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 6 },
  footerText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, fontWeight: 500 },
};
