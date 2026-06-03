import LoginForm from '@/components/auth/LoginForm';
import AdminRedirect from '@/components/common/AdminRedirect';

export default function LoginPage() {
  return (
    <>
      <AdminRedirect />
      <LoginForm />
    </>
  );
}
