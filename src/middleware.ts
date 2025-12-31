import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    let hostname = req.headers.get("host")!;

    // Remove port if present for local dev consistency
    hostname = hostname.replace(":3000", "");

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
    const customDomain = hostname.replace(`.${rootDomain}`, "");

    // 1. App/Landing Page (root or app subdomain)
    // If accessing the root domain app.beautyflow.com or localhost
    if (hostname === rootDomain || hostname === `app.${rootDomain}`) {
        // If it's the root path, serve the Landing Page or App Shell
        // For now, we rewrite to /home or similar if we have one, or keep standard handling
        return NextResponse.next();
    }

    // 2. Tenant Subdomains (e.g. beleza-pura.beautyflow.app)
    // We assume anything else is a tenant subdomain OR a custom domain
    // If it ends with our root domain, it is a subdomain
    if (hostname.endsWith(`.${rootDomain}`)) {
        const tenantSlug = hostname.replace(`.${rootDomain}`, "");
        // Optimization: prevent infinite rewrite loop if already rewriten
        // Rewrite to dynamic route: /[tenantSlug]/...

        // Preserve paths (e.g., /book, /login)
        const path = url.pathname;

        // Rewrite the internal URL to match the file structure: src/app/[tenantSlug]/...
        return NextResponse.rewrite(new URL(`/${tenantSlug}${path}${url.search}`, req.url));
    }

    // 3. Custom Domains (e.g. studioglamour.com) - (Advanced/Future)
    // Here we would need to check DB if this domain maps to a tenant slug.
    // Costly to do in middleware without edge-caching or Redis. 
    // Simplified: We skip for MVP unless specifically requested.

    return NextResponse.next();
}
