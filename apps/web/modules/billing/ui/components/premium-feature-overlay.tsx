import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { BookOpenIcon, BotIcon, GemIcon, LucideIcon, MicIcon, PaletteIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

interface Feature {
    icon: LucideIcon
    label: string
    description: string
}

interface PremiumFeatureOverlayProps {
    children: React.ReactNode
}

const features: Feature[] = [
    {
        icon: BotIcon,
        label: "AI Customer Support",
        description: "Intelligent automated responses 24/7"
    },
    {
        icon: MicIcon,
        label: "AI Voice Agent",
        description: "Natural Voice conversations with customers"
    },
    {
        icon: PhoneIcon,
        label: "Phone System",
        description: "Inbound and outbound calling capabilities"
    },
    {
        icon: BookOpenIcon,
        label: "Knowledge Base",
        description: "Train AI on your documentation"
    },
    {
        icon: UserIcon,
        label: "Team Access",
        description: "Up to 5 operators per organization"
    },
    {
        icon: PaletteIcon,
        label: "Widget Customization",
        description: "customize your chat widget appearance"
    }
]

export const PremiumFeaturedOverlay = ({
    children
}: PremiumFeatureOverlayProps) => {
    const router = useRouter()
   return (
    <div className="relative min-h-screen">
        {/* Blurred background content*/}
        <div className="pointer-events-none select-none blur-[2px]">
            {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"/>

        {/* Upgrade prompt */}
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4"/>
          <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-center justify-center">
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                       <GemIcon className="size-6 text-muted-foreground"/>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Featured List */}
                <div className="space-y-6">
                  {features.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                           <feature.icon className="size-4 text-muted-foreground"/>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium">{feature.label}</p>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push("/billing")}
                  size="lg"
                >
                  View Plans
                </Button>
            </CardContent>
           </Card>
    </div>
   )
}