import { CustomizationView } from "@/modules/customization/ui/views/customization-view"
import { PremiumFeaturedOverlay } from "./premium-feature-overlay"
import { Protect } from "@clerk/nextjs"
const Page = () => {
  return (
    <Protect
        plan="pro"
        // condition={(has) => has({plan: "Pro"})}
        feedback={
        <PremiumFeaturedOverlay>
          <CustomizationView/>
          
        </PremiumFeaturedOverlay>
        }
        >
          <CustomizationView/>
      </Protect>
  )
}

export default Page