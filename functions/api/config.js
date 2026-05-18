export async function onRequestGet(context) {
    const { env } = context;
    const backgroundUrl = await env.DB.prepare("SELECT value FROM config WHERE key = 'background_url'").first("value");
    const backgroundOpacity = await env.DB.prepare("SELECT value FROM config WHERE key = 'background_opacity'").first("value");
    const cardOpacity = await env.DB.prepare("SELECT value FROM config WHERE key = 'card_opacity'").first("value");
    const siteName = await env.DB.prepare("SELECT value FROM config WHERE key = 'site_name'").first("value");
    const adminUsername = await env.DB.prepare("SELECT value FROM config WHERE key = 'admin_username'").first("value");
    const themeColor = await env.DB.prepare("SELECT value FROM config WHERE key = 'theme_color'").first("value");
    
    return new Response(JSON.stringify({ 
        backgroundUrl, 
        backgroundOpacity: backgroundOpacity || "0.4",
        cardOpacity: cardOpacity || "0.6",
        siteName: siteName || "十夜导航系统",
        adminUsername: adminUsername || "admin",
        themeColor: themeColor || "#00f3ff"
    }), {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const { backgroundUrl, backgroundOpacity, cardOpacity, themeColor, siteName, adminUsername, adminPassword, token } = await request.json();

    // 简单鉴权校验（实际应校验 token）
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (backgroundUrl !== undefined) {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'background_url'")
            .bind(backgroundUrl)
            .run();
    }

    if (backgroundOpacity !== undefined) {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'background_opacity'")
            .bind(String(backgroundOpacity))
            .run();
    }

    if (cardOpacity !== undefined) {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'card_opacity'")
            .bind(String(cardOpacity))
            .run();
    }

    if (siteName !== undefined) {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'site_name'")
            .bind(siteName)
            .run();
    }

    if (themeColor !== undefined) {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'theme_color'")
            .bind(themeColor)
            .run();
    }

    if (adminUsername !== undefined && adminUsername.trim() !== "") {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'admin_username'")
            .bind(adminUsername)
            .run();
    }

    if (adminPassword !== undefined && adminPassword.trim() !== "") {
        await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'admin_password'")
            .bind(adminPassword)
            .run();
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
