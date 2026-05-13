import { NextResponse } from "next/server";

import { connectDatabase } from "./config/db.js";

const jsonHeaders = {
  "Content-Type": "application/json",
};

const buildHeadersObject = (request) => {
  const headers = {};

  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return headers;
};

const buildQueryObject = (request) => {
  const searchParams = new URL(request.url).searchParams;
  const query = {};

  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return query;
};

const toRouteErrorResponse = (error) => {
  const statusCode = error?.statusCode || 500;

  return NextResponse.json(
    {
      message: error?.message || "Internal server error",
      ...(process.env.NODE_ENV !== "production" && error?.stack
        ? { stack: error.stack }
        : {}),
    },
    {
      status: statusCode,
      headers: jsonHeaders,
    }
  );
};

const runExpressLikeFn = async (fn, req, res) =>
  new Promise((resolve, reject) => {
    let completed = false;

    const next = (error) => {
      if (completed) {
        return;
      }

      completed = true;
      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    Promise.resolve(fn(req, res, next))
      .then(() => {
        if (!completed) {
          completed = true;
          resolve();
        }
      })
      .catch((error) => {
        if (!completed) {
          completed = true;
          reject(error);
        }
      });
  });

const parseFormData = async (request) => {
  const formData = await request.formData();
  const body = {};
  let file = null;

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      body[key] = value;
      continue;
    }

    if (key === "image" && value?.size > 0) {
      const arrayBuffer = await value.arrayBuffer();
      file = {
        fieldname: "image",
        originalname: value.name || "upload",
        encoding: "7bit",
        mimetype: value.type || "application/octet-stream",
        buffer: Buffer.from(arrayBuffer),
        size: value.size,
      };
    }
  }

  return { body, file };
};

const parseBody = async (request, bodyType) => {
  if (bodyType === "none") {
    return { body: {}, file: null };
  }

  if (bodyType === "formData") {
    return parseFormData(request);
  }

  const body = await request.json().catch(() => ({}));
  return { body, file: null };
};

const buildMockResponse = () => {
  const state = {
    status: 200,
    body: {},
    sent: false,
    headers: {},
  };

  const res = {
    status(code) {
      state.status = code;
      return this;
    },
    json(payload) {
      state.body = payload;
      state.sent = true;
      return this;
    },
    send(payload) {
      state.body = payload;
      state.sent = true;
      return this;
    },
    setHeader(key, value) {
      state.headers[key] = value;
    },
  };

  return { state, res };
};

export const runRouteHandler = async ({
  request,
  context = {},
  middlewares = [],
  controller,
  bodyType = "json",
}) => {
  try {
    await connectDatabase();

    const params = context?.params ? await context.params : {};
    const { body, file } = await parseBody(request, bodyType);
    const req = {
      method: request.method,
      headers: buildHeadersObject(request),
      query: buildQueryObject(request),
      params,
      body,
      file,
      originalUrl: new URL(request.url).pathname,
      user: null,
    };

    const { state, res } = buildMockResponse();

    for (const middleware of middlewares) {
      await runExpressLikeFn(middleware, req, res);
      if (state.sent) {
        return NextResponse.json(state.body, {
          status: state.status,
          headers: {
            ...jsonHeaders,
            ...state.headers,
          },
        });
      }
    }

    await runExpressLikeFn(controller, req, res);

    return NextResponse.json(state.body, {
      status: state.status,
      headers: {
        ...jsonHeaders,
        ...state.headers,
      },
    });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
};

