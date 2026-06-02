"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { SubscriptionItem } from "@/types";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  function fetchSubscriptions() {
    setLoading(true);
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <>
      <Header
        title="Abonelikler"
        description="Tekrarlayan ödemelerinizi takip edin"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Abonelik
          </Button>
        }
      />
      <div className="p-4 sm:p-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <SubscriptionTable
            subscriptions={subscriptions}
            onChanged={fetchSubscriptions}
          />
        )}
      </div>
      <SubscriptionForm
        open={showCreate}
        onOpenChange={setShowCreate}
        onSaved={fetchSubscriptions}
      />
    </>
  );
}
