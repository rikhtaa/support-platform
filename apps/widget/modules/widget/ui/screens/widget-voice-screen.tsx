"use client";

import { z } from 'zod'
import { Button } from "@workspace/ui/components/button"
import { WidgetHeader } from "../components/widget-header"
import { ArrowLeftIcon, MicIcon, MicOffIcon } from "lucide-react"
import { useSetAtom } from "jotai"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation"
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message"
import { useVapi } from "../../hooks/use-vapi";
import { WidgetFooter } from "../components/widget-footer";
import { cn } from "@workspace/ui/lib/utils";
import { screenAtom } from '../../atoms/widget-atoms';

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
})

export const WidgetVoiceScreen = () => {
    const setScreen = useSetAtom(screenAtom)
    const {
      isConnected,
      isSpeaking,
      transcript,
      startCall,
      endCall,
      isConnecting
    } = useVapi()

    return (
      <>
        <WidgetHeader>
           <div className="flex items-center gap-x-2">
              <Button
                 variant="transparent"
                 size="icon"
                 onClick={() => setScreen("selection")}
               >
                <ArrowLeftIcon/>
              </Button>
              <p>Voice Chat</p>
            </div>
        </WidgetHeader>
        {transcript.length > 0 ? (
        <AIConversation className="h-full">
          <AIConversationContent>
            {transcript.map((message, index) => (
              <AIMessage
                from={message.role}
                key={`${message.role}-${index}-${message.text}`}
              >
                <AIMessageContent>
                  {message.text}
                </AIMessageContent>
              </AIMessage>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton/>
        </AIConversation>
        ) : (
        <div className="flex flex-1 h-full flex-col items-center justify-center gap-y-4">
          <div className="flex items-center rounded-full border bg-white p-3">
            <MicIcon className="size-6 text-muted-foreground"/>
          </div>
          <p className="text-muted-foreground">Transscript will appear here</p>
        </div>
        )}
        <div className="border-t bg-background p-4">
          <div className="flex flex-col items-center gap-y-4">
            {isConnected && (
            <div className="flex items-center gap-y-2">
              <div className={cn(
                "size-4 rounded-full",
                 isSpeaking ? "animate-pulse bg-red-500" : "bg-green-500"
              )}/>
                <span className="text-muted-foreground text-sm">
                  {isSpeaking ? "Assistant Speaking..." : "Listening..."}
                </span>
            </div>
            )}
            <div className="flex w-full justify-center">
              {isConnected ? (
                <Button
                  className="w-full"
                  size="lg"
                  variant="destructive"
                  onClick={() => endCall()}
                >
                  <MicOffIcon/>
                  End call
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={isConnecting}
                  size="lg"
                  onClick={() => startCall()}
                >
                  <MicIcon/>
                  Start call
                </Button>
              )

              }
            </div>
          </div>
        </div>
        <WidgetFooter/>
      </>
    )
}