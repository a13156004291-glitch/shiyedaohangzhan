export async function onRequestGet(context) {
    const { env } = context;
    
    const categories = await env.DB.prepare("SELECT * FROM categories ORDER BY order_index ASC").all();
    const links = await env.DB.prepare("SELECT * FROM links ORDER BY order_index ASC").all();

    // 组装数据：按分类归类
    const data = categories.results.map(cat => ({
        ...cat,
        links: links.results.filter(l => l.category_id === cat.id)
    }));

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { type, action, token, data } = body;

    if (!token) return new Response("Unauthorized", { status: 401 });

    if (type === 'category') {
        if (action === 'add') {
            await env.DB.prepare("INSERT INTO categories (name, order_index) VALUES (?, ?)")
                .bind(data.name, data.order_index || 0)
                .run();
        } else if (action === 'delete') {
            await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(data.id).run();
        } else if (action === 'update') {
            await env.DB.prepare("UPDATE categories SET name = ?, order_index = ? WHERE id = ?")
                .bind(data.name, data.order_index, data.id)
                .run();
        }
    } else if (type === 'link') {
        if (action === 'add') {
            await env.DB.prepare("INSERT INTO links (category_id, title, url, icon, order_index) VALUES (?, ?, ?, ?, ?)")
                .bind(data.category_id, data.title, data.url, data.icon, data.order_index || 0)
                .run();
        } else if (action === 'delete') {
            await env.DB.prepare("DELETE FROM links WHERE id = ?").bind(data.id).run();
        } else if (action === 'update') {
            await env.DB.prepare("UPDATE links SET title = ?, url = ?, icon = ?, category_id = ?, order_index = ? WHERE id = ?")
                .bind(data.title, data.url, data.icon, data.category_id, data.order_index, data.id)
                .run();
        }
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
