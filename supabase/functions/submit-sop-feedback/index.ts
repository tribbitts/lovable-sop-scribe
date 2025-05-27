
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      sop_title, 
      sop_url, 
      feedback_type, 
      feedback_content, 
      user_name,
      user_email 
    } = await req.json()

    // Validate required fields
    if (!sop_title || !feedback_type || !feedback_content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sop_title, feedback_type, feedback_content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate feedback type
    const validFeedbackTypes = ['improvement', 'error', 'question', 'compliment'];
    if (!validFeedbackTypes.includes(feedback_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid feedback type. Must be one of: improvement, error, question, compliment' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user ID from auth token if available
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      userId = user?.id || null
    }

    // Insert feedback into database
    const { data, error } = await supabaseClient
      .from('sop_feedback')
      .insert({
        user_id: userId,
        sop_title,
        sop_url: sop_url || null,
        feedback_type,
        feedback_content,
        user_name: user_name || null,
        user_email: user_email || null
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('SOP feedback submitted successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Feedback submitted successfully',
        feedback_id: data[0]?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing SOP feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
