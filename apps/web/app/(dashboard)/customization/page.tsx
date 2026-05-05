import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay"
import { CustomizationView } from "@/modules/customization/ui/views/customization-view"
import { auth } from "@clerk/nextjs/server"

const Page = async () => {
  const { has } = await auth()

  const isPro = has({plan: "pro"})
  if(!isPro) {
  return (
        <PremiumFeatureOverlay>
          <CustomizationView/>
        </PremiumFeatureOverlay>
  )
 }
  return <CustomizationView/>
}

export default Page