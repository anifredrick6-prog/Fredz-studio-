export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  try {
    // Exchange code for access token
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
      return new Response(`GitHub OAuth error: ${tokenData.error_description}`, { status: 400 });
    }

    const token = tokenData.access_token;
    const provider = "github";

    // Return script that posts token back to CMS
    const content = `
<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p>Authenticating, please wait...</p>
<script>
  (function() {
    function receiveMessage(e) {
      console.log("receiveMessage %o", e);
    }
    window.addEventListener("message", receiveMessage, false);
    
    const token = "${token}";
    const provider = "${provider}";
    
    const message = "authorization:${provider}:success:${JSON.stringify({ token, provider })}";
    
    // Try to post to opener
    if (window.opener) {
      window.opener.postMessage(
        "authorization:${provider}:success:" + JSON.stringify({ token: "${token}", provider: "${provider}" }),
        "*"
      );
    } else {
      // Fallback — redirect to admin with token
      window.location.href = "/admin/#access_token=${token}&token_type=bearer";
    }
    
    setTimeout(function() { window.close(); }, 1000);
  })();
</script>
</body>
</html>`;

    return new Response(content, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (err) {
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}
