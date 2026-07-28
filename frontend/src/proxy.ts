import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic enum for route roles
enum AppRole {
  CUSTOMER = 'CUSTOMER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  COMPLIANCE_ADMIN = 'COMPLIANCE_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  BRANCH_OPERATIONS = 'BRANCH_OPERATIONS',
  BRANCH_KYC_STAFF = 'BRANCH_KYC_STAFF',
  BRANCH_INVENTORY_STAFF = 'BRANCH_INVENTORY_STAFF',
  BRANCH_FULFILLMENT_STAFF = 'BRANCH_FULFILLMENT_STAFF',
  BRANCH_CASHIER = 'BRANCH_CASHIER',
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protect Manager Routes
  if (pathname.startsWith('/manager')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Protect Operations Routes
  if (pathname.startsWith('/ops')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Protect Customer Routes (Dashboard)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/orders') || pathname.startsWith('/kyc')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/ops/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/kyc/:path*'
  ],
};
