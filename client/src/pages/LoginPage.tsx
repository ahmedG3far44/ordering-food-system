import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/auth';
import PasswordInput from '../components/shared/PasswordInput';
import { Store } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '../hooks/usePageMeta';

interface FormErrors {
  email?: string;
  password?: string;
}

function validateForm(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}

const LoginPage = () => {
  usePageMeta({
    title: 'Login - Urban Bistro',
    description: 'Sign in to your Urban Bistro account to order food online or manage your restaurant. Access your orders, track deliveries, and update your profile.',
    keywords: 'login, sign in, food ordering account, restaurant owner login, customer login',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'RESTAURANT_OWNER' ? '/owner/dashboard' : '/restaurants', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.token);

      if (data.user.role === 'RESTAURANT_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/restaurants');
      }
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        toast.error(err?.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-3 border-primary shadow-[8px_8px_0px_0px_var(--primary)] p-8 font-mono">
        <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
          <Store className="text-primary group-hover:rotate-12 transition-transform duration-300" size={28} />
          <span className="text-2xl font-black text-primary uppercase tracking-tighter group-hover:opacity-80 transition-opacity duration-300">
            Urban<span className="text-slate-400">Bistro</span>
          </span>
        </Link>
        <h1 className="text-3xl font-black text-primary uppercase mb-2">Login</h1>
        <p className="text-slate-500 mb-8 text-sm">Enter your credentials to enter the bistro.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-primary uppercase text-xs">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
              className={`border-2 p-3 outline-none focus:bg-primary/5 transition-colors ${errors.email ? 'border-red-500' : 'border-primary'}`}
              placeholder="chef@bistro.com"
              required
            />
            {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
          </div>

          <PasswordInput value={password} onChange={(v) => { setPassword(v); if (errors.password) setErrors({ ...errors, password: undefined }); }} error={errors.password} />

          <button
            type="submit"
            disabled={isLoading}
            className="nb-button bg-primary text-white py-3 uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Enter Now'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="text-primary font-bold underline decoration-2 underline-offset-2">Register here</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
