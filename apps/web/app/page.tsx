"use client"

import { useQuery, Authenticated, Unauthenticated } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Page() {  
  const users =  useQuery(api.users.getMany)
  return (
    <>
    <Authenticated>
    <div className="flex min-h-svh p-6">
      <p>apps/web</p>
      <UserButton />
      {JSON.stringify(users)}
    </div>
    </Authenticated>
    <Unauthenticated>
        <p>Must be signed in!</p>
        <SignInButton>Sign In </SignInButton>
    </Unauthenticated>
    </>
  )
}
