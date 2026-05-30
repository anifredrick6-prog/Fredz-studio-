export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

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
  const provider = "github";
  const message = JSON.stringify({ token, provider });

  const content = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
  const token = ${JSON.stringify(token)};
  const provider = "github";
  const msg = "authorization:github:success:" + JSON.stringify({ token, provider });
  
  if (window.opener) {
    window.opener.postMessage(msg, "*");
    setTimeout(() => window.close(), 500);
  } else {
    // Mobile fallback - store token and redirect
    sessionStorage.setItem("decap-cms-token", token);
    window.location.href = "/admin/";
  }
</script>
<p>Authenticating...</p>
</body>
</html>`;

  return new Response(content, {
    headers: { "Content-Type": "text/html" },
  });
}
