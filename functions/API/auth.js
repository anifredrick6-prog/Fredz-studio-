export async function onRequestGet(context) {
  const { env } = context;

  const clientId = env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing GITHUB_CLIENT_ID environment variable", { status: 500 });
  }

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("scope", "repo,user");
  githubAuthUrl.searchParams.set("state", Math.random().toString(36).substring(7));

  return Response.redirect(githubAuthUrl.toString(), 302);
}
