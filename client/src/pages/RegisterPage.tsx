import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import PasswordInput from '../components/shared/PasswordInput';
import type { UserRole } from '../types';
import { Store } from 'lucide-react';
import { toast } from 'sonner';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validateForm(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) {
    errors.name = 'Full name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CUSTOMER' as UserRole,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData.name, formData.email, formData.password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-3 border-primary shadow-[8px_8px_0px_0px_var(--primary)] p-8 font-mono">
        <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
          <Store className="text-primary group-hover:rotate-12 transition-transform duration-300" size={28} />
          <span className="text-2xl font-black text-primary uppercase tracking-tighter group-hover:opacity-80 transition-opacity duration-300">
            Urban<span className="text-slate-400">Bistro</span>
          </span>
        </Link>
        <h1 className="text-3xl font-black text-primary uppercase mb-2">Join Us</h1>
        <p className="text-slate-500 mb-8 text-sm">Create your account to start ordering or managing.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-primary uppercase text-xs">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              className={`border-2 p-3 outline-none focus:bg-primary/5 transition-colors ${errors.name ? 'border-red-500' : 'border-primary'}`}
              placeholder="John Doe"
              required
            />
            {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-primary uppercase text-xs">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
              className={`border-2 p-3 outline-none focus:bg-primary/5 transition-colors ${errors.email ? 'border-red-500' : 'border-primary'}`}
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
          </div>

          <PasswordInput value={formData.password} onChange={(v) => { setFormData({ ...formData, password: v }); if (errors.password) setErrors({ ...errors, password: undefined }); }} error={errors.password} />

          <div className="flex flex-col gap-3">
            <label className="font-bold text-primary uppercase text-xs">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              {(['CUSTOMER', 'RESTAURANT_OWNER'] as UserRole[]).map((role) => (
                <label
                  key={role}
                  className={`flex items-center justify-center p-3 border-2 cursor-pointer transition-all font-bold text-xs uppercase ${formData.role === role
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 text-slate-500 hover:border-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="hidden"
                    value={role}
                    checked={formData.role === role}
                    onChange={() => setFormData({ ...formData, role })}
                  />
                  {role === 'CUSTOMER' ? 'Customer' : 'Owner'}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="nb-button bg-primary text-white py-3 uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-primary font-bold underline decoration-2 underline-offset-2">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
