// 定义重定向规则
const redirects = [
  // Redirect default Netlify subdomain to primary domain
  { from: "https://mercury233.netlify.com/*", to: "https://mercury233.me/:splat", type: 301 },

  // ygosrv233 相关重定向
  { from: "https://mercury233.me/ygosrv233/", to: "https://ygo233.com/", type: 301 },
  { from: "https://mercury233.me/ygosrv233/index.html*", to: "https://ygo233.com/:splat", type: 301 },
  { from: "https://mercury233.me/ygosrv233/bugs.html*", to: "https://ygo233.com/bugs:splat", type: 301 },
  { from: "https://mercury233.me/ygosrv233/changelog.html*", to: "https://ygo233.com/changelog:splat", type: 301 },
  { from: "https://mercury233.me/ygosrv233/download.html*", to: "https://ygo233.com/download:splat", type: 301 },
  { from: "https://mercury233.me/ygosrv233/pre.html*", to: "https://ygo233.com/pre:splat", type: 301 },
  { from: "https://mercury233.me/ygosrv233/usage.html*", to: "https://ygo233.com/usage:splat", type: 301 },

  // dashboard 相关临时重定向
  { from: "https://mercury233.me/ygosrv233/dashboard.html*", to: "http://srvpro.ygo233.com/", type: 302 },
  { from: "https://mercury233.me/ygosrv233/deck-dashboard.html*", to: "http://srvpro.ygo233.com/", type: 302 },
  { from: "https://mercury233.me/ygosrv233/pre-dashboard.html*", to: "http://srvpro.ygo233.com/", type: 302 },
  { from: "https://mercury233.me/ygosrv233/replay-dashboard.html*", to: "http://srvpro.ygo233.com/", type: 302 }
];

// 匹配 URL 中的通配符路径参数
function matchPath(pattern, url) {
  // 将通配符转换为正则表达式
  const regexPattern = pattern
    .replace(/\//g, "\\/")
    .replace(/\./g, "\\.")
    .replace(/\*/g, "(.*)");
  
  const regex = new RegExp(`^${regexPattern}$`);
  const match = url.match(regex);
  
  if (match && match.length > 1) {
    return match[1]; // 返回匹配到的通配符部分
  }
  return null;
}

// 应用重定向规则
function applyRedirects(request) {
  const url = request.url;
  
  for (const redirect of redirects) {
    const wildcard = matchPath(redirect.from, url);
    
    if (wildcard !== null || redirect.from === url) {
      // 替换目标 URL 中的 :splat 占位符
      let target = redirect.to;
      if (wildcard && target.includes(':splat')) {
        target = target.replace(':splat', wildcard);
      }
      
      return Response.redirect(target, redirect.type);
    }
  }
  
  return null; // 没有匹配的重定向规则
}

// 主处理函数
async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);

  // 检查是否有匹配的重定向规则
  const redirectResponse = applyRedirects(request);
  if (redirectResponse) {
    return redirectResponse;
  }
  
  // 处理目录索引路径
  if (url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}index.html`;
  }
  
  // 使用 fetch 方法从源站点获取静态资源
  try {
    // 获取文件内容
    const response = await fetch(new Request(url.toString(), request));
    
    // 处理成功响应
    if (response.ok) {
      // 添加缓存控制头
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=86400'); // 1天浏览器缓存
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
    
    // 处理404错误
    if (response.status === 404) {
      // 尝试获取自定义404页面
      const notFoundResponse = await fetch(new Request(`${url.origin}/404.html`, request));
      if (notFoundResponse.ok) {
        return new Response(notFoundResponse.body, {
          status: 404,
          headers: notFoundResponse.headers
        });
      }
      
      // 如果没有自定义404页面，返回简单的404响应
      return new Response("Not Found", { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // 返回原始响应
    return response;
  } catch (e) {
    // 发生错误时返回500
    return new Response("Internal Error", { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// 注册 fetch 事件处理器
addEventListener("fetch", event => {
  try {
    event.respondWith(handleRequest(event));
  } catch (e) {
    event.respondWith(new Response("Internal Error", { status: 500 }));
  }
});
