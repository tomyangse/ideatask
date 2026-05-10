'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UserProfile() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only attempt to use Supabase if configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setUserEmail("Guest Preview");
      return;
    }

    const supabase = createClient();
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email ?? null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/');
    router.refresh();
  };

  if (!userEmail) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
      }}>
        {userEmail[0].toUpperCase()}
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
      }}>
        {userEmail}
      </span>
      <button
        onClick={handleSignOut}
        style={{
          marginLeft: '8px',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#EF4444',
          background: 'rgba(239, 68, 68, 0.1)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
