import { useState, useCallback } from "react";
import Container from "components/Container";
import { Header } from "components/Header";
import { Signup } from './Signup';
import { Login } from './Login';
import { AuthProps } from "./types";

export function Auth({
  fullPage = false,
  onController,
  onCancel,
}: AuthProps) {
  const [page, setPage] = useState<"login" | "signup">("login");
  
  const onLogin = useCallback(() => {
    setPage("login");
  }, []);
  
  const onSignup = useCallback(() => {
    setPage("signup");
  }, []);

  return (
    <Container position={fullPage ? "relative" : "fixed"} padding={4} alignItems="stretch">
      <Header onClose={onCancel} />

      {page === "login" ? (
        <Login
          onSignup={onSignup}
          onController={onController}
        />
      ) : (
        <Signup
          onLogin={onLogin}
          onController={onController}
        />
      )}
    </Container>
  );
}
