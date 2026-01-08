import { createClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    try {
      // GET /api/items - Get all items
      if (path === '/api/items' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('pantagon_items')
          .select('*')
          .order('buy_date', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/items/:id - Get single item
      if (path.startsWith('/api/items/') && request.method === 'GET') {
        const id = path.split('/').pop();
        
        const { data, error } = await supabase
          .from('pantagon_items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /api/items - Create new item
      if (path === '/api/items' && request.method === 'POST') {
        const body = await request.json();

        const { data, error } = await supabase
          .from('pantagon_items')
          .insert([body])
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PATCH /api/items/:id - Update item
      if (path.startsWith('/api/items/') && request.method === 'PATCH') {
        const id = path.split('/').pop();
        const body = await request.json();

        const { data, error } = await supabase
          .from('pantagon_items')
          .update(body)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /api/items/:id - Delete item
      if (path.startsWith('/api/items/') && request.method === 'DELETE') {
        const id = path.split('/').pop();

        const { error } = await supabase
          .from('pantagon_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      // Route not found
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders,
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
