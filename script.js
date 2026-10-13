const layerData = {
  main: {
    label: "Analysed layer",
    title: "Main Story",
    subtitle: "Plot-oriented characterisation",
    register: "Technical and combat-oriented language positions Xavier primarily as an actor within the central plot.",
    tags: ["philos", "sword", "backtrackers", "magnetic", "flux"],
    func: "Establishes Xavier within the game’s central world, conflict and relational framework.",
    search: "philos"
  },
  anecdote: {
    label: "Analysed layer",
    title: "Anecdote",
    subtitle: "Retrospective knowledge",
    register: "Retrospective description and third-person reference frame Xavier through testimony, memory and past identity.",
    tags: ["frank", "man", "hunter", "young"],
    func: "Offers indirect knowledge of Xavier through recollection and background rather than immediate romantic address.",
    search: "hunter"
  },
  card: {
    label: "Analysed layer",
    title: "Card Story",
    subtitle: "Heightened romantic register",
    register: "The selected sample concentrates ceremonial and archaic diction, marking the encounter as exceptional rather than routine.",
    tags: ["shall", "house", "lady", "phisse", "heir"],
    func: "Creates paid, unlockable scenes of heightened intimacy that place Xavier in unusually concentrated romantic situations.",
    search: "shall"
  },
  messages: {
    label: "Analysed layer",
    title: "Text Messages",
    subtitle: "Everyday digital intimacy",
    register: "Informal typing abbreviations and asynchronous phrasing move the interaction toward low-stakes everyday communication.",
    tags: ["robot", "letter", "companionship", "ur"],
    func: "Places Xavier inside a communication form associated with ordinary, repeated contact rather than bounded narrative events.",
    search: "ur"
  },
  whisper: {
    label: "Analysed layer",
    title: "Whisper / Companionship",
    subtitle: "Sensory and relational presence",
    register: "Concrete sensory vocabulary foregrounds touch, temperature, objects and shared physical surroundings.",
    tags: ["hot", "snow", "hand", "bracelet", "fluffy"],
    func: "Shifts attention away from plot progression toward proximity, sensory detail and simulated co-presence.",
    search: "snow"
  },
  calls: {
    label: "Analysed layer",
    title: "Calls",
    subtitle: "Conversational immediacy",
    register: "Shorter conversational exchanges reproduce the rhythm of spontaneous everyday talk.",
    tags: ["shooting", "video", "game", "script"],
    func: "Simulates direct communication and reinforces the sense that the character remains available outside major story events.",
    search: "game"
  },
  battle: {
    label: "Beyond analysed corpus",
    title: "Battle Voices",
    subtitle: "Situational character encounter",
    register: "Not systematically analysed in the present corpus.",
    tags: ["combat", "situational", "voice"],
    func: "Battle voice lines also contribute to character presence, but this smaller-scale material lies outside the selected analytical sample.",
    search: ""
  },
  beyond: {
    label: "Beyond analysed corpus",
    title: "Other Encounters",
    subtitle: "An open narrative system",
    register: "Not exhaustively catalogued in this study.",
    tags: ["battle voices", "situational dialogue", "other interactions"],
    func: "The analysed layers are a selected case-study sample of a wider live-service character system rather than a closed taxonomy.",
    search: ""
  }
};

function setLayer(key){
  const d = layerData[key];
  if(!d) return;
  const zh = window.currentLanguage === "zh" && window.siteLocale?.copy.layer[key];

  document.querySelectorAll(".layer-node").forEach(btn => {
    btn.classList.toggle("active-layer", btn.dataset.layer === key);
  });

  document.getElementById("layer-label").textContent = zh ? zh[0] : d.label;
  document.getElementById("layer-title").textContent = zh ? zh[1] : d.title;
  document.getElementById("layer-subtitle").textContent = zh ? zh[2] : d.subtitle;
  document.getElementById("layer-function").textContent = zh ? zh[4] : d.func;
  document.getElementById("layer-register").textContent = zh ? zh[3] : d.register;

  const tags = document.getElementById("layer-tags");
  tags.innerHTML = "";
  d.tags.forEach(tag => {
    const el = document.createElement("span");
    el.textContent = tag;
    tags.appendChild(el);
  });

  const explore = document.getElementById("explore-layer");
  explore.dataset.search = d.search || "";
  explore.disabled = !d.search;
  explore.style.opacity = d.search ? "1" : ".45";
}

document.querySelectorAll(".layer-node").forEach(btn => {
  btn.addEventListener("click", () => setLayer(btn.dataset.layer));
});

