import { PremiumFeaturedOverlay } from "@/modules/billing/ui/components/premium-feature-overlay"
import { FilesView } from "@/modules/files/ui/views/files-view"
import { Protect } from "@clerk/nextjs"

const Page = () => {
  return (
  <Protect
    plan="pro"
    // condition={(has) => has({plan: "Pro"})}
    feedback={
    <PremiumFeaturedOverlay>
      <FilesView/>
      
    </PremiumFeaturedOverlay>
    }
    >
      <FilesView/>
  </Protect>
  )
}

export default Page