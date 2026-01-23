export async function POST(request) {
  console.log("🎸 Simple Registration API called");

  try {
    const body = await request.json();
    console.log("📨 Request body:", body);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test API working",
        received: body,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
