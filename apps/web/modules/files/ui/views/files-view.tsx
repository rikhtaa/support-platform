"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow 
} from "@workspace/ui/components/table"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import {  useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react"
import type { PublicFile } from "@workspace/backend/private/files"
import { api } from "@workspace/backend/_generated/api"
import { FileIcon, MoreHorizontalIcon, PlusIcon, RefreshCwIcon, TrashIcon, XIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { UploadDialog } from "../components/upload-dialog"
import { useState } from "react"
import { DeleteFileDialog } from "../components/delete-file-dialog"
import { toast } from "sonner"

export const FilesView = () => {
    const files = usePaginatedQuery(
        api.private.files.list,
        {},
        {
            initialNumItems: 10,
        }
    )

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingFirstPage, isLoadingMore } = useInfiniteScroll({
     status: files.status,
     loadMore: files.loadMore,
     loadSize: 10
    })


    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isStartingSync, setIsStartingSync] = useState(false)

 const startSync = useAction(api.private.docsSync.startSync)
 const cancelSync = useMutation(api.private.docsSync.cancelSync)
 const syncRun = useQuery(api.private.docsSync.getLatestRun)

 const isSyncRunning = syncRun?.status === "running"
 const syncProgress =
     syncRun && syncRun.files.length > 0
         ? Math.round((syncRun.cursor / syncRun.files.length) * 100)
         : 0

 const handleStartSync = async () => {
     setIsStartingSync(true)
     try {
         const result = await startSync({})
         if (result.alreadyRunning) {
             toast.info("A sync is already in progress")
         } else {
             toast.success("Docs sync started")
         }
     } catch (error) {
         console.error(error)
         toast.error(
             error instanceof Error ? error.message : "Failed to start docs sync"
         )
     } finally {
         setIsStartingSync(false)
     }
 }

 const handleCancelSync = async () => {
     if (!syncRun) return
     try {
         await cancelSync({ runId: syncRun._id })
         toast.info("Docs sync cancelled")
     } catch (error) {
         console.error(error)
         toast.error("Failed to cancel sync")
     }
 }
    const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null)
    const handleDeleteClick = (file: PublicFile) => {
        setSelectedFile(file)
        setDeleteDialogOpen(true)
    }

    const handleFileDeleted = () => {
        setSelectedFile(null)
    }

    return (
        <>
        <DeleteFileDialog
           onOpenChange={setDeleteDialogOpen}
           open={deleteDialogOpen}
           file={selectedFile}
           onDeleted={handleFileDeleted}
        />
        <UploadDialog
          onOpenChange={setUploadDialogOpen}
          open={uploadDialogOpen}
        />
        <div className="flex min-h-screen flex-col bg-muted p-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="space-y-2"> 
                <h1 className="text-2xl md:text-4xl">
                    Knowledge Base
                </h1>
                <p className="text-muted-foreground">
                    upload and manage documents for your AI assistant
                </p>
            </div>
            <div className="mt-8 rounded-lg border bg-background">
               <div className="flex flex-col gap-y-3 border-b px-6 py-4">
                 <div className="flex items-center justify-end gap-x-2">
                   {isSyncRunning ? (
                     <Button
                      onClick={handleCancelSync}
                      variant="outline"
                     >
                       <XIcon/>
                       Cancel Sync
                     </Button>
                   ) : (
                     <Button
                      disabled={isStartingSync}
                      onClick={handleStartSync}
                      variant="outline"
                     >
                       <RefreshCwIcon className={isStartingSync ? "animate-spin" : ""} />
                       {isStartingSync ? "Starting..." : "Sync Docs from GitHub"}
                     </Button>
                   )}
                   <Button
                    onClick={()=> setUploadDialogOpen(true)}
                   >
                     <PlusIcon/>
                     Add New
                   </Button>
                 </div>
                 {isSyncRunning && syncRun && (
                   <div className="space-y-1.5">
                     <div className="flex items-center justify-between text-muted-foreground text-xs">
                       <span>
                         Processing file {Math.min(syncRun.cursor + 1, syncRun.files.length)} of {syncRun.files.length}
                       </span>
                       <span>{syncProgress}%</span>
                     </div>
                     <Progress value={syncProgress} />
                     <p className="text-muted-foreground text-xs">
                       {syncRun.added} new · {syncRun.updatedOrUnchanged} up to date
                       {syncRun.failed > 0 && ` · ${syncRun.failed} failed`}
                       {" "}— paced to respect embedding rate limits, this may take a while
                     </p>
                   </div>
                 )}
                 {!isSyncRunning && syncRun && syncRun.status !== "running" && (
                   <p className="text-muted-foreground text-xs">
                     {syncRun.status === "completed" && (
                       <>Last sync: {syncRun.added} new, {syncRun.updatedOrUnchanged} up to date{syncRun.failed > 0 && `, ${syncRun.failed} failed`}</>
                     )}
                     {syncRun.status === "failed" && (
                       <span className="text-destructive">Last sync failed: {syncRun.lastError}</span>
                     )}
                     {syncRun.status === "cancelled" && (
                       <>Last sync was cancelled after {syncRun.cursor} of {syncRun.files.length} files</>
                     )}
                   </p>
                 )}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                            <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                            {/* <TableHead className="px-6 py-4 font-medium">Size</TableHead> */}
                            <TableHead className="px-6 py-4 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(() => {
                            if(isLoadingFirstPage){
                                return (
                                <TableRow>
                                  <TableCell className="h-24 text-center" colSpan={4}>
                                    Loading files...
                                  </TableCell>
                                </TableRow>
                                )
                            }

                            return files.results.map((file) =>(
                                <TableRow className="hover:bg-muted/50" key={file.id}>
                                  <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <FileIcon/>
                                       {file.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-6 py-4">
                                    <Badge className="uppercase" variant="outline">
                                        {file.type}
                                    </Badge>
                                  </TableCell>
                                  {/* <TableCell className="px-6 py-4 text-muted-foreground">
                                        {file.size}
                                  </TableCell> */}
                                  <TableCell className="px-6 py-4">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                             className="size-8 p-0"
                                             size="sm"
                                             variant="ghost"
                                            >
                                              <MoreHorizontalIcon/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDeleteClick(file)}
                                          >
                                            <TrashIcon className="size-4 mr-2"/>
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                            ))
                        })()}
                    </TableBody>
                </Table>
                {!isLoadingFirstPage && files.results.length > 0 && (
                   <div className="border-t">
                      <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                       />
                    </div>
                )

                }
            </div>
          </div>
        </div>
        </>
    )
}