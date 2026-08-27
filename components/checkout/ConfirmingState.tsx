export function ConfirmingState({ timedOut = false, failed = false, onRefresh }: { timedOut?: boolean; failed?: boolean; onRefresh?: () => void }) {
  const title = failed ? "Payment needs attention" : timedOut ? "Still confirming" : "Confirming payment";
  const message = failed ? "This checkout did not become a live bid. You can return and try again." : timedOut ? "Payment is taking longer than usual. You can safely close this page; the galaxy updates after webhook confirmation." : "Payment received — rank updates only after confirmation.";
  return <section aria-live="polite" className="rounded-xl border border-white/10 bg-[#0a0a14] p-5"><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffb627]">{title}</p><p className="mt-3 text-sm leading-6 text-[#8f8c96]">{message}</p>{onRefresh && !failed && <button type="button" onClick={onRefresh} className="mt-4 font-mono text-xs text-[#4cc9f0]">Refresh status</button>}</section>;
}
