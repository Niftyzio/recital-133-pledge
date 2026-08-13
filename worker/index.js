/**
 * Receives pledge signatures, emails the initiator an approve page,
 * and on confirm commits only the public display name to GitHub.
 *
 * Secrets (wrangler secret put):
 *   HMAC_SECRET
 *   GITHUB_TOKEN   (contents:write on Niftyzio/recital-133-pledge)
 *   NOTIFY_EMAIL   (sara@nocodelab.ai)
 */

var SIGNATORIES_PATH = "signatories.json";
var TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
var SUFFIX = /^(III|II|IV|JR|SR|PHD|MSC|MD)$/i;

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), origin, env);
    }

    try {
      if (request.method === "POST" && url.pathname === "/sign") {
        return cors(await handleSign(request, env), origin, env);
      }
      if (request.method === "GET" && url.pathname === "/approve") {
        return handleApprovePage(url, env);
      }
      if (request.method === "POST" && url.pathname === "/approve") {
        return handleApprovePublish(request, env);
      }
      return new Response("Not found", { status: 404 });
    } catch (error) {
      return cors(
        json({ error: "Could not process this signature." }, 500),
        origin,
        env
      );
    }
  },
};

function cors(response, origin, env) {
  var allowed = env.CANONICAL_URL ? env.CANONICAL_URL.replace(/\/$/, "") : "";
  var pageOrigin = "";
  try {
    pageOrigin = new URL(env.CANONICAL_URL).origin;
  } catch (error) {
    pageOrigin = "";
  }
  if (origin === pageOrigin || origin === allowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return response;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function html(body, status) {
  return new Response(body, {
    status: status || 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function publicName(full, publishFull) {
  var trimmed = String(full || "").trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }
  if (publishFull) {
    return trimmed;
  }
  var parts = trimmed.split(" ");
  var last = parts[parts.length - 1];
  while (parts.length > 1 && SUFFIX.test(last.replace(/\./g, ""))) {
    parts.pop();
    last = parts[parts.length - 1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return parts[0] + " " + last.charAt(0).toUpperCase() + ".";
}

function bytesToBase64Url(bytes) {
  var binary = "";
  for (var i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  var padded = value.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4) {
    padded += "=";
  }
  var binary = atob(padded);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function makeToken(payload, secret) {
  var body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  var key = await hmacKey(secret);
  var sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return body + "." + bytesToBase64Url(new Uint8Array(sig));
}

async function readToken(token, secret) {
  var parts = String(token || "").split(".");
  if (parts.length !== 2) {
    return null;
  }
  var key = await hmacKey(secret);
  var ok = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(parts[1]),
    new TextEncoder().encode(parts[0])
  );
  if (!ok) {
    return null;
  }
  var payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
  if (!payload.exp || Date.now() > payload.exp) {
    return null;
  }
  return payload;
}

async function handleSign(request, env) {
  var form = await request.formData();
  if (String(form.get("website") || "").trim()) {
    return json({ ok: true });
  }

  var name = String(form.get("name") || "").trim();
  var role = String(form.get("role") || "").trim();
  var organisation = String(form.get("organisation") || "").trim();
  var publishFull = String(form.get("publish_full_name") || "") === "yes";

  if (name.length < 2 || name.length > 120 || role.length < 2 || role.length > 160) {
    return json({ error: "Name and role are required." }, 400);
  }

  var displayName = publicName(name, publishFull);
  var payload = {
    displayName: displayName,
    role: role,
    organisation: organisation,
    submittedName: name,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  var token = await makeToken(payload, env.HMAC_SECRET);
  var approveUrl = new URL("/approve", request.url);
  approveUrl.searchParams.set("t", token);

  await notifyInitiator(env, payload, approveUrl.toString());

  return json({ ok: true });
}

async function notifyInitiator(env, payload, approveUrl) {
  var body = new URLSearchParams();
  body.set("Submitted name (for your review only)", payload.submittedName);
  body.set("Public name on the page", payload.displayName);
  body.set("Role", payload.role);
  body.set("Organisation", payload.organisation || "(none)");
  body.set(
    "If this looks like a real person, open this link and press Publish",
    approveUrl
  );
  body.set("_subject", "Recital 133 Pledge: review " + payload.displayName);
  body.set("_template", "table");

  var email = env.NOTIFY_EMAIL;
  if (!email) {
    throw new Error("NOTIFY_EMAIL is not set");
  }

  var response = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(email), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Notify failed");
  }
}

async function handleApprovePage(url, env) {
  var payload = await readToken(url.searchParams.get("t"), env.HMAC_SECRET);
  if (!payload) {
    return html(approveShell("<p>This review link is invalid or has expired.</p>"), 400);
  }

  var token = url.searchParams.get("t");
  var submitted = escapeHtml(payload.submittedName);
  var display = escapeHtml(payload.displayName);
  var role = escapeHtml(payload.role);
  var org = escapeHtml(payload.organisation || "—");

  return html(
    approveShell(
      "<p>Review this signature. If the submitted name looks real, publish the public name.</p>" +
        "<dl>" +
        "<dt>Submitted name</dt><dd>" +
        submitted +
        "</dd>" +
        "<dt>Will appear on the page as</dt><dd>" +
        display +
        "</dd>" +
        "<dt>Role</dt><dd>" +
        role +
        "</dd>" +
        "<dt>Organisation</dt><dd>" +
        org +
        "</dd>" +
        "</dl>" +
        "<form method=\"post\" action=\"/approve\">" +
        "<input type=\"hidden\" name=\"t\" value=\"" +
        escapeHtml(token) +
        "\" />" +
        "<button type=\"submit\">Publish this name</button>" +
        "</form>" +
        "<p class=\"note\">Email addresses are not collected or stored. Closing this page does nothing.</p>"
    )
  );
}

async function handleApprovePublish(request, env) {
  var form = await request.formData();
  var payload = await readToken(form.get("t"), env.HMAC_SECRET);
  if (!payload) {
    return html(approveShell("<p>This review link is invalid or has expired.</p>"), 400);
  }

  var result = await commitSignatory(env, {
    displayName: payload.displayName,
    role: payload.role,
    organisation: payload.organisation || "",
  });

  var next = (env.CANONICAL_URL || "/").replace(/\/?$/, "/") + "#names";
  var message = result.duplicate
    ? "<p>" + escapeHtml(payload.displayName) + " was already on the page.</p>"
    : "<p>Published " + escapeHtml(payload.displayName) + ".</p>";

  return html(
    approveShell(
      message + '<p><a href="' + escapeHtml(next) + '">Open the names list</a></p>'
    )
  );
}

async function commitSignatory(env, entry) {
  var repo = env.GITHUB_REPO;
  var token = env.GITHUB_TOKEN;
  var headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "User-Agent": "recital-133-pledge",
  };

  var getUrl =
    "https://api.github.com/repos/" + repo + "/contents/" + SIGNATORIES_PATH;
  var current = await fetch(getUrl, { headers: headers });
  if (!current.ok) {
    throw new Error("Could not read names file");
  }
  var file = await current.json();
  var raw = decodeGitHubContent(file.content);
  var rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    rows = [];
  }

  var duplicate = rows.some(function (row) {
    return (
      String(row.displayName).toLowerCase() === entry.displayName.toLowerCase() &&
      String(row.role).toLowerCase() === entry.role.toLowerCase()
    );
  });
  if (duplicate) {
    return { duplicate: true };
  }

  rows.push({
    displayName: entry.displayName,
    role: entry.role,
    organisation: entry.organisation,
  });

  var pretty = JSON.stringify(rows, null, 2) + "\n";
  var put = await fetch(getUrl, {
    method: "PUT",
    headers: Object.assign({ "Content-Type": "application/json" }, headers),
    body: JSON.stringify({
      message: "Add public name " + entry.displayName + ".",
      content: encodeGitHubContent(pretty),
      sha: file.sha,
      branch: "main",
    }),
  });

  if (!put.ok) {
    throw new Error("Could not publish name");
  }
  return { duplicate: false };
}

function decodeGitHubContent(content) {
  var binary = atob(content.replace(/\n/g, ""));
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function encodeGitHubContent(text) {
  var bytes = new TextEncoder().encode(text);
  var binary = "";
  for (var i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function approveShell(inner) {
  return (
    "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"/>" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>" +
    "<title>Review signature</title>" +
    "<style>body{font:1.1rem/1.5 Georgia,serif;max-width:36rem;margin:3rem auto;padding:0 1.2rem;color:#1c1712;background:#f3ead8}dt{font-weight:700;margin-top:1rem}button{margin-top:1.2rem;padding:.7rem 1.1rem;border:0;background:#9c2b1a;color:#fbf6ea;font:1.05rem Georgia,serif;cursor:pointer}.note{color:#4a4036;font-size:.95rem}</style>" +
    "</head><body><h1>Review signature</h1>" +
    inner +
    "</body></html>"
  );
}
