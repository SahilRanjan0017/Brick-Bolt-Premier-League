// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect users from the root path to the dashboard page
  redirect('/dashboard');

  // This return statement is technically unreachable due to the redirect,
  // but it satisfies the requirement for a component to return JSX or null.
  return null;
}