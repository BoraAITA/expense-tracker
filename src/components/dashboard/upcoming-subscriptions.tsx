"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SubscriptionItem } from "@/types";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SubscriptionLogo } from "@/components/shared/subscription-logo";

interface UpcomingSubscriptionsProps {
  subscriptions: SubscriptionItem[];
}

export function UpcomingSubscriptions({
  subscriptions,
}: UpcomingSubscriptionsProps) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Aktif Abonelikler</CardTitle>
        <Button variant="ghost" size="sm" className="min-h-10" asChild>
          <Link href="/subscriptions">
            Tümünü gör <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <EmptyState
            title="Abonelik yok"
            description="Tekrarlayan ödemelerinizi ekleyin."
          />
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <SubscriptionLogo name={sub.name} logoUrl={sub.logoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sub.nextDueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(sub.amount, sub.currency)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {sub.interval === "MONTHLY"
                      ? "Aylık"
                      : sub.interval === "YEARLY"
                        ? "Yıllık"
                        : "Haftalık"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
