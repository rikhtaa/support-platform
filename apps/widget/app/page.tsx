"use client"

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {  
  const users =  useQuery(api.users.getMany)
  return (
    <div className="flex min-h-svh p-6">
      <p>apps/widget</p>
      {JSON.stringify(users)}
    </div>
  )
}
