export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, password } = await request.json();

    const storedUsername = await env.DB.prepare("SELECT value FROM config WHERE key = 'admin_username'").first("value");
    const storedPassword = await env.DB.prepare("SELECT value FROM config WHERE key = 'admin_password'").first("value");

    if (username === storedUsername && password === storedPassword) {
        // 简单生成一个 Token (实际生产中应使用 JWT 或更安全的机制)
        const token = btoa(username + password + Date.now()).slice(0, 32);
        return new Response(JSON.stringify({ success: true, token }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: false, message: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
    });
}
