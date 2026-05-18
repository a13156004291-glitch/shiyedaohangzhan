import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Mock D1 using JSON ---
const DB_FILE = './dev_db.json';
const initDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            categories: [
                { id: 1, name: '常用工具', order_index: 0 },
                { id: 2, name: '开发社区', order_index: 1 }
            ],
            links: [
                { id: 1, category_id: 1, title: 'Google', url: 'https://www.google.com', icon: '', order_index: 0 },
                { id: 2, category_id: 2, title: 'GitHub', url: 'https://github.com', icon: '', order_index: 0 }
            ],
            config: [
                { key: 'background_url', value: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop' },
                { key: 'background_opacity', value: '0.4' },
                { key: 'admin_password', value: 'admin123' }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
};
initDB();

const getDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const saveDB = (data: any) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const dbMock = {
    prepare: (query: string) => ({
        bind: (...args: any[]) => ({
            run: async () => {
                const data = getDB();
                if (query.includes('UPDATE config') && query.includes('background_url')) {
                    const cfg = data.config.find((c: any) => c.key === 'background_url');
                    if (cfg) cfg.value = args[0];
                } else if (query.includes('UPDATE config') && query.includes('background_opacity')) {
                    const cfg = data.config.find((c: any) => c.key === 'background_opacity');
                    if (cfg) cfg.value = args[0];
                } else if (query.includes('INSERT INTO categories')) {
                    data.categories.push({ id: Date.now(), name: args[0], order_index: args[1] });
                } else if (query.includes('DELETE FROM categories')) {
                    data.categories = data.categories.filter((c: any) => c.id !== args[0]);
                }
                // ... Add other handlers as needed, or use a more generic way
                saveDB(data);
                return { success: true };
            },
            all: async () => {
                const data = getDB();
                if (query.includes('FROM categories')) return { results: data.categories };
                if (query.includes('FROM links')) return { results: data.links };
                return { results: [] };
            },
            first: async (key?: string) => {
                const data = getDB();
                if (query.includes('admin_password')) {
                    const row = data.config.find((c: any) => c.key === 'admin_password');
                    return key ? row?.value : row;
                }
                if (query.includes('background_url')) {
                    const row = data.config.find((c: any) => c.key === 'background_url');
                    return key ? row?.value : row;
                }
                if (query.includes('background_opacity')) {
                    const row = data.config.find((c: any) => c.key === 'background_opacity');
                    return key ? row?.value : row;
                }
                return null;
            }
        }),
        run: async () => { return { success: true }; },
        all: async () => {
             const data = getDB();
             if (query.includes('FROM categories')) return { results: data.categories.sort((a:any,b:any)=>a.order_index - b.order_index) };
             if (query.includes('FROM links')) return { results: data.links.sort((a:any,b:any)=>a.order_index - b.order_index) };
             return { results: [] };
        },
        first: async (key?: string) => {
            const data = getDB();
            if (query.includes('admin_password')) {
                const row = data.config.find((c: any) => c.key === 'admin_password');
                return key ? row?.value : row;
            }
            if (query.includes('background_url')) {
                const row = data.config.find((c: any) => c.key === 'background_url');
                return key ? row?.value : row;
            }
            if (query.includes('background_opacity')) {
                const row = data.config.find((c: any) => c.key === 'background_opacity');
                return key ? row?.value : row;
            }
            return null;
        }
    })
};

// --- Mock Cloudflare Functions Dispatcher (simplified) ---
async function handleCloudflareRequest(modulePath: string, req: express.Request, res: express.Response) {
    try {
        const module = await import(modulePath);
        const method = `onRequest${req.method.charAt(0) + req.method.slice(1).toLowerCase()}`;
        const handler = module[method] || module.onRequest;
        const context = {
            request: { json: async () => req.body, method: req.method, headers: req.headers },
            env: { DB: dbMock }
        };
        const response = await handler(context);
        const data = await response.json();
        res.status(response.status || 200).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

app.all('/api/auth', (req, res) => handleCloudflareRequest('./functions/api/auth.js', req, res));
app.all('/api/config', (req, res) => handleCloudflareRequest('./functions/api/config.js', req, res));
app.all('/api/links', (req, res) => handleCloudflareRequest('./functions/api/links.js', req, res));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
