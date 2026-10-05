/*
 * 京东商品价格查询（Loon）：增删商品只需修改 PRODUCTS。
 * sku 为可选项；建议填写，以避免每次运行都解析短链接。
 */
const PRODUCTS = [
  { name: "海尔226L变频三门冰箱（一级节能）", sku: "100082201496", url: "https://3.cn/35-YtBip?jkl=@Z3pXbB1PyU7@" },
  { name: "海尔226L三门风冷变频冰箱", sku: "100312671808", url: "https://3.cn/35Y-tTC8?jkl=@XD46A4hPdhs@" },
  { name: "海龟5L VPSA医用制氧机", sku: "100119459567", url: "https://3.cn/-35Yu02T?jkl=@WD5WQ2VgLBi@" }
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 jdapp;iPhone;13.0.0",
  Accept: "text/html,application/xhtml+xml,application/json"
};

function get(url, redirect, node) {
  return new Promise(function (resolve, reject) {
    const options = {
      url: url,
      headers: HEADERS,
      timeout: 30000,
      "auto-redirect": redirect,
      "auto-cookie": true,
      alpn: "h1"
    };
    if (node) options.node = node;

    $httpClient.get(options, function (error, response, data) {
      if (error) return reject(new Error(String(error)));
      resolve({ response: response || {}, body: String(data || "") });
    });
  });
}

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function getWithRetry(url, redirect, retries, node) {
  return get(url, redirect, node).catch(function (error) {
    if (retries <= 0) throw error;
    console.log((node || "当前路由") + " 请求失败，2 秒后重试：" + error.message);
    return wait(2000).then(function () {
      return getWithRetry(url, redirect, retries - 1, node);
    });
  });
}

function header(headers, name) {
  const keys = Object.keys(headers || {});
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i].toLowerCase() === name.toLowerCase()) return headers[keys[i]];
  }
  return "";
}

function absoluteUrl(base, location) {
  if (/^https?:\/\//i.test(location)) return location;
  if (/^\/\//.test(location)) return "https:" + location;
  const origin = base.match(/^(https?:\/\/[^/]+)/i);
  if (location.charAt(0) === "/" && origin) return origin[1] + location;
  return base.replace(/[?#].*$/, "").replace(/\/[^/]*$/, "/") + location;
}

function skuFrom(text) {
  let value = String(text || "").replace(/\\\//g, "/").replace(/\\u002f/gi, "/").replace(/&amp;/gi, "&").replace(/&#x3d;/gi, "=");
  try { value += "\n" + decodeURIComponent(value); } catch (error) {}
  const patterns = [
    /item\.jd\.com\/(\d{5,})\.html/i,
    /item\.m\.jd\.com\/product\/(\d{5,})\.html/i,
    /[?&](?:sku|skuId|wareId|productId)=(\d{5,})/i,
    /["']?(?:skuId|wareId|productId)["']?\s*[:=]\s*["']?(\d{5,})/i
  ];
  for (let i = 0; i < patterns.length; i += 1) {
    const match = value.match(patterns[i]);
    if (match) return match[1];
  }
  return "";
}

function resolveSku(url, count) {
  const direct = skuFrom(url);
  if (direct) return Promise.resolve(direct);
  if (count >= 8) return Promise.reject(new Error("短链接重定向次数过多"));
  return getWithRetry(url, false, 1, "DIRECT").then(function (result) {
    const status = Number(result.response.status || 0);
    const location = header(result.response.headers, "location");
    if (status >= 300 && status < 400 && location) return resolveSku(absoluteUrl(url, location), count + 1);
    const sku = skuFrom(result.body);
    if (sku) return sku;
    return getWithRetry(url, true, 1, "DIRECT").then(function (followed) {
      const followedSku = skuFrom(followed.body);
      if (!followedSku) throw new Error("未能从商品链接识别 SKU");
      return followedSku;
    });
  });
}

function prepareProducts(products) {
  return Promise.all(products.map(function (product) {
    if (product.sku) return Promise.resolve(product);
    return resolveSku(product.url, 0).then(function (sku) {
      return { name: product.name, sku: sku, url: product.url };
    });
  }));
}

function pricesFor(products) {
  const skuIds = products.map(function (product) {
    return "J_" + product.sku;
  }).join(",");
  const priceUrl = "https://p.3.cn/prices/mgets?type=1&skuIds=" + encodeURIComponent(skuIds);

  return getWithRetry(priceUrl, true, 2, "DIRECT").catch(function (directError) {
    console.log("DIRECT 访问价格接口失败，改用当前路由：" + directError.message);
    return getWithRetry(priceUrl, true, 1);
  }).then(function (result) {
    let data;
    try { data = JSON.parse(result.body); } catch (error) { throw new Error("价格接口返回内容无法解析"); }
    const prices = {};
    (data || []).forEach(function (item) {
      prices[String(item.id || "").replace(/^J_/, "")] = item.p;
    });

    return products.map(function (product) {
      const price = prices[product.sku];
      if (!price || price === "-1" || Number(price) <= 0) {
        return product.name + "：未获取到价格";
      }
      return product.name + "：¥" + price;
    });
  });
}

prepareProducts(PRODUCTS).then(pricesFor).then(function (lines) {
  $notification.post("京东商品价格", "共查询 " + PRODUCTS.length + " 件商品", lines.join("\n"), { openUrl: PRODUCTS[0].url });
}).catch(function (error) {
  console.log("京东价格查询失败：" + error.message);
  $notification.post("京东商品价格", "查询异常", String(error.message || error));
}).then(function () { $done(); });
