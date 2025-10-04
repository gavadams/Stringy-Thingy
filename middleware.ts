// Middleware temporarily disabled to avoid Edge Runtime issues
// Authentication is handled by ProtectedRoute components instead

// export async function middleware(request: NextRequest) {
//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }
