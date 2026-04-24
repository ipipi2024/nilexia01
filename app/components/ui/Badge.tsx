type ListingType   = "sell" | "donate" | "rent";
type ListingStatus = "available" | "unavailable" | "sold" | "donated" | "rented";

interface BadgeProps {
  type?:      ListingType;
  status?:    ListingStatus;
  count?:     number;
  className?: string;
}

const TYPE_LABELS: Record<ListingType, string> = {
  sell:   "For Sale",
  donate: "Free",
  rent:   "For Rent",
};

const STATUS_LABELS: Record<ListingStatus, string> = {
  available:   "Available",
  unavailable: "Unavailable",
  sold:        "Sold",
  donated:     "Donated",
  rented:      "Rented",
};

export default function Badge({ type, status, count, className = "" }: BadgeProps) {
  if (count !== undefined) {
    return (
      <span className={`badge badge-count ${className}`}>
        {count > 99 ? "99+" : count}
      </span>
    );
  }
  if (type) {
    return (
      <span className={`badge badge-${type} ${className}`}>
        {TYPE_LABELS[type]}
      </span>
    );
  }
  if (status) {
    return (
      <span className={`badge badge-${status} ${className}`}>
        {STATUS_LABELS[status]}
      </span>
    );
  }
  return null;
}
