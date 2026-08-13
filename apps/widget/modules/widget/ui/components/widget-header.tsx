"use client"

import { useAtomValue } from "jotai"
import { cn } from "@workspace/ui/lib/utils"
import { widgetSettingsAtom } from "../../atoms/widget-atoms"

export const WidgetHeader = ({
    children,
    className
}: {
   children: React.ReactNode,
    className?: string,
}) => {
    const widgetSettings = useAtomValue(widgetSettingsAtom)
    const logoUrl = widgetSettings?.branding?.logoUrl
    const chatbotName = widgetSettings?.chatbotName

    return (
        <header className={cn(
            "relative bg-primary p-4 text-primary-foreground",
            className
        )}
        >
          {logoUrl && (
            <img
                src={logoUrl}
                alt={chatbotName ? `${chatbotName} logo` : "Logo"}
                className="absolute top-3 right-3 size-8 rounded-full border border-white/40 bg-white object-contain p-0.5"
            />
         )}
         {children}
        </header>
    )  
}
