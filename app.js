const API = "/api";
const token = () => localStorage.getItem("clfp_token");
const user = () => { try { return JSON.parse(localStorage.getItem("clfp_user")); } catch { return null; } };
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function api(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
function showMessage(message, isError = false) {
  const el = document.getElementById("message");
  if (el) { el.textContent = message; el.className = `message${isError ? " error" : ""}`; }
}
function renderNav() {
  const nav = document.getElementById("nav"); if (!nav) return;
  const current = user();
  nav.innerHTML = current
    ? `<a href="/">Home</a><a href="report.html">Report item</a><a href="dashboard.html">Dashboard</a>${current.role === "admin" ? '<a href="admin.html">Admin</a>' : ""}<a href="#" id="logout-link">Logout</a>`
    : '<a href="/">Home</a><a href="login.html">Login</a><a href="register.html">Register</a>';
  document.getElementById("logout-link")?.addEventListener("click", e => { e.preventDefault(); localStorage.removeItem("clfp_token"); localStorage.removeItem("clfp_user"); location.href = "/"; });
}
function itemCard(item, controls = "") {
  return `<article class="item-card">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" style="width:100%;height:150px;object-fit:cover;border-radius:10px">` : ""}
    <span class="tag ${esc(item.type)}">${esc(item.type)}</span> <span class="tag ${esc(item.status)}">${esc(item.status)}</span>
    <h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><p class="meta">📍 ${esc(item.location)} · ${new Date(item.date).toLocaleDateString()}</p>
    <p class="meta">Category: ${esc(item.category)} · Reported by ${esc(item.reportedBy?.name || "Campus user")}</p>
    ${controls || (token() && item.status === "open" && String(item.reportedBy?._id) !== String(user()?.id) ? `<button class="btn btn-small claim-btn" data-id="${item._id}">Submit claim</button>` : "")}</article>`;
}
async function loadItems(query = "") {
  const grid = document.getElementById("items-grid"); if (!grid) return;
  try {
    const { items } = await api(`/items${query}`);
    grid.innerHTML = items.length ? items.map(i => itemCard(i)).join("") : "<p>No items found. Try changing your filters.</p>";
    grid.querySelectorAll(".claim-btn").forEach(btn => btn.addEventListener("click", async () => {
      if (!token()) return location.href = "login.html";
      const message = prompt("Describe a detail that proves this item belongs to you:");
      if (!message) return;
      try { await api(`/claims/${btn.dataset.id}`, { method: "POST", body: JSON.stringify({ message }) }); alert("Claim submitted successfully."); }
      catch (e) { alert(e.message); }
    }));
  } catch (e) { grid.innerHTML = `<p>${esc(e.message)}</p>`; }
}
document.getElementById("filter-form")?.addEventListener("submit", e => {
  e.preventDefault(); const params = new URLSearchParams(new FormData(e.currentTarget)); loadItems(`?${params.toString()}`);
});
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault(); const form = Object.fromEntries(new FormData(e.currentTarget));
  try {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
    localStorage.setItem("clfp_token", data.token); localStorage.setItem("clfp_user", JSON.stringify(data.user)); location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html";
  } catch (err) { showMessage(err.message, true); }
});
document.getElementById("register-form")?.addEventListener("submit", async e => {
  e.preventDefault(); const form = Object.fromEntries(new FormData(e.currentTarget));
  try {
    const data = await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
    localStorage.setItem("clfp_token", data.token); localStorage.setItem("clfp_user", JSON.stringify(data.user)); location.href = "dashboard.html";
  } catch (err) { showMessage(err.message, true); }
});
document.getElementById("report-form")?.addEventListener("submit", async e => {
  e.preventDefault(); if (!token()) return location.href = "login.html";
  const form = new FormData(e.currentTarget);
  try { await api("/items", { method: "POST", body: form }); showMessage("Your report has been submitted."); e.currentTarget.reset(); }
  catch (err) { showMessage(err.message, true); }
});
async function loadDashboard() {
  const myItems = document.getElementById("my-items"); if (!myItems) return;
  if (!token()) return location.href = "login.html";
  try {
    const [{ items }, { claims }] = await Promise.all([api("/items"), api("/claims/mine/list")]);
    const mine = items.filter(i => String(i.reportedBy?._id) === String(user()?.id));
    myItems.innerHTML = mine.length ? mine.map(i => itemCard(i, `<button class="btn btn-small delete-item" data-id="${i._id}">Delete report</button>`)).join("") : "<p>You have not reported any items yet.</p>";
    myItems.querySelectorAll(".delete-item").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Delete this report?")) { try { await api(`/items/${b.dataset.id}`, { method: "DELETE" }); loadDashboard(); } catch(e) { showMessage(e.message, true); } }
    }));
    const claimBox = document.getElementById("my-claims");
    claimBox.innerHTML = claims.length ? claims.map(c => `<article class="item-card"><h3>${esc(c.item?.title || "Item removed")}</h3><p>${esc(c.message)}</p><span class="tag ${esc(c.status)}">${esc(c.status)}</span></article>`).join("") : "<p>You have not submitted any claims.</p>";
  } catch (e) { showMessage(e.message, true); }
}
async function loadAdmin() {
  const stats = document.getElementById("stats"); if (!stats) return;
  if (!token() || user()?.role !== "admin") { showMessage("Admin login is required.", true); return; }
  try {
    const [s, itemData, claimData] = await Promise.all([api("/admin/stats"), api("/admin/items"), api("/claims/admin/all")]);
    stats.innerHTML = Object.entries(s).map(([k,v]) => `<div class="stat"><strong>${v}</strong><span>${esc(k.replace(/[A-Z]/g, m => " "+m).toUpperCase())}</span></div>`).join("");
    document.getElementById("admin-items").innerHTML = itemData.items.map(i => itemCard(i, `<div class="card-actions"><select class="status-select" data-id="${i._id}"><option ${i.status==="open"?"selected":""}>open</option><option ${i.status==="claimed"?"selected":""}>claimed</option><option ${i.status==="returned"?"selected":""}>returned</option><option ${i.status==="closed"?"selected":""}>closed</option></select><button class="btn btn-small admin-delete" data-id="${i._id}">Delete</button></div>`)).join("");
    document.querySelectorAll(".status-select").forEach(s => s.addEventListener("change", async () => { try { await api(`/admin/items/${s.dataset.id}/status`, { method:"PATCH", body:JSON.stringify({status:s.value}) }); } catch(e) { showMessage(e.message,true); } }));
    document.querySelectorAll(".admin-delete").forEach(b => b.addEventListener("click", async () => { if(confirm("Delete item and related claims?")) { await api(`/admin/items/${b.dataset.id}`,{method:"DELETE"}); loadAdmin(); } }));
    document.getElementById("admin-claims").innerHTML = claimData.claims.length ? claimData.claims.map(c => `<article class="item-card"><h3>${esc(c.item?.title || "Item removed")}</h3><p>Claimant: ${esc(c.claimant?.name)} (${esc(c.claimant?.email)})</p><p>${esc(c.message)}</p><span class="tag ${esc(c.status)}">${esc(c.status)}</span><div class="card-actions">${c.status==="pending" ? `<button class="btn btn-small review" data-id="${c._id}" data-status="approved">Approve</button><button class="btn btn-small btn-light review" data-id="${c._id}" data-status="rejected">Reject</button>` : ""}</div></article>`).join("") : "<p>No claims yet.</p>";
    document.querySelectorAll(".review").forEach(b => b.addEventListener("click", async () => { try { await api(`/claims/${b.dataset.id}/review`, {method:"PATCH",body:JSON.stringify({status:b.dataset.status})}); loadAdmin(); } catch(e) { showMessage(e.message,true); } }));
  } catch(e) { showMessage(e.message, true); }
}
renderNav();
loadItems();
loadDashboard();
loadAdmin();