import { AuthShell } from "@/components/auth-shell";
import { LoginBoard } from "@/app/login/login-board";

export default function LoginPage() {
  return (
    <AuthShell
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión para crear y gestionar tus cotizaciones de sistemas fotovoltaicos."
    >
      <LoginBoard />
    </AuthShell>
  );
}
