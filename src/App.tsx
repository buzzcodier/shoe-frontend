import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>Shoe Manager is working!</h1>
    </QueryClientProvider>
  );
}