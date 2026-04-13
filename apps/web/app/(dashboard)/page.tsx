"use client"

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Page() {  
  const users =  useQuery(api.users.getMany)
  return (
    <>
    <div className="flex min-h-svh p-6">
      <p>apps/web</p>
      <UserButton />
      <OrganizationSwitcher hidePersonal={true} />
      {JSON.stringify(users)}
    </div>
    </>
  )
}
