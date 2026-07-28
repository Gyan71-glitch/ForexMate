"use client";
import { useState, useEffect } from 'react';
import API_URL, { authFetch } from '@/lib/api';

interface Session {
  id: string;
  createdAt: string;
  lastActivity: string;
  ip: string;
  country: string;
  city: string;
  browser: string;
  os: string;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/auth/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.data || []);
      } else {
        throw new Error('Failed to load session history.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await authFetch(`${API_URL}/auth/sessions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Could not revoke session.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm">
        Retrieving active device sessions...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h3 className="text-lg font-bold text-white">Active Device Sessions</h3>
        <p className="text-slate-400 text-xs mt-1">Review and revoke active browser sessions across your devices.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No active sessions found.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl gap-4 hover:border-slate-700/50 transition-all"
            >
              <div className="flex items-start space-x-3">
                {/* Device Icon */}
                <div className="w-10 h-10 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-lg flex items-center justify-center text-lg">
                  {session.os === 'iOS' || session.os === 'Android' ? '📱' : '💻'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-sm">
                      {session.browser} on {session.os}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1 space-y-0.5">
                    <p>IP: <strong className="text-slate-300">{session.ip}</strong> ({session.city}, {session.country})</p>
                    <p>Opened: {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Last Active: {new Date(session.lastActivity).toLocaleDateString()} at {new Date(session.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRevoke(session.id)}
                className="self-start sm:self-center px-4 py-2 bg-red-950/50 hover:bg-red-900 border border-red-800/50 hover:border-red-700 text-red-400 font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
              >
                Revoke Access
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
