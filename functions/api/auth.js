export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const scope = "repo,user";
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `https://fredzstudio.pages.dev/api/callback`;
  
  // Preserve state from CMS
  const state = url.searchParams.get("state") || "";
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return Response.redirect(githubUrl, 302);
    }
