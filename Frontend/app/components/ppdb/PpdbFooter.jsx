import { GraduationCap } from "lucide-react";

export default function PpdbFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              SmartSchool
            </p>

            <p className="text-xs text-slate-500">
              PPDB Online
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} SmartSchool. Semua hak dilindungi.
        </p>

      </div>
    </footer>
  );
}