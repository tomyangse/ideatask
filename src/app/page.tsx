'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './landing.module.css';

// Generate random stars for background decoration
function generateStars(count: number) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: `${1 + Math.random() * 2}px`,
    });
  }
  return stars;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{id: number, left: string, top: string, delay: string, size: string}[]>([]);

  useEffect(() => {
    setStars(generateStars(80));
    setMounted(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("Supabase not configured, bypassing login for preview");
      router.push('/cosmos');
      return;
    }

    const supabase = createClient();
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/cosmos');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMsg(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background glow */}
      <div className={styles.bgGlow} />

      {/* Background stars */}
      {mounted && (
        <div className={styles.stars}>
          {stars.map((star) => (
            <div
              key={star.id}
              className={styles.star}
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                width: star.size,
                height: star.size,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.logo}>🧠</div>

        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Exobrain</h1>
          <p className={styles.subtitle}>
            Your thoughts are a <span className={styles.highlight}>universe</span>.
            <br />
            Navigate them in 3D. Let AI connect the constellations.
          </p>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.authTabs}>
            <button 
              className={`${styles.tab} ${!isSignUp ? styles.activeTab : ''}`}
              onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button 
              className={`${styles.tab} ${isSignUp ? styles.activeTab : ''}`}
              onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Sign Up
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {errorMsg && <div className={styles.error}>{errorMsg}</div>}
            {successMsg && <div className={styles.success}>{successMsg}</div>}
            
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={isLoading || !email || !password} className={styles.cta}>
              <span>{isLoading ? '...' : '✦'}</span>
              <span>{isLoading ? 'Connecting...' : (isSignUp ? 'Create Universe' : 'Enter the Cosmos')}</span>
            </button>
          </form>
        </div>

        <div className={styles.features}>
          <span className={styles.feature}>💡 Zero-friction capture</span>
          <span className={styles.feature}>🌌 3D spatial canvas</span>
          <span className={styles.feature}>🤖 AI auto-structuring</span>
          <span className={styles.feature}>🚀 Idea → Project evolution</span>
        </div>
      </div>
    </div>
  );
}
