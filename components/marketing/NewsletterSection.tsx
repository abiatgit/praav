'use client';

import { useState } from 'react';
import { Container } from '@/components/shared/Container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // For now, just show success (will integrate with Supabase later)
    setStatus('success');
    setMessage('Thank you! You\'ve been added to the waitlist.');
    setEmail('');

    // TODO: Save to Supabase when ready
    // const supabase = createClient();
    // await supabase.from('newsletter').insert({ email });
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-4">
            BE FIRST TO DISCOVER THE MARKETPLACE
          </h2>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Join our waitlist to get early access when we launch
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-none h-12 border-gray-300 focus:border-black"
              disabled={status === 'success'}
            />
            <Button
              type="submit"
              className="rounded-none h-12 px-6 text-xs tracking-wider bg-black hover:bg-gray-800 text-white"
              disabled={status === 'success'}
            >
              JOIN WAITLIST
            </Button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-sm text-black font-medium">{message}</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm text-red-600">{message}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
