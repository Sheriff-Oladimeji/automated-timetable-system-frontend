import { LoginForm } from '@/components/auth/login-form'

export default function StudentLoginPage() {
  return (
    <LoginForm
      title="Student Sign In"
      description="Sign in to view your class timetable"
      registerLink={{ href: '/register', text: 'Register with your matric number' }}
      switchLink={{ label: 'Not a student?', href: '/login/lecturer', text: 'Sign in as Lecturer' }}
    />
  )
}
