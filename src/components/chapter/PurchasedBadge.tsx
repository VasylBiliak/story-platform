export function PurchasedBadge() {
  return (
    <span
      className="text-sm font-semibold inline-block"
      style={{
        background: "linear-gradient(90deg, #ffd700, #fff4b0, #ffcf40, #fff4b0, #ffd700)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "shimmer 3s linear infinite",
      }}
      aria-label="Purchased chapter"
    >
      Purchased
    </span>
  );
}
