// Vercel Serverless Function for Kazi Quote Form
// Stores in Supabase + sends email via Resend

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      company,
      productType,
      decorationType,
      printLocations,
      numColors,
      quantity,
      timeline,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !productType || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        fields: { name, email, productType, message }
      });
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Store quote in database
    const { data: quote, error: dbError } = await supabase
      .from('kazi_quotes')
      .insert({
        name,
        email,
        company: company || null,
        product_type: productType,
        decoration_type: decorationType || null,
        print_locations: printLocations || [],
        num_colors: numColors || null,
        quantity: quantity ? parseInt(quantity) : null,
        timeline: timeline || null,
        message,
        status: 'new',
        source: 'website'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      throw dbError;
    }

    // Send email notification
    await resend.emails.send({
      from: 'Kazi Manufacturing <hello@kazimanufacturing.com>',
      to: ['hello@kazimanufacturing.com'],
      replyTo: email,
      subject: `New Quote Request from ${name} - ${productType}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Quote ID:</strong> #${quote.id.slice(0, 8)}</p>
        
        <h3>Contact Information</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Company:</strong> ${company || 'Not provided'}</li>
        </ul>

        <h3>Product Details</h3>
        <ul>
          <li><strong>Product Type:</strong> ${productType}</li>
          <li><strong>Decoration:</strong> ${decorationType || 'Not specified'}</li>
          <li><strong>Print Locations:</strong> ${printLocations?.length > 0 ? printLocations.join(', ') : 'Not specified'}</li>
          <li><strong>Colors:</strong> ${numColors || 'Not specified'}</li>
          <li><strong>Quantity:</strong> ${quantity || 'Not specified'}</li>
          <li><strong>Timeline:</strong> ${timeline || 'Not specified'}</li>
        </ul>

        <h3>Message</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>

        <hr>
        <p><small>Submitted at ${new Date().toISOString()}</small></p>
      `
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: 'Kazi Manufacturing <hello@kazimanufacturing.com>',
      to: [email],
      subject: 'We received your quote request',
      html: `
        <h2>Thank you for your quote request, ${name}!</h2>
        
        <p>We've received your inquiry for ${productType} and will get back to you within 24 hours.</p>
        
        <p><strong>Your Quote ID:</strong> #${quote.id.slice(0, 8)}</p>
        
        <h3>What happens next?</h3>
        <ol>
          <li>Our team will review your requirements</li>
          <li>We'll prepare a detailed quote within 24 hours</li>
          <li>If needed, we'll request additional details or schedule a call</li>
        </ol>
        
        <p>If you have any questions in the meantime, just reply to this email.</p>
        
        <p>Best regards,<br>The Kazi Manufacturing Team</p>
        
        <hr>
        <p><small>Kazi Manufacturing | Kathmandu, Nepal<br>
        hello@kazimanufacturing.com</small></p>
      `
    });

    return res.status(200).json({
      success: true,
      quoteId: quote.id,
      message: 'Quote submitted successfully'
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit quote',
      details: error.message
    });
  }
}