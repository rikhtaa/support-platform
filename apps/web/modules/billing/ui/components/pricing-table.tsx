"use client"
import { PricingTable as ClerkPricingTable } from "@clerk/nextjs"

export const PricingTable = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-4">
            <ClerkPricingTable
               for="organization"
               appearance={{
                elements: {
                    pricingTableCard: "shadow-none! border! rounded-lg!",
                    PricingTableCardHeader: "bg-background!",
                    PricingTableCardBody: "bg-background!",
                    PricingTableCardFooter: "bg-background!",
                }
               }}
            />
        </div>
    )
}