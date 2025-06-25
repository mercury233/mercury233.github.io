/**
 * Cloudflare Worker 处理重定向规则
 * 根据 _redirects 文件定义的规则实现
 */

// 定义重定向规则
const redirectRules = [
	// Netlify 子域名重定向到主域名
	{
		source: 'https://mercury233.netlify.com/:path*',
		destination: 'https://mercury233.me/:path*',
		statusCode: 301
	},

	// ygosrv233 相关重定向到 ygo233.com
	{
		source: 'https://mercury233.me/ygosrv233',
		destination: 'https://ygo233.com/',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233.html',
		destination: 'https://ygo233.com/',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/',
		destination: 'https://ygo233.com/',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/index.html:path*',
		destination: 'https://ygo233.com/:path*',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/bugs.html:path*',
		destination: 'https://ygo233.com/bugs:path*',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/changelog.html:path*',
		destination: 'https://ygo233.com/changelog:path*',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/download.html:path*',
		destination: 'https://ygo233.com/download:path*',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/pre.html:path*',
		destination: 'https://ygo233.com/pre:path*',
		statusCode: 301
	},
	{
		source: 'https://mercury233.me/ygosrv233/usage.html:path*',
		destination: 'https://ygo233.com/usage:path*',
		statusCode: 301
	},

	// 重定向到 srvpro.ygo233.com
	{
		source: 'https://mercury233.me/ygosrv233/dashboard.html:path*',
		destination: 'http://srvpro.ygo233.com/',
		statusCode: 302
	},
	{
		source: 'https://mercury233.me/ygosrv233/deck-dashboard.html:path*',
		destination: 'http://srvpro.ygo233.com/',
		statusCode: 302
	},
	{
		source: 'https://mercury233.me/ygosrv233/pre-dashboard.html:path*',
		destination: 'http://srvpro.ygo233.com/',
		statusCode: 302
	},
	{
		source: 'https://mercury233.me/ygosrv233/replay-dashboard.html:path*',
		destination: 'http://srvpro.ygo233.com/',
		statusCode: 302
	}
];

/**
 * 将带有通配符的 URL 模式转换为正则表达式
 * @param {string} pattern - 带有通配符的 URL 模式
 * @returns {RegExp} - 转换后的正则表达式
 */
function patternToRegex(pattern) {
	return new RegExp(
		'^' +
		pattern
			.replace(/\./g, '\\.')
			.replace(/\//g, '\\/')
			.replace(/:path\*/g, '(.*)')
		+ '$'
	);
}

/**
 * 处理请求的主函数
 * @param {Request} request - 传入的请求对象
 * @param {Object} env - 环境变量
 * @param {Object} ctx - 上下文对象
 * @returns {Response} - 响应对象
 */
async function handleRequest(request, env, ctx) {
	const url = request.url;

	// 检查是否匹配任何重定向规则
	for (const rule of redirectRules) {
		const pattern = patternToRegex(rule.source);
		const match = url.match(pattern);

		if (match) {
			// 如果匹配到规则，执行重定向
			const path = match[1] || '';
			const destination = rule.destination.replace(/:path\*/g, path);

			return Response.redirect(destination, rule.statusCode);
		}
	}

	// 处理 /ygosrv233/ 路径下的请求，需要特殊处理
	if (url.includes('/ygosrv233')) {
		// 根据 wrangler.jsonc 配置，会首先执行 worker
		// 如果没有匹配重定向规则，则继续处理静态资源请求
		try {
			// 获取对应的静态资源
			return await env.ASSETS.fetch(request);
		} catch (e) {
			return new Response('Not Found', { status: 404 });
		}
	}

	// 默认返回静态资源
	return env.ASSETS.fetch(request);
}

// 导出 fetch 处理函数
export default {
	fetch: handleRequest
};
