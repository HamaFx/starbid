export function StarFuelPanel({ starName }: { starName: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8f8c96]">Fuel panel</p>
      <h2 className="mt-3 text-lg">{starName}</h2>
      <p className="mt-3 text-sm leading-6 text-[#8f8c96]">
        Payments are currently disabled. Fuel and the live cost-to-rank
        calculator will return when payment processing is available.
      </p>
    </section>
  );
}
