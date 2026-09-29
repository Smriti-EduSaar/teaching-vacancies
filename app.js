/*
 * Smriti EduSar Teaching Vacancy Portal
 * Configure DATA_URL with your Apps Script web-app URL after deployment.
 * This public script must never contain passwords, API keys, or private tokens.
 */
const DATA_URL = ""; // Example: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"

const sampleVacancies = [
  {
    id: "DEMO-001",
    organisation: "Sample Recruiting Organisation",
    post: "TGT",
    subject: "Social Science",
    locationType: "Central",
    state: "India",
    vacancyCount: "See official notice",
    lastDate: "",
    status: "Upcoming",
    eligibilitySummary: "Demonstration record only. Replace this with details verified from an official notification.",
    notificationUrl: "",
    applyUrl: "",
    lastVerified: "",
    isDemo: true
  }
];

const $ = (id) => document.getElementById(id);
let vacancies = [];

function safeText(value, fallback = "Not stated in verified data") {
  const text = String(value ?? "").trim();
  return text || fallback;
}
function normaliseStatus(value) {
  const s = String(value || "").trim().toLowerCase();
  if (s === "open") return "Open";
  if (s === "upcoming") return "Upcoming";
  if (s === "closed") return "Closed";
  if (s === "result released") return "Result Released";
  return "Status to be confirmed";
}
function validHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch (_) { return false; }
}
function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function makeLink(label, url, className) {
  if (!validHttpUrl(url)) return null;
  const a = makeElement("a", className, label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}
function formatDate(value) {
  if (!value) return "Check official notice";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {day:"2-digit", month:"short", year:"numeric", timeZone:"Asia/Kolkata"}).format(date);
}
function createCard(v) {
  const card = makeElement("article", "vacancy-card");
  const top = makeElement("div", "card-top");
  const titleWrap = makeElement("div");
  titleWrap.append(makeElement("h3", "", `${safeText(v.post, "Teaching post")}${v.subject ? " — " + v.subject : ""}`));
  titleWrap.append(makeElement("p", "org", safeText(v.organisation)));
  top.append(titleWrap);
  const status = normaliseStatus(v.status);
  const badgeClass = status.toLowerCase().replaceAll(" ", "-");
  top.append(makeElement("span", `badge ${badgeClass}`, status));
  card.append(top);

  const tags = makeElement("div", "tags");
  tags.append(makeElement("span", "tag", safeText(v.locationType, "Location not stated")));
  if (v.state) tags.append(makeElement("span", "tag", v.state));
  if (v.vacancyCount) tags.append(makeElement("span", "tag", `Vacancies: ${v.vacancyCount}`));
  card.append(tags);

  card.append(makeElement("p", "summary", safeText(v.eligibilitySummary, "Read the official notification for eligibility details.")));

  const facts = makeElement("div", "facts");
  const deadline = makeElement("div", "fact");
  deadline.append(makeElement("span", "", "Last date"));
  deadline.append(makeElement("strong", "", formatDate(v.lastDate)));
  const checked = makeElement("div", "fact");
  checked.append(makeElement("span", "", "Last verified"));
  checked.append(makeElement("strong", "", formatDate(v.lastVerified)));
  facts.append(deadline, checked);
  card.append(facts);

  const bottom = makeElement("div", "card-bottom");
  bottom.append(makeElement("span", "verified", v.isDemo ? "DEMO RECORD — not a real vacancy" : "Verify details in the official notice"));
  const links = makeElement("div", "tags");
  const notice = makeLink("Official notice ↗", v.notificationUrl, "button button-secondary");
  const apply = makeLink("Apply online ↗", v.applyUrl, "button button-primary");
  if (notice) links.append(notice);
  if (apply) links.append(apply);
  if (!notice && !apply) links.append(makeElement("span", "muted small", "Official links not yet added"));
  bottom.append(links);
  card.append(bottom);
  return card;
}
function matches(v, query, post, type, status) {
  const haystack = [v.organisation,v.post,v.subject,v.locationType,v.state,v.eligibilitySummary].join(" ").toLowerCase();
  return (!query || haystack.includes(query)) &&
    (!post || String(v.post || "").toUpperCase() === post.toUpperCase()) &&
    (!type || String(v.locationType || "").toLowerCase() === type.toLowerCase()) &&
    (!status || normaliseStatus(v.status).toLowerCase() === status.toLowerCase());
}
function render() {
  const query = $("search").value.trim().toLowerCase();
  const post = $("post-filter").value;
  const type = $("type-filter").value;
  const status = $("status-filter").value;
  const filtered = vacancies.filter(v => matches(v, query, post, type, status));
  const list = $("vacancy-list");
  list.replaceChildren(...filtered.map(createCard));
  $("result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "vacancy" : "vacancies"}`;
  $("empty-state").classList.toggle("hidden", filtered.length > 0);
  $("notice").classList.toggle("hidden", filtered.length > 0);
  if (filtered.length === 0) $("notice").textContent = "No vacancies match these filters.";
}
function validRecord(v) {
  return v && typeof v === "object" && v.organisation && v.post && v.status;
}
async function loadVacancies() {
  const notice = $("notice");
  if (!DATA_URL) {
    vacancies = sampleVacancies;
    $("last-updated").textContent = "Demo mode. Connect the approved Google Sheets data feed to publish real vacancies.";
    notice.textContent = "This is a demonstration record, not a real vacancy. No live recruitment data is connected yet.";
    render();
    return;
  }
  try {
    const response = await fetch(DATA_URL, {method:"GET", cache:"no-store"});
    if (!response.ok) throw new Error("The data service returned an error.");
    const data = await response.json();
    const records = Array.isArray(data) ? data : data.vacancies;
    if (!Array.isArray(records)) throw new Error("The data format was not recognised.");
    vacancies = records.filter(validRecord).filter(v => v.reviewStatus === "Approved" || v.approved === true);
    $("last-updated").textContent = data.generatedAt ? `Data refreshed: ${formatDate(data.generatedAt)}` : "Showing approved published records.";
    notice.textContent = vacancies.length ? "Vacancies below have been approved for publication. Always verify the official notice." : "No approved vacancies are currently published.";
    render();
  } catch (error) {
    vacancies = [];
    $("last-updated").textContent = "The vacancy feed could not be reached.";
    notice.className = "notice error";
    notice.textContent = "We could not load the vacancy list. Please try again later and check the official recruitment websites directly.";
    $("result-count").textContent = "0 vacancies";
    $("vacancy-list").replaceChildren();
    $("empty-state").classList.add("hidden");
  }
}
["search","post-filter","type-filter","status-filter"].forEach(id => $(id).addEventListener("input", render));
$("clear-filters").addEventListener("click", () => {
  $("search").value = "";
  $("post-filter").value = "";
  $("type-filter").value = "";
  $("status-filter").value = "";
  render();
});
loadVacancies();
