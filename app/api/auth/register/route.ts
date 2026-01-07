import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone, gender, country, languages } = body

    // Validate input
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: name, email, password, and phone are required',
          code: 'BAD_REQUEST'
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 8 characters',
          code: 'BAD_REQUEST'
        },
        { status: 400 }
      )
    }

    if (!phone || phone.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Phone number is required',
          code: 'BAD_REQUEST'
        },
        { status: 400 }
      )
    }

    // Call backend API with all fields
    const response = await fetch(getBackendUrl('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'guest',
        phone: phone,
        gender: gender || undefined,
        country: country || undefined,
        languages: languages || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Return backend error response as-is for proper error handling
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Registration failed',
          code: data.code,
          details: data.details,
        },
        { status: response.status }
      )
    }

    // Return in format expected by frontend
    return NextResponse.json(
      {
        success: true,
        message: data.message || 'User created successfully',
        data: data.data || data,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}
