import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMySubscription } from "./voucherApi";
import type { SubscriptionInfo } from "../types/domain";
import "./SubscriptionStatusBadge.css";

export function SubscriptionStatusBadge() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null | undefined>(undefined);

  useEffect(() => {
    fetchMySubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, []);

  if (subscription === undefined) return null;

  const isPremium = subscription?.plan === "premium" && subscription.status === "active";

  return (
    <div className={`subscription-badge ${isPremium ? "subscription-badge-premium" : ""}`}>
      <div>
        <span className="subscription-plan">{isPremium ? "Premium plan" : "Free plan"}</span>
        {isPremium && subscription?.expiresAt && (
          <span className="subscription-expiry">
            Renews/expires {new Date(subscription.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {!isPremium && (
        <Link to="/redeem" className="subscription-upgrade-link">
          Redeem a voucher
        </Link>
      )}
    </div>
  );
}
