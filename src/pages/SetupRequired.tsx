import React from 'react';
import { Database } from 'lucide-react';

export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
          <Database size={22} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-display mb-1">Connect Supabase to continue</h1>
        <p className="text-sm text-slate-500 mb-5">
          This app needs a Supabase project for accounts and data. It isn't connected yet.
        </p>
        <ol className="space-y-3 text-sm text-slate-700 mb-6">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
            Create a free project at <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded ml-1">supabase.com</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
            Run <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1">supabase/schema.sql</span> in its SQL Editor
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
            Copy <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1">.env.example</span> to
            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1">.env</span> and fill in your Project URL and anon key from Project Settings → API
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
            Create your first accounts under Authentication → Users (see the comment block near the bottom of schema.sql for the exact metadata format)
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">5</span>
            Restart the dev server so the new environment variables load
          </li>
        </ol>
        <p className="text-xs text-slate-400">
          Once connected, this screen won't appear again — you'll land on the sign-in page.
        </p>
      </div>
    </div>
  );
}
