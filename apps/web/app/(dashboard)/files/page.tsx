import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay"
import { FilesView } from "@/modules/files/ui/views/files-view"
import { auth } from "@clerk/nextjs/server"

const Page = async () => {
  const { has } = await auth()

  const isPro = has({plan: "pro"})
  if(!isPro) {
  return (
        <PremiumFeatureOverlay>
          <FilesView/>
        </PremiumFeatureOverlay>
  )
 }
  return <FilesView/>
}

export default Page