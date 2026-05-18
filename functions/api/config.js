export async function onRequestGet(context) {
    const { env } = context;
    const items = await env.DB.prepare("SELECT key, value FROM config").all();
    const config = {};
    items.results.forEach(row => {
        config[row.key] = row.value;
    });

    const response = {
        backgroundUrl: config.background_url || "",
        backgroundOpacity: config.background_opacity || "0.4",
        cardOpacity: config.card_opacity || "0.6",
        siteName: config.site_name || "十夜导航系统",
        adminUsername: config.admin_username || "admin",
        themeColor: config.theme_color || "#00f3ff"
    };
    
    return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { token } = body;

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    const mapping = {
        backgroundUrl: 'background_url',
        backgroundOpacity: 'background_opacity',
        cardOpacity: 'card_opacity',
        themeColor: 'theme_color',
        siteName: 'site_name',
        adminUsername: 'admin_username',
        adminPassword: 'admin_password'
    };

    const statements = [];
    for (const [apiKey, dbKey] of Object.entries(mapping)) {
        const val = body[apiKey];
        if (val !== undefined && (dbKey !== 'admin_username' || val.trim() !== "") && (dbKey !== 'admin_password' || val.trim() !== "")) {
            statements.push(env.DB.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").bind(dbKey, String(val)));
        }
    }

    if (statements.length > 0) {
        await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
