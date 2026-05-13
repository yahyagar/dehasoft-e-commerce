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

  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let requestBody: BodyInit | undefined;

  if (isFormData) {
    requestBody = options.body as FormData;
  } else if (options.body !== undefined) {
    requestBody = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${laravelApiUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: requestBody,
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
