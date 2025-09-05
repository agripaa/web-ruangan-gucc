// api.js — fetch wrapper ala axios (cookieless by default)

// 1) pastikan baseURL punya trailing slash
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_DEV_BASE_URL_V1 || "";
const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL : RAW_BASE_URL + "/";

// default header untuk JSON; otomatis dilepas kalau kirim FormData
const DEFAULT_HEADERS = { "Content-Type": "application/json" };

// util timeout
const timeoutFetch = (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const opts = { ...options, signal: controller.signal };
  return fetch(url, opts).finally(() => clearTimeout(id));
};

// Gabung base + path tanpa “menghapus” path base
const buildURL = (base, path = "", params) => {
  // kalau path sudah absolute (http/https), jangan gabung dengan base
  const isAbsolute = /^https?:\/\//i.test(path);
  const baseWithSlash = base.endsWith("/") ? base : base + "/";
  const relativePath = String(path).replace(/^\/+/, ""); // strip leading '/'

  const u = isAbsolute
    ? new URL(path)
    : new URL(relativePath, baseWithSlash);

  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) u.searchParams.append(k, String(v));
    }
  }
  return u.toString();
};

const parseBody = async (res) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  try { return await res.text(); } catch { return null; }
};

const request = async (
  method,
  url,
  {
    baseURL = BASE_URL,
    timeout = 10000,
    headers = {},
    params,
    data,
    // penting: cookieless
    credentials = "omit",
    ...rest
  } = {}
) => {
  const fullURL = buildURL(baseURL, url, params);

  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  const finalHeaders = new Headers({ ...DEFAULT_HEADERS, ...headers });
  if (isFormData) finalHeaders.delete("Content-Type"); // biar boundary otomatis

  const options = {
    method,
    headers: finalHeaders,
    credentials,   // <-- 'omit' supaya cookie tidak terkirim
    cache: "no-store",
    ...rest,
  };
  if (data !== undefined) options.body = isFormData ? data : JSON.stringify(data);

  let res;
  try {
    res = await timeoutFetch(fullURL, options, timeout);
  } catch (err) {
    throw {
      message: err?.message || "Network Error",
      isAxiosLikeError: true,
      request: { url: fullURL, method, headers: Object.fromEntries(finalHeaders.entries()) },
      cause: err,
    };
  }

  const responseData = await parseBody(res);
  const response = {
    data: responseData,
    status: res.status,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    url: fullURL,
  };

  if (!res.ok) throw { message: "Request failed", isAxiosLikeError: true, response };
  return response;
};

const api = {
  get: (url, config) => request("GET", url, config),
  delete: (url, config) => request("DELETE", url, config),
  post: (url, data, config) => request("POST", url, { ...(config || {}), data }),
  put: (url, data, config) => request("PUT", url, { ...(config || {}), data }),
  patch: (url, data, config) => request("PATCH", url, { ...(config || {}), data }),
};

export default api;
export { api };
