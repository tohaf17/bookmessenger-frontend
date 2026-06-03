import RegisterForm from '@/components/auth/RegisterForm';
import AdminRedirect from '@/components/common/AdminRedirect';

export default function RegisterPage() {
  return (
    <>
      <AdminRedirect />
      <RegisterForm />
    </>
  );
}
