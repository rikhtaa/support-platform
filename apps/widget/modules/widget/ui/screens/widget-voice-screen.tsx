"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod'
import { useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react"
import { Button } from "@workspace/ui/components/button"
import { WidgetHeader } from "../components/widget-header"
import { ArrowLeftIcon, MenuIcon, MicIcon, MicOffIcon } from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms"
import { useAction, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Form } from "@workspace/ui/components/form"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation"
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input"
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message"
import { AIResponse } from "@workspace/ui/components/ai/response"
import {
  AISuggestion,
  AISuggestions,
} from "@workspace/ui/components/ai/suggestion"
import { FormField } from "@workspace/ui/components/form";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useMemo } from "react";
import { useVapi } from "../../hooks/use-vapi";
import { WidgetFooter } from "../components/widget-footer";
import { cn } from "@workspace/ui/lib/utils";

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

    // const setConversationId = useSetAtom(conversationIdAtom)

    // const widgetSettings = useAtomValue(widgetSettingsAtom)
    // const conversationId = useAtomValue(conversationIdAtom)
    // const organizationId = useAtomValue(organizationIdAtom)
    // const contactSessionId = useAtomValue(
    //   contactSessionIdAtomFamily(organizationId || "")
    // )
    
    // const onBack = () => {
    //   setConversationId(null)
    //   setScreen("selection")
    // }

    // const suggestions = useMemo(() => {
    //   if(!widgetSettings){
    //     return []
    //   }

    //   return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
    //     return widgetSettings.defaultSuggestions[
    //       key as keyof typeof widgetSettings.defaultSuggestions
    //     ]
    //   })
    // }, [widgetSettings])

    // const conversation = useQuery(
    //   api.public.conversations.getOne,
    //   conversationId && contactSessionId
    //   ? {
    //      conversationId,
    //      contactSessionId,
    //     } 
    //   : "skip"
    // )

    // const messages = useThreadMessages(
    //   api.public.messages.getMany,
    //   conversation?.threadId && contactSessionId
    //     ?{
    //       threadId: conversation.threadId,
    //       contactSessionId,
    //     }
    //   : "skip",
    //   { initialNumItems: 10},
    // )

    //  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    //    status: messages.status,
    //    loadMore: messages.loadMore,
    //    loadSize: 10
    //  })

    // const form = useForm<z.infer<typeof formSchema>>({
    //   resolver: zodResolver(formSchema),
    //   defaultValues: {
    //     message: "",
    //   }
    // })

    // const createMessage = useAction(api.public.messagesAction.create)
    // const onSubmit = async (values: z.infer<typeof formSchema>) => {
    //   if(!conversation || !contactSessionId){
    //     return
    //   }

    //   form.reset()

    //   await createMessage({
    //     threadId: conversation.threadId,
    //     prompt: values.message,
    //     contactSessionId,
    //   })
    // }

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
        <AIConversation className="h-full flex-1">
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
        // <>
        // <WidgetHeader className="flex items-center justify-between">
        //     <div className="flex items-center gap-x-2">
        //     <Button
        //       onClick={onBack}
        //       size="icon"
        //       variant="transparent"
        //     >
        //       <ArrowLeftIcon/>
        //     </Button>
        //     <p>Chat</p>
        //     </div>
        //     <Button
        //     size="icon"
        //     variant="transparent"
        //     >
        //       <MenuIcon />
        //     </Button>
        //  </WidgetHeader>
        //  <AIConversation>
        //    <AIConversationContent>
        //     <InfiniteScrollTrigger
        //       canLoadMore={canLoadMore}
        //       isLoadingMore={isLoadingMore}
        //       onLoadMore={handleLoadMore}
        //       ref={topElementRef}
        //     />
        //      {toUIMessages(messages.results ?? [])?.map((message) =>{
        //       return (
        //         <AIMessage
        //          from={message.role === 'user' ? 'user' : 'assistant'}
        //          key={message.id}
        //         >
        //           <AIMessageContent>
        //              <AIResponse> 
        //                {message.parts.filter(part => part.type === "text").map(part => part.text).join("")}
        //              </AIResponse>
        //           </AIMessageContent>
        //             {message.role === "assistant" && (
        //               <DicebearAvatar
        //                 imageUrl="/logo.svg"
        //                 seed="assistant"
        //                 size={32}
        //               />
        //             )}
        //         </AIMessage>
        //       )
        //      })}
        //    </AIConversationContent>
        //  </AIConversation>
        //  {toUIMessages(messages.results ?? [])?.length === 1 && (
        //  <AISuggestions className="flex w-full flex-col items-end p-2">
        //    {suggestions.map((suggestion) => {
        //     if(!suggestion){
        //       return null
        //     }

        //     return (
        //       <AISuggestion
        //         key={suggestion}
        //         onClick={() => {
        //           form.setValue("message", suggestion, {
        //             shouldValidate: true,
        //             shouldDirty: true,
        //             shouldTouch: true
        //           })
        //           form.handleSubmit(onSubmit)()
        //         }}
        //         suggestion={suggestion}
        //       />  
        //     )
        //    })}
        //  </AISuggestions>
        //  )}
        //  <Form {...form}>
        //    <AIInput
        //      className="rounded-none border-x-0 border-b-0"
        //      onSubmit={form.handleSubmit(onSubmit)}
        //    >
        //      <FormField
        //       control={form.control}
        //       disabled={conversation?.status === "resolved"}
        //       name="message"
        //       render={({ field }) => (
        //        <AIInputTextarea
        //        disabled={conversation?.status === "resolved"}
        //        onChange={field.onChange}
        //        onKeyDown={(e) => {
        //         if(e.key === "Enter" && !e.shiftKey){
        //           e.preventDefault()
        //           form.handleSubmit(onSubmit)()
        //         }
        //        }} 
        //        placeholder={
        //          conversation?.status === "resolved"
        //            ? "This conversation has been resolved"
        //            : "Type your message..."
        //        }
        //        value={field.value}
        //        />
        //       )}  
        //       />
        //       <AIInputToolbar>
        //          <AIInputTools/> 
        //           <AIInputSubmit
        //             disabled={conversation?.status === "resolved" || !form.formState.isValid}
        //             status="ready"
        //             type="submit"
        //           />
        //       </AIInputToolbar>
        //    </AIInput>
        //  </Form>
        // </>
    )
}