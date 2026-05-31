export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`Error: ${tokenData.error_description}`, { status: 400 });
  }

  const token = tokenData.access_token;

  const html = `<!DOCTYPE html>
<html>
<head><title>Redirecting...</title></head>
<body>
<script>
  const token = ${JSON.stringify(token)};
  const state = ${JSON.stringify(state)};
  const msg = "authorization:github:success:" + JSON.stringify({ token, provider: "github" });
  
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(msg, "*");
      setTimeout(() => window.close(), 300);
    } else {
      // Direct redirect for mobile - pass token in URL hash
      const adminUrl = "/admin/#token=" + encodeURIComponent(token);
      window.location.replace(adminUrl);
    }
  } catch(e) {
    window.location.replace("/admin/#token=" + encodeURIComponent(token));
  }
</script>
<p style="font-family:sans-serif;padding:20px">Redirecting to admin...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
    }
