"use client"
import { Protect } from "@clerk/nextjs"
import { VapiView } from "../../../../modules/plugins/ui/views/vapi-view"
import { PremiumFeaturedOverlay } from "@/modules/billing/ui/components/premium-feature-overlay"

const Page = () => {
  return (
   <Protect
      plan="pro"
      // condition={(has) => has({plan: "Pro"})}
      feedback={
      <PremiumFeaturedOverlay>
       <VapiView/>     
      </PremiumFeaturedOverlay>
      }
    >
      <VapiView/>
    </Protect>
}

export default Page