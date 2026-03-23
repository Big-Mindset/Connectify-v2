import { NextResponse } from 'next/server'
 
export default function proxy(request) {
  let session = request.cookies.get("better-auth.session_token")
  let path = request.nextUrl.pathname
  if (session && path.startsWith("/api/auth")){
    return NextResponse.redirect(new URL("/",request.url))

  }
  if (!session && path === "/"){
    return NextResponse.redirect(new URL("/login",request.url))
  }
  if (session && path !== "/"){
    return NextResponse.redirect(new URL("/",request.url))
  }
  return NextResponse.next()
}
 
 
export const config = {
 matcher: [
   "/",
   "/login",
   "/api/auth/:path*"
  ],
}