"use client"

import { useAtomValue } from "jotai"
import { useEffect, type CSSProperties } from "react"
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen"
import { screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms"
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen"
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen"
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen"
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen"
import { WidgetInboxScreen } from "@/modules/widget/ui/screens/widget-inbox-screen"
import { WidgetVoiceScreen } from "../screens/widget-voice-screen"
import { WidgetContactScreen } from "../screens/widget-contact-screen"
import { getReadableForeground } from "@/modules/widget/lib/contrast-color"

interface Props {
    organizationId: string | null
}

export const WidgetView = ({organizationId}: Props) => {
    const screen = useAtomValue(screenAtom)
    const widgetSettings = useAtomValue(widgetSettingsAtom)
    const primaryColor = widgetSettings?.branding?.primaryColor

    const brandStyle = primaryColor
      ? ({
          "--primary": primaryColor,
          "--primary-foreground": getReadableForeground(primaryColor),
        } as CSSProperties)
      : undefined

    useEffect(() => {
      if (typeof window === "undefined" || window.parent === window) {
        return
      }

      window.parent.postMessage(
        { type: "branding", payload: { primaryColor: primaryColor || null } },
        "*"
      )
    }, [primaryColor])

    const screenComponents = {
      loading: <WidgetLoadingScreen organizationId={organizationId} />,
      error: <WidgetErrorScreen/>,
      auth: <WidgetAuthScreen/>,
      voice: <WidgetVoiceScreen/>,
      inbox: <WidgetInboxScreen/>,
      selection: <WidgetSelectionScreen/>,
      chat: <WidgetChatScreen/>,
      contact: <WidgetContactScreen/>,
    }
    return (
        <main className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted"
        style={brandStyle}
        >
            {screenComponents[screen]}
        </main>
    )
}