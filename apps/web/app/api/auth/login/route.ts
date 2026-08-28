import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    // First try forwarding to Render backend API
    const renderApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://skillxchange-api-olgv.onrender.com/api';
    try {
      const backendRes = await fetch(`${renderApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.log('Render backend connection fallback triggered');
    }

    // Direct Vercel Serverless Authentication Fallback for Admin (admin@adarsh.com / 1234)
    if (email === 'admin@adarsh.com' || email === 'admin@example.com') {
      const expectedPassword = email === 'admin@adarsh.com' ? '1234' : 'admin123';
      if (password === expectedPassword) {
        return NextResponse.json({
          success: true,
          message: 'Admin authenticated successfully',
          data: {
            user: {
              id: 'admin-owner-id-001',
              email: 'admin@adarsh.com',
              role: 'ADMIN',
              isVerified: true,
              profile: {
                fullName: 'Adarsh (Project Owner & Admin)',
                university: 'SkillXchange Administration',
                course: 'Platform Owner & Administrator',
                graduationYear: 2024,
                reputationScore: 5.0,
                completedExchanges: 10,
                bio: 'Project Owner and Administrator with full access control.',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOwner',
              },
              skills: [],
            },
            accessToken: 'fallback-admin-access-token-jwt-token',
            refreshToken: 'fallback-admin-refresh-token-jwt-token',
          },
        });
      }
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
