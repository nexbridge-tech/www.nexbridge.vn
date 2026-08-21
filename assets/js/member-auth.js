(function () {
  "use strict";

  const config = window.NEXBRIDGE_MEMBER_CONFIG || {};
  const configured = Boolean(config.url && config.key && window.supabase);
  const warnings = document.querySelectorAll("[data-member-config-warning]");
  warnings.forEach((warning) => { warning.hidden = configured; });
  if (!configured) return;

  const client = window.supabase.createClient(config.url, config.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const setStatus = (form, message, isError) => {
    const status = form.querySelector(".member-form-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  };

  const setBusy = (form, busy) => {
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = busy;
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);

  const loginForm = document.getElementById("memberLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setBusy(loginForm, true);
      setStatus(loginForm, "Signing in...", false);
      const values = new FormData(loginForm);
      const { error } = await client.auth.signInWithPassword({
        email: values.get("email"),
        password: values.get("password"),
      });
      if (error) {
        setStatus(loginForm, error.message, true);
        setBusy(loginForm, false);
        return;
      }
      window.location.assign("/account.html");
    });
  }

  const registerForm = document.getElementById("memberRegisterForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setBusy(registerForm, true);
      setStatus(registerForm, "Creating your account...", false);
      const values = new FormData(registerForm);
      const { data, error } = await client.auth.signUp({
        email: values.get("email"),
        password: values.get("password"),
        options: {
          emailRedirectTo: `${window.location.origin}/account.html`,
          data: { full_name: values.get("full_name"), company: values.get("company") },
        },
      });
      if (error) {
        setStatus(registerForm, error.message, true);
        setBusy(registerForm, false);
        return;
      }
      if (data.session) window.location.assign("/account.html");
      else {
        registerForm.reset();
        setStatus(registerForm, "Check your email to verify the account, then sign in.", false);
        setBusy(registerForm, false);
      }
    });
  }

  const resetButton = document.getElementById("memberResetPassword");
  if (resetButton && loginForm) {
    resetButton.addEventListener("click", async () => {
      const email = loginForm.elements.email.value.trim();
      if (!email) return setStatus(loginForm, "Enter your email address first.", true);
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account.html`,
      });
      setStatus(loginForm, error ? error.message : "Password reset instructions have been sent.", Boolean(error));
    });
  }

  const renderDocuments = async (user) => {
    const grid = document.getElementById("memberDocuments");
    const empty = document.getElementById("memberDocumentsEmpty");
    if (!grid || !empty) return;
    const { data, error } = await client.rpc("my_library");
    if (error || !data || data.length === 0) {
      empty.hidden = false;
      return;
    }
    grid.innerHTML = data.map((document) => `
      <article class="member-document-card">
        <div><span>${document.access_level === "free_member" ? "MEMBER RESOURCE" : "LICENSED DOCUMENT"}</span><h2>${escapeHtml(document.title)}</h2><p>${escapeHtml(document.summary || "Technical document available to your account.")}</p></div>
        <div class="member-document-meta"><span>Version ${escapeHtml(document.version)}</span><button type="button" data-download-id="${escapeHtml(document.id)}" class="btn btn-primary">Download PDF</button></div>
      </article>`).join("");
    grid.hidden = false;
    grid.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-download-id]");
      if (!button) return;
      button.disabled = true;
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/.netlify/functions/download-document", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId: button.dataset.downloadId }),
      });
      const result = await response.json();
      button.disabled = false;
      if (!response.ok) return window.alert(result.error || "Download could not be authorized.");
      window.location.assign(result.url);
    });
  };

  const identity = document.getElementById("memberIdentity");
  if (identity) {
    client.auth.getUser().then(({ data }) => {
      const user = data.user;
      const signedOut = document.getElementById("memberSignedOut");
      const logout = document.getElementById("memberLogout");
      if (!user) {
        identity.textContent = "Not signed in";
        signedOut.hidden = false;
        logout.hidden = true;
        return;
      }
      identity.textContent = user.user_metadata?.full_name
        ? `${user.user_metadata.full_name} · ${user.email}`
        : user.email;
      renderDocuments(user);
    });
  }

  const logoutButton = document.getElementById("memberLogout");
  if (logoutButton) logoutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.assign("/login.html");
  });
})();
