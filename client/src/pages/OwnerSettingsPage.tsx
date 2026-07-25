import { useThemeStore, type ThemeColor } from '../store/themeStore';

const OwnerSettingsPage = () => {
  const { color, setColor } = useThemeStore();

  const colors: { label: string; value: ThemeColor; bg: string }[] = [
    { label: 'Slate', value: 'slate', bg: 'bg-slate-900' },
    { label: 'Green', value: 'green', bg: 'bg-green-600' },
    { label: 'Orange', value: 'orange', bg: 'bg-orange-600' },
    { label: 'Purple', value: 'purple', bg: 'bg-purple-600' },
    { label: 'Blue', value: 'blue', bg: 'bg-blue-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-mono">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-primary uppercase mb-2">Brand Settings</h1>
        <p className="text-slate-500">Customize the visual identity of your bistro.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary uppercase mb-4">Color Palette</h2>
          <div className="grid grid-cols-1 gap-3">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`flex items-center justify-between p-4 border-3 transition-all ${color === c.value
                    ? 'border-primary bg-primary text-white shadow-[4px_4px_0px_0px_var(--primary)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${c.bg} border-2 border-white`} />
                  <span className="font-black uppercase">{c.label}</span>
                </div>
                {color === c.value && (
                  <span className="text-[10px] font-black uppercase bg-white text-primary px-2 py-1">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-3 border-primary nb-shadow p-6">
          <h2 className="text-xl font-bold text-primary uppercase mb-4">Preview</h2>
          <div className="space-y-4">
            <div className="h-12 bg-primary/10 border-2 border-primary rounded flex items-center px-4 font-black text-primary text-sm uppercase">
              Sample Button
            </div>
            <div className="p-4 border-2 border-primary bg-primary/5 text-primary text-xs font-bold uppercase">
              This is how your brand colors will look across the application.
            </div>
            <div className="flex gap-2">
              <div className="w-full h-4 bg-primary" />
              <div className="w-full h-4 bg-primary/50" />
              <div className="w-full h-4 bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettingsPage;
