export async function onRequestGet(context) {
  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ token }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
