import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
}

const PasswordInput = ({ value, onChange, placeholder = '••••••••', required, label = 'Password', error }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary uppercase text-xs">{label}</label>
      <div className={`flex border-2 bg-white ${error ? 'border-red-500' : 'border-primary'}`}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 outline-none focus:bg-primary/5 transition-colors"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 flex items-center justify-center border-l-2 border-primary text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
};

export default PasswordInput;
