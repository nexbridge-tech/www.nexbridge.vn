import { createClient } from "@supabase/supabase-js";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publishableKey || !secretKey) return json(503, { error: "Member library is not configured." });

  const token = event.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "Sign in is required." });

  const authClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return json(401, { error: "Your session is invalid or expired." });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid request." }); }
  if (!payload.documentId) return json(400, { error: "Document ID is required." });

  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: document, error: documentError } = await admin
    .from("documents")
    .select("id,title,storage_path,access_level,status")
    .eq("id", payload.documentId)
    .eq("status", "published")
    .maybeSingle();
  if (documentError || !document) return json(404, { error: "Document not found." });

  let authorized = document.access_level === "free_member";
  if (!authorized) {
    const { data: entitlement } = await admin
      .from("entitlements")
      .select("id,expires_at")
      .eq("user_id", userData.user.id)
      .eq("document_id", document.id)
      .eq("status", "active")
      .maybeSingle();
    authorized = Boolean(entitlement && (!entitlement.expires_at || new Date(entitlement.expires_at) > new Date()));
  }
  if (!authorized) return json(403, { error: "This document is not available to your account." });

  const { data: signed, error: signedError } = await admin.storage
    .from("member-documents")
    .createSignedUrl(document.storage_path, 300, { download: true });
  if (signedError || !signed?.signedUrl) return json(500, { error: "Could not prepare the download." });

  await admin.from("download_logs").insert({ user_id: userData.user.id, document_id: document.id });
  return json(200, { url: signed.signedUrl, expiresIn: 300 });
};
