import { SignupForm } from '@/components/auth/SignupForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign Up',
  description: 'Create your account to start buying and selling pre-loved Indian ethnic wear',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
