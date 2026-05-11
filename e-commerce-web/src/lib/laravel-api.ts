import { NextResponse } from "next/server";

type LaravelProxyOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

type LaravelRequestResult = {
  data: unknown;
  status: number;
};

const defaultErrorData = {
  data: {},
  message: "Laravel API is not reachable",
};

export async function laravelRequest(
  path: string,
  options: LaravelProxyOptions = {}
): Promise<LaravelRequestResult> {
  const laravelApiUrl = process.env.LARAVEL_API_URL;
  const proxySecret = process.env.LARAVEL_PROXY_SECRET;

  if (!laravelApiUrl || !proxySecret) {
    return {
      data: {
        data: {},
        message: "Laravel API configuration is missing",
      },
      status: 500,
    };
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    "Proxy-Secret-Key": proxySecret,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const response = await fetch(`${laravelApiUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
    };
  } catch {
    return {
      data: defaultErrorData,
      status: 502,
    };
  }
}

export async function laravelProxy(
  path: string,
  options: LaravelProxyOptions = {}
) {
  const result = await laravelRequest(path, options);

  return NextResponse.json(result.data, {
    status: result.status,
  });
}
