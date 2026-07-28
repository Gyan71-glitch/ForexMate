"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';

export default function ChangePasswordPage() {
  const { employee, login, token } = useWorkforceAuth();
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await workforceFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await workforceJson(res);
      setSuccess(true);
      // Update employee state to remove mustChangePassword flag
      if (employee && token) {
        const updated = { ...employee, mustChangePassword: false };
        login(token, updated);
        setTimeout(() => {
          if (employee.role === 'BRANCH_CASHIER') router.replace('/workforce/cashier');
          else router.replace('/workforce/delivery');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Password change failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconWrap}>🔐</div>
        <h1 style={styles.title}>Set Your Password</h1>
        <p style={styles.subtitle}>
          {employee?.mustChangePassword
            ? 'Your account requires a password change before continuing.'
            : 'Update your account password.'}
        </p>
      </div>

      <div style={styles.card}>
        {success ? (
          <div style={styles.successBox}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#065f46', margin: '0 0 4px' }}>Password Updated!</p>
            <p style={{ fontSize: 13, color: '#047857', margin: 0 }}>Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBox}>⚠️ {error}</div>
            )}

            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input
                  type="password"
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  required
                  style={styles.input}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Changing Password...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>

      <div style={styles.securityNote}>
        <span>🔒</span>
        <span>Your password is encrypted and stored securely</span>
      </div>

      <style>{`
        input:focus { outline: none; border-color: #4338CA !important; box-shadow: 0 0 0 3px rgba(67,56,202,0.12); }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100dvh', background: '#f8fafc', display: 'flex', flexDirection: 'column', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: 28 },
  iconWrap: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px' },
  subtitle: { fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: 0 },
  card: { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit', fontWeight: 500, background: '#f9fafb', width: '100%', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  btn: { background: 'linear-gradient(135deg, #4338CA, #6366f1)', color: 'white', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#991b1b', fontWeight: 500 },
  successBox: { textAlign: 'center', padding: '20px 0' },
  securityNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: '#9ca3af', fontSize: 12, fontWeight: 500 },
};
