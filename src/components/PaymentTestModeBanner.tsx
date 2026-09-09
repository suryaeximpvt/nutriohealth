const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-center text-xs text-destructive">
        Payments are not live yet. Finish the go-live steps to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-nutrio-amber/15 border-b border-nutrio-amber/40 px-4 py-2 text-center text-xs text-foreground">
        Test mode — payments here are not real.{" "}
        <a
          href="https://docs.lovable.dev/features/payments#test-and-live-environments"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          Read more
        </a>
      </div>
    );
  }
  return null;
}
