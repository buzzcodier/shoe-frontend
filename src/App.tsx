import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./features/auth/AuthContext";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <h1>Shoe Manager is working!</h1>
      </AuthProvider>
    </QueryClientProvider>
  );
}