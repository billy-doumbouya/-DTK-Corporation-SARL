import { NextResponse } from 'next/server'

/**
 * Wraps an API route handler with automatic try/catch.
 * Returns a 500 JSON response on any uncaught error, with console logging.
 *
 * Usage:
 *   export const GET = apiHandler(async () => { ... }, 'admin/services GET')
 *   export const PATCH = apiHandler(async (req, { params }) => { ... }, 'admin/services PATCH')
 */
export function apiHandler<TArgs extends any[]>(
  handler: (...args: TArgs) => Promise<Response | NextResponse>,
  label: string
): (...args: TArgs) => Promise<Response | NextResponse> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (e: any) {
       
      console.error(`[${label}] uncaught error:`, e)
      return NextResponse.json(
        { error: 'Erreur serveur. Veuillez réessayer.' },
        { status: 500 }
      )
    }
  }
}
