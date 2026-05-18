export async function onRequestPost(context) {
    const { request, env } = context;
    const { password } = await request.json();

    const storedPassword = await env.DB.prepare("SELECT value FROM config WHERE key = 'admin_password'").first("value");

    if (password === storedPassword) {
        // 简单生成一个 Token（实际生产中应使用 JWT 或更安全的机制）
        const token = btoa(password + Date.now()).slice(0, 32);
        // 也可以存入数据库或简单的校验
        return new Response(JSON.stringify({ success: true, token }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: false, message: "密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
    });
}
