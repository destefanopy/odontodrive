import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M15.5 3c-1.3 0-2.5.6-3.5 1.6-1-1-2.2-1.6-3.5-1.6C5.5 3 3 5.5 3 8.5c0 4 3 6 3.5 10 .3 1.5 1.5 2.5 3 2.5 1.5 0 2.5-.8 3-2l1-2.5 1 2.5c.5 1.2 1.5 2 3 2 1.5 0 2.7-1 3-2.5.5-4 3.5-6 3.5-10C24 5.5 21.5 3 18.5 3Z" />
            </svg>
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">Odonto<span className="text-cyan-600">Drive</span></span>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
