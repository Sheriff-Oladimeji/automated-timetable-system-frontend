import { LoginForm } from '@/components/auth/login-form'

export default function LecturerLoginPage() {
  return (
    <LoginForm
      title="Lecturer Sign In"
      description="Sign in to view your schedule and manage availability"
      switchLink={{ label: 'Not a lecturer?', href: '/login/student', text: 'Sign in as Student' }}
    />
  )
}