document.querySelectorAll(".concept-node").forEach(btn => {
  ["mouseenter","focus","click"].forEach(evt => {
    btn.addEventListener(evt, () => {
      document.getElementById("concept-caption").textContent = btn.dataset.concept;
    });
  });
});

// Corpus Explorer.
// The full textual corpus used in this study is loaded from corpus-data.js.
// Search results are rendered as short keyword-in-context (KWIC) windows rather than full transcripts.
const corpusDocs = window.CORPUS_DOCS || [];

const input = document.getElementById("corpus-search");
const filter = document.getElementById("layer-filter");
const results = document.getElementById("search-results");
const count = document.getElementById("result-count");

function escapeRegExp(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHTML(str){
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlight(text, query){
  if(!query) return escapeHTML(text);
  const safe = escapeHTML(text);
  const re = new RegExp(`(${escapeRegExp(escapeHTML(query))})`, "ig");
  return safe.replace(re, "<mark>$1</mark>");
}

function renderEmpty(message){
  results.innerHTML = `<div class="empty-state"><span class="sparkle">✦</span><p>${message}</p></div>`;
}

function normaliseForSearch(text){
  return text.replace(/\s+/g, " ").trim();
}

function kwicMatches(doc, query, contextChars = 115){
  const clean = normaliseForSearch(doc.text);
  const lower = clean.toLowerCase();
  const needle = query.toLowerCase();
  const items = [];

  let pos = 0;
  while((pos = lower.indexOf(needle, pos)) !== -1){
    const left = Math.max(0, pos - contextChars);
    const right = Math.min(clean.length, pos + query.length + contextChars);

    let snippet = clean.slice(left, right).trim();
    if(left > 0) snippet = "… " + snippet;
    if(right < clean.length) snippet = snippet + " …";

    items.push({
      layer: doc.layer,
      source: doc.source,
      text: snippet
    });

    pos += Math.max(needle.length, 1);
  }
  return items;
}

function runSearch(){
  const q = input.value.trim();
  const f = filter.value;
  const zh = window.currentLanguage === "zh";
  const copy = window.siteLocale?.copy.search;

  if(!corpusDocs.length){
    count.textContent = zh ? "语料数据无法加载。" : "Corpus data could not be loaded.";
    renderEmpty(zh ? copy.missing : "The corpus dataset is unavailable. Check that corpus-data.js is in the same folder as index.html.");
    return;
  }

  if(!q){
    count.textContent = zh ? copy.connected(corpusDocs.length) : `Corpus connected: ${corpusDocs.length} narrative-layer files.`;
    renderEmpty(zh ? copy.prompt : "Search a word or phrase to view short keyword-in-context traces across the analysed corpus.");
    return;
  }

  const selectedDocs = corpusDocs.filter(doc => f === "all" || doc.layer === f);
  const matched = selectedDocs.flatMap(doc => kwicMatches(doc, q));
  const displayLimit = 60;
  const visible = matched.slice(0, displayLimit);

  if(!matched.length){
    count.textContent = zh ? `未找到“${q}”的匹配项。` : `No occurrences found for “${q}”.`;
    renderEmpty(zh ? copy.none : "No matching occurrences were found in the selected corpus layer.");
    return;
  }

  count.textContent = zh ? copy.count(matched.length, q, matched.length > displayLimit ? displayLimit : 0)
    : `${matched.length} occurrence${matched.length === 1 ? "" : "s"} found for “${q}”`
      + (matched.length > displayLimit ? ` · showing first ${displayLimit}` : "");

  results.innerHTML = visible.map(item => `
    <article class="result-card">
      <div class="result-kicker">${escapeHTML(zh ? (copy.layer[item.layer] || item.layer) : item.layer)} · ${escapeHTML(item.source)}</div>
      <p>${highlight(item.text, q)}</p>
    </article>
  `).join("");
}

input.addEventListener("input", runSearch);
filter.addEventListener("change", runSearch);
document.addEventListener("languagechange", () => {
  runSearch();
  setLayer(document.querySelector(".layer-node.active-layer")?.dataset.layer || "main");
});

document.getElementById("explore-layer").addEventListener("click", e => {
  const q = e.currentTarget.dataset.search;
  if(!q) return;
  input.value = q;
  filter.value = "all";
  runSearch();
  document.getElementById("text").scrollIntoView({behavior:"smooth"});
});

// Initialise corpus status on page load.
runSearch();

// Navigation state.
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main > section[id]")];

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, {threshold:.35});

sections.forEach(section => navObserver.observe(section));

// Gentle reveal animation.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.12});

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

setLayer("main");
