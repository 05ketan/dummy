import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, groupId, conversationHistory } = await req.json();

    if (!message || !groupId) {
      return new Response(
        JSON.stringify({ error: "Message and groupId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: "Not a member of this group" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: groupData } = await supabase
      .from("groups")
      .select("name, description")
      .eq("id", groupId)
      .maybeSingle();

    const { data: upcomingOutings } = await supabase
      .from("outings")
      .select("title, description, location, scheduled_at, status")
      .eq("group_id", groupId)
      .order("scheduled_at", { ascending: true })
      .limit(5);

    const { data: activePolls } = await supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        status,
        poll_options (
          id,
          option_text
        )
      `)
      .eq("group_id", groupId)
      .eq("status", "active")
      .limit(3);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemContext = `You are PlanPal, a friendly AI assistant helping coordinate group activities and outings. 
You are currently assisting the group: ${groupData?.name || "Unknown Group"}.
${groupData?.description ? `Group Description: ${groupData.description}` : ""}

Current group information:
- Upcoming outings: ${upcomingOutings?.length ? JSON.stringify(upcomingOutings) : "None scheduled"}
- Active polls: ${activePolls?.length ? JSON.stringify(activePolls) : "No active polls"}

Your role is to:
1. Help coordinate plans and suggest activities
2. Answer questions about upcoming outings
3. Provide information about active polls
4. Suggest ideas for group activities based on context
5. Be friendly, helpful, and concise

Keep responses conversational and helpful. When suggesting activities, consider the group context.`;

    const chatHistory = conversationHistory || [];
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.message }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm PlanPal, your group planning assistant. How can I help coordinate your group activities today?" }],
        },
        ...formattedHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert([
        {
          group_id: groupId,
          user_id: user.id,
          message: message,
          role: "user",
        },
        {
          group_id: groupId,
          user_id: null,
          message: response,
          role: "assistant",
        },
      ]);

    if (insertError) {
      console.error("Error saving messages:", insertError);
    }

    return new Response(
      JSON.stringify({
        message: response,
        role: "assistant",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in planpal-chat:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});