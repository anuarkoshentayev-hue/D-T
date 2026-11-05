// DEADLINE & TARTIP — frontend starter
// Add your Supabase Project URL and anon/public key below.
// Never put a service_role key or database password in browser code.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_PUBLIC_KEY";

let supabaseClient = null;
if (window.supabase && SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const modal = $("#authModal");
let authMode = "signup";

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
function openAuth(mode = "signup") {
  authMode = mode;
  $("#modalTitle").textContent = mode === "signup" ? "Create your account" : "Welcome back";
  $("#authSubmit").textContent = mode === "signup" ? "Create account" : "Log in";
  $("#nameLabel").classList.toggle("hidden", mode === "login");
  $("#switchText").textContent = mode === "signup" ? "Already have an account?" : "New to D&T?";
  $("#switchMode").textContent = mode === "signup" ? "Log in" : "Sign up";
  $("#authMessage").textContent = "";
  $("#password").setAttribute("autocomplete", mode === "signup" ? "new-password" : "current-password");
  modal.classList.remove("hidden");
  $("#email").focus();
}
function closeAuth(){ modal.classList.add("hidden"); }
$("#loginBtn").addEventListener("click", () => openAuth("login"));
$("#signupBtn").addEventListener("click", () => openAuth("signup"));
$("#heroSignup").addEventListener("click", () => openAuth("signup"));
$("#sidebarLogin").addEventListener("click", () => openAuth("login"));
$("#followingLogin").addEventListener("click", () => openAuth("login"));
$("#closeModal").addEventListener("click", closeAuth);
$("#switchMode").addEventListener("click", () => openAuth(authMode === "signup" ? "login" : "signup"));
modal.addEventListener("click", (e) => { if (e.target === modal) closeAuth(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuth(); });

function showView(view) {
  ["home","browse","following"].forEach(name => $(`#${name}View`).classList.toggle("hidden", name !== view));
  $$(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

const streams = [
  {name:"anwar_live", title:"Building a new community 🚀", category:"Just Chatting", language:"English", viewers:"1.2K", avatar:"A", color:"blue", thumb:"thumb-one", art:"D&T", artSub:"LIVE", duration:"01:24:08"},
  {name:"gamezone", title:"Late night gaming session", category:"Gaming", language:"English", viewers:"846", avatar:"G", color:"cyan", thumb:"thumb-two", art:"GAME<br>ZONE", artSub:"", duration:"00:48:32"},
  {name:"music_room", title:"Chill music and requests", category:"Music", language:"Kazakh", viewers:"320", avatar:"M", color:"slate", thumb:"thumb-three", art:"SOUND<br>SPACE", artSub:"", duration:"02:06:14"}
];
function cardMarkup(s) {
  return `<article class="stream-card" data-search="${(s.name+" "+s.title+" "+s.category).toLowerCase()}" data-category="${s.category}">
    <button class="stream-thumb ${s.thumb}" data-stream="${s.name}" aria-label="Open ${s.name} stream">
      <span class="thumb-badge"><i></i> LIVE</span><span class="thumb-art">${s.art}${s.artSub?`<span>${s.artSub}</span>`:""}</span><span class="thumb-duration">${s.duration}</span>
    </button>
    <div class="stream-info"><span class="avatar ${s.color}">${s.avatar}</span><div class="stream-meta"><b>${s.name}</b><span>${s.title}</span><small>${s.category} · ${s.language}</small></div><button class="more-btn" aria-label="More options">···</button></div>
    <div class="stream-foot"><span class="category-tag">${s.category}</span><span>◉ ${s.viewers} viewers</span></div>
  </article>`;
}
$("#browseGrid").innerHTML = streams.map(cardMarkup).join("");
function attachStreamActions(){
  $$("[data-stream]").forEach(btn => btn.addEventListener("click", () => toast(`"${btn.dataset.stream}" channel preview — LIVE server will be connected in a later version.`)));
}
attachStreamActions();
$$("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
  $$(".filter-chip").forEach(x => x.classList.remove("selected"));
  btn.classList.add("selected");
  const filter = btn.dataset.filter;
  $$("#browseGrid .stream-card").forEach(card => card.classList.toggle("hidden", filter !== "All" && card.dataset.category !== filter));
}));
$$("[data-category]").forEach(btn => btn.addEventListener("click", () => {
  showView("browse");
  const target = $$("[data-filter]").find(x => x.dataset.filter === btn.dataset.category);
  if (target) target.click();
}));
$("#searchInput").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const cards = $$("#streamGrid .stream-card, #browseGrid .stream-card");
  cards.forEach(card => card.classList.toggle("hidden", q && !card.dataset.search.includes(q)));
  if (q) showView("browse");
  if (!q) $$("#browseGrid .stream-card").forEach(card => card.classList.remove("hidden"));
});

$("#authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#password").value;
  const displayName = $("#displayName").value.trim();
  const message = $("#authMessage");
  if (authMode === "signup" && !displayName) { message.textContent = "Please enter a display name."; return; }
  if (!supabaseClient) {
    message.textContent = "Demo mode: add your Supabase URL and anon key in app.js to enable real accounts.";
    return;
  }
  $("#authSubmit").disabled = true;
  $("#authSubmit").textContent = "Please wait…";
  try {
    if (authMode === "signup") {
      const { error } = await supabaseClient.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } }
      });
      if (error) throw error;
      message.textContent = "Account created. Check your email if confirmation is enabled.";
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      message.textContent = "You are logged in!";
      toast("Welcome back to DEADLINE & TARTIP.");
      setTimeout(closeAuth, 900);
      updateSession();
    }
  } catch (error) {
    message.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    $("#authSubmit").disabled = false;
    $("#authSubmit").textContent = authMode === "signup" ? "Create account" : "Log in";
  }
});

async function updateSession() {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) {
    $("#profileButton").style.display = "grid";
    $("#profileButton").textContent = (session.user.user_metadata?.display_name || session.user.email || "U").slice(0,1).toUpperCase();
    $("#loginBtn").classList.add("hidden");
    $("#signupBtn").classList.add("hidden");
  }
}
$("#profileButton").addEventListener("click", async () => {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (!error) {
    $("#profileButton").style.display = "none";
    $("#loginBtn").classList.remove("hidden");
    $("#signupBtn").classList.remove("hidden");
    toast("You have been logged out.");
  }
});
if (supabaseClient) {
  updateSession();
  supabaseClient.auth.onAuthStateChange(() => updateSession());
}
