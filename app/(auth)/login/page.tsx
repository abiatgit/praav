import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Log In',
  description: 'Log in to your account to continue',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
