import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@skillxchange.com').trim().toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';

    // Environment-driven Admin authentication check for Vercel deployment
    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: 'Admin authenticated successfully',
        data: {
          user: {
            id: 'usr_admin_master_001',
            email: adminEmail,
            role: 'ADMIN',
            isVerified: true,
            profile: {
              fullName: 'System Administrator',
              university: 'SkillXchange Ops',
              course: 'Computer Science Administration',
              graduationYear: 2024,
              reputationScore: 5.0,
              completedExchanges: 10,
              bio: 'Platform administrator and community moderator with full system access control.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOwner',
            },
            skills: [],
          },
          accessToken: 'admin-access-token-jwt-production',
          refreshToken: 'admin-refresh-token-jwt-production',
        },
      });
    }

    // Forward to backend API for all standard registered accounts
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://skillxchange-api-olgv.onrender.com/api';
    try {
      const backendRes = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch (e) {
      console.error('Backend API connection error:', e);
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
