'use client';

import { useState } from 'react';
import LoginForm from '@/app/components/login/loginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}