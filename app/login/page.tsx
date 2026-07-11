'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else router.push('/');
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <LogIn className="text-primary" /> تسجيل الدخول
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4 text-center">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-primary font-bold">
            إنشاء حساب
          </Link>
        </p>

        <p className="text-[11px] text-amber-500/80 mt-6 border-t border-slate-800 pt-4">
          ⚠️ وضع تطوير مؤقت: هذا النموذج لا يتحقق من كلمة مرور حقيقية بعد. سيتم استبداله بمصادقة Appwrite الحقيقية في المرحلة الأخيرة.
        </p>
      </div>
    </div>
  );
}
