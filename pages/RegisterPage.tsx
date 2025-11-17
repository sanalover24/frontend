import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { GoogleIcon } from '../components/icons';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("Passwords don't match!", 'error');
      return;
    }
    // In a real app, you'd register the user here
    console.log({ name, email, password });
    addToast('Registration successful! Please log in.', 'success');
    navigate('/login');
  };
  
  const inputClasses = "w-full px-4 py-3 rounded-lg bg-slate-100/80 dark:bg-zinc-800/50 border border-slate-300/50 dark:border-transparent text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
         <h1 className="text-3xl font-bold text-center mb-6 text-zinc-800 dark:text-slate-50 tracking-wider">
          MYMONEY.
        </h1>
        <Card className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-slate-50">Create an Account</h2>
           <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">Start tracking your finances today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                required
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full !py-3">
              Create Account
            </Button>
          </form>

           <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="bg-white/60 dark:bg-black/30 px-2 text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">OR</span>
              </div>
          </div>

          <div>
              <Button variant="secondary" className="w-full !py-3 flex items-center justify-center">
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  Sign up with Google
              </Button>
          </div>

          <p className="text-center mt-6 text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;