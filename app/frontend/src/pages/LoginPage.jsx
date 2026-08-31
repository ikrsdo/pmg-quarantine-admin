import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../api/client';

const ERROR_MESSAGES = {
  invalid_credentials: 'Incorrect username or password.',
  pmg_unreachable: 'Could not reach the PMG server. Please try again later.',
  username_and_password_required: 'Username and password are required.',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(ERROR_MESSAGES[err.body?.error] || 'Login failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-zinc-950"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 35%, rgba(37, 99, 235, 0.08), transparent 60%)',
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Shield className="size-5.5" />
          </span>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            PMG Quarantine Admin
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            Sign in with your own PMG account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@pmg"
              required
              className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-blue-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
            Password
            <span className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 pr-9 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 flex items-center justify-center rounded p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>

          {error && (
            <p className="flex items-start gap-1.5 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
