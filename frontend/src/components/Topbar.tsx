import { Upload, UserCircle2, LogOut, Sun, MoonStar } from 'lucide-react';
import UploadButton from './UploadButton';
import { useTheme } from '../hooks/useTheme';

export default function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-bold">I</div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">IntelliDoc</h1>
        </div>

        <div className="flex items-center gap-3">
          <UploadButton />
          <button
            className="p-2 rounded-lg border border-black/10 dark:border-white/10"
            title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18}/> : <MoonStar size={18}/>}
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-black/10 dark:border-white/10">
            <UserCircle2 className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Welcome, Sidhant</span>
            <button className="text-sm text-red-600 inline-flex items-center gap-1">
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}