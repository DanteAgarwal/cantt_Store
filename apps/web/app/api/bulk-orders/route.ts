import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, unit, station, quantity, details } = body;

    if (!fullName || !phone || !details) {
      return NextResponse.json(
        { success: false, message: 'Full name, phone, and requirements are mandatory' },
        { status: 400 },
      );
    }

    const enquiryId = `ENQ-${Date.now().toString().slice(-5)}`;
    const newEnquiry = {
      id: enquiryId,
      regiment: unit?.trim() || 'General Armed Forces / Defence',
      contactName: fullName.trim(),
      phone: phone.trim(),
      quantity: `${quantity || 50} Units`,
      station: station?.trim() || 'Military Station, India',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'NEW',
    };

    return NextResponse.json({
      success: true,
      message: 'Wholesale enquiry registered',
      enquiry: newEnquiry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 },
    );
  }
}
