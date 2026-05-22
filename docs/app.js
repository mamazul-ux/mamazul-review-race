// Mamazul Review Race - PWA Core Application Logic

const DEFAULT_SPREADSHEET_ID = "1tcZ9rvGwqkzOPEESU4dGMEx0hxxXThQBNg6NM7wU6kA";
const DEFAULT_SHEET_NAME = "Monthly Totals";

// Seeded local database compiled from live sheet cache to enable instant offline loading
const SEEDED_MENTIONS = [
  { id: 1, serverName: "Antonio", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 2, serverName: "Gabriel", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 3, serverName: "Gustavo", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 4, serverName: "Gustavo", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 5, serverName: "Gustavo", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 6, serverName: "Gustavo", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 7, serverName: "Gustavo", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 8, serverName: "Gustavo", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 9, serverName: "Gustavo", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 10, serverName: "Gustavo", monthStr: "2026-05-11", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 11, serverName: "Gustavo", monthStr: "2026-05-15", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 12, serverName: "Gustavo", monthStr: "2026-05-20", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 13, serverName: "Heavenly", monthStr: "2026-04-29", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 14, serverName: "Ivan", monthStr: "2026-04-13", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 15, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 16, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 17, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 18, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 19, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 20, serverName: "Ivan", monthStr: "2026-04-25", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 21, serverName: "Ivan", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 22, serverName: "Ivan", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 23, serverName: "Ivan", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 24, serverName: "Ivan", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 25, serverName: "Ivan", monthStr: "2026-05-07", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 26, serverName: "Ivan", monthStr: "2026-05-16", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 27, serverName: "Ivan", monthStr: "2026-04-24", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 28, serverName: "Ivan", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 29, serverName: "Ivan", monthStr: "2026-05-10", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 30, serverName: "Jordan", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 31, serverName: "Jordan", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 32, serverName: "Kevin", monthStr: "2026-04-24", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 33, serverName: "Kevin", monthStr: "2026-04-24", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 34, serverName: "Kevin", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 35, serverName: "Lian", monthStr: "2026-05-12", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 36, serverName: "Luis", monthStr: "2026-04-28", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 37, serverName: "Luis", monthStr: "2026-04-30", year: 2026, monthValue: 4, mentionsCount: 1 },
  { id: 38, serverName: "Luis", monthStr: "2026-05-02", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 39, serverName: "Rodrigo", monthStr: "2026-05-08", year: 2026, monthValue: 5, mentionsCount: 1 },
  { id: 40, serverName: "Valentina", monthStr: "2026-05-15", year: 2026, monthValue: 5, mentionsCount: 1 }
];

// Application State
let state = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  sheetName: DEFAULT_SHEET_NAME,
  allMentions: SEEDED_MENTIONS,
  selectedMonth: 5, // May
  selectedYear: 2026,
  selectedWaiter: null,
  isSyncing: false,
  errorMessage: null,
  lastSyncSuccess: true,
  lastSyncTime: Date.now(),
  lastSyncMessage: "Loaded seeded local database successfully.",
  activeTab: "dashboard" // dashboard, monthly, yearly, bonus, settings
};

// Error Catching Pipeline to show errors gracefully in UI
window.onerror = function (message, source, lineno, colno, error) {
  const errBox = document.getElementById("global-error-box");
  if (errBox) {
    errBox.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <div class="flex-1">
          <p class="text-xs font-bold text-red-800">Console Error Intercepted</p>
          <p class="text-[11px] text-red-700 mt-0.5">${message} (${source}:${lineno})</p>
        </div>
      </div>
    `;
    errBox.classList.remove("hidden");
  }
  return false;
};

// SVG Icons mapping for accessibility & fast offline render
const ICONS = {
  leaderboard: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/></svg>',
  calendar: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>',
  analytics: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>',
  premium: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.99L19.53 19H4.47L12 5.99zM12 11c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>',
  settings: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>'
};

// Life Cycle Initializer
function init() {
  loadFromStorage();
  setupEventListeners();
  renderApp();
  
  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker Registered!', reg.scope))
      .catch(err => console.error('Service Worker Registration Failed:', err));
  }

  // Auto-sync if cache have never sync successfully
  const neverSynced = !localStorage.getItem("mamazul_syncMetadata");
  if (neverSynced && !state.isSyncing) {
    syncFromSheet();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// CSV RFC 4180 Standard Parser
function parseCSV(text) {
  let p = '', r = [];
  let q = false;
  let row = [''];
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    let next = text[i + 1];
    if (c === '"') {
      if (q && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (c === ',' && !q) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !q) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      r.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  r.push(row);
  return r.filter(row => row.some(cell => cell.trim().length > 0));
}

// Accent & Title Case Name Normalization
function normalizeName(name) {
  if (!name) return "";
  return name.trim()
    .replace(/Iv\u00e1n/g, "Ivan") // Iván -> Ivan
    .replace(/Ivan/g, "Ivan")
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Date conversion utilities
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getMonthName(m) {
  return MONTH_NAMES[m - 1] || "May";
}

function formatDate(epoch) {
  if (!epoch) return "Never";
  const date = new Date(epoch);
  const options = { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

// Local Storage Handlers
function saveToStorage() {
  localStorage.setItem("mamazul_spreadsheetId", state.spreadsheetId);
  localStorage.setItem("mamazul_sheetName", state.sheetName);
  localStorage.setItem("mamazul_allMentions", JSON.stringify(state.allMentions));
  localStorage.setItem("mamazul_syncMetadata", JSON.stringify({
    lastSyncSuccess: state.lastSyncSuccess,
    lastSyncTime: state.lastSyncTime,
    lastSyncMessage: state.lastSyncMessage
  }));
}

// Try loading from storage
function loadFromStorage() {
  state.spreadsheetId = localStorage.getItem("mamazul_spreadsheetId") || DEFAULT_SPREADSHEET_ID;
  state.sheetName = localStorage.getItem("mamazul_sheetName") || DEFAULT_SHEET_NAME;
  
  const mentionsRaw = localStorage.getItem("mamazul_allMentions");
  if (mentionsRaw) {
    try { 
      state.allMentions = JSON.parse(mentionsRaw); 
    } catch(e) { 
      state.allMentions = SEEDED_MENTIONS; 
    }
  } else {
    state.allMentions = SEEDED_MENTIONS;
  }

  const syncMetaRaw = localStorage.getItem("mamazul_syncMetadata");
  if (syncMetaRaw) {
    try {
      const meta = JSON.parse(syncMetaRaw);
      state.lastSyncSuccess = meta.lastSyncSuccess !== undefined ? meta.lastSyncSuccess : true;
      state.lastSyncTime = meta.lastSyncTime || Date.now();
      state.lastSyncMessage = meta.lastSyncMessage || "Seeded local database configured successfully.";
    } catch(e) {
      state.lastSyncSuccess = true;
      state.lastSyncTime = Date.now();
      state.lastSyncMessage = "Seeded local database configured successfully.";
    }
  } else {
    state.lastSyncSuccess = true;
    state.lastSyncTime = Date.now();
    state.lastSyncMessage = "Seeded local database configured successfully.";
  }
}

// Settings Update
function updateSettings(id, name) {
  state.spreadsheetId = id.trim();
  state.sheetName = name.trim();
  saveToStorage();
  syncFromSheet(); // Auto-re-sync on connection change
}

function resetSettings() {
  state.spreadsheetId = DEFAULT_SPREADSHEET_ID;
  state.sheetName = DEFAULT_SHEET_NAME;
  saveToStorage();
  syncFromSheet();
}

// Sheets Live Downloader & Parsing Pipeline
async function syncFromSheet() {
  if (state.isSyncing) return;
  
  state.isSyncing = true;
  state.errorMessage = null;
  renderApp(); // Rerender loading state

  try {
    const encodedTab = encodeURIComponent(state.sheetName);
    const url = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodedTab}`;
    console.log("Fetching PWA sheets data from URL: ", url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 PWA Browser Client'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    if (!csvText || csvText.length < 5) {
      throw new Error("Received empty or corrupt data from spreadsheet. Check sheet connection settings.");
    }

    const parsedRows = parseCSV(csvText);
    if (parsedRows.length <= 1) {
      throw new Error(`No mentions rows could be recovered from sheet '${state.sheetName}'.`);
    }

    const headers = parsedRows[0].map(h => h.trim().toLowerCase());
    const serverIdx = headers.findIndex(h => h === "server_name" || h === "server");
    const monthIdx = headers.findIndex(h => h === "month" || h === "date");
    const mentionsIdx = headers.findIndex(h => h === "mentions" || h === "mentions_count");

    const fallbackMode = serverIdx === -1 || monthIdx === -1 || mentionsIdx === -1;
    const dateRegex = /(\d{4})-(\d{2})/;

    const fetchedMentions = [];

    for (let i = 1; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      if (!row || row.length === 0) continue;

      const rawServer = fallbackMode ? (row[0] || "") : (row[serverIdx] || "");
      const rawMonth = fallbackMode ? (row[1] || "") : (row[monthIdx] || "");
      const rawMentions = fallbackMode ? (row[2] || "") : (row[mentionsIdx] || "");

      const cleanServer = normalizeName(rawServer);
      if (!cleanServer || cleanServer.toLowerCase() === "server_name") continue;

      const cleanMonth = rawMonth.trim();
      let year = 2026;
      let monthValue = 5;

      const matchYMD = /(\d{4})-(\d{2})/.exec(cleanMonth);
      const matchDMY = /(\d{2})-(\d{2})-(\d{4})/.exec(cleanMonth);

      if (matchYMD) {
        year = parseInt(matchYMD[1]) || 2026;
        monthValue = parseInt(matchYMD[2]) || 5;
      } else if (matchDMY) {
        year = parseInt(matchDMY[3]) || 2026;
        monthValue = parseInt(matchDMY[2]) || 5;
      } else {
        try {
          const parsedDate = new Date(cleanMonth);
          if (!isNaN(parsedDate.getTime())) {
            year = parsedDate.getFullYear();
            monthValue = parsedDate.getMonth() + 1;
          }
        } catch (e) {}
      }

      const mentionsCount = parseInt(rawMentions) || 1;

      fetchedMentions.push({
        id: i,
        serverName: cleanServer,
        monthStr: `${year}-${String(monthValue).padStart(2, '0')}`,
        year: year,
        monthValue: monthValue,
        mentionsCount: mentionsCount
      });
    }

    if (fetchedMentions.length === 0) {
      throw new Error("Filtered spreadsheet results yielded zero active rows.");
    }

    // Success state update
    state.allMentions = fetchedMentions;
    state.lastSyncSuccess = true;
    state.lastSyncTime = Date.now();
    state.lastSyncMessage = `Synchronized ${fetchedMentions.length} mentions successfully!`;
    state.errorMessage = null;

  } catch (err) {
    console.error("Sheets PWA sync failed: ", err);
    state.errorMessage = err.message || "Failed to contact Sheets endpoint. Confirm accessibility.";
    state.lastSyncSuccess = false;
    state.lastSyncTime = Date.now();
    state.lastSyncMessage = `Sync failed: ${state.errorMessage}`;
  } finally {
    state.isSyncing = false;
    saveToStorage();
    renderApp();
  }
}

// Data Aggregation Engine
function getFilteredMonthlyScores(month, year) {
  const filtered = state.allMentions.filter(m => m.year === year && m.monthValue === month);
  const scoresMap = {};
  
  filtered.forEach(m => {
    scoresMap[m.serverName] = (scoresMap[m.serverName] || 0) + m.mentionsCount;
  });

  return Object.entries(scoresMap)
    .map(([serverName, totalMentions]) => ({ serverName, totalMentions }))
    .sort((a, b) => b.totalMentions - a.totalMentions)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

function getFilteredYearlyScores(year) {
  const filtered = state.allMentions.filter(m => m.year === year);
  const scoresMap = {};
  
  filtered.forEach(m => {
    scoresMap[m.serverName] = (scoresMap[m.serverName] || 0) + m.mentionsCount;
  });

  return Object.entries(scoresMap)
    .map(([serverName, totalMentions]) => ({ serverName, totalMentions }))
    .sort((a, b) => b.totalMentions - a.totalMentions)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

// Bonus calculator list helper (monthly bonus is for top waiter with >0 mentions)
function getYearlyBonusWinners(year) {
  const winners = [];
  for (let m = 1; m <= 12; m++) {
    const scores = getFilteredMonthlyScores(m, year);
    if (scores.length > 0) {
      winners.push({
        monthValue: m,
        monthName: getMonthName(m),
        serverName: scores[0].serverName,
        totalMentions: scores[0].totalMentions,
        bonusAmount: "$1,500 MXN"
      });
    }
  }
  return winners.reverse(); // Newest first
}

// Get single waiter performance milestones
function getWaiterMilestones(serverName) {
  const waiterMentions = state.allMentions.filter(m => m.serverName === serverName);
  const monthData = {};

  waiterMentions.forEach(m => {
    const label = `${getMonthName(m.monthValue).slice(0, 3)} ${m.year}`;
    monthData[label] = (monthData[label] || 0) + m.mentionsCount;
  });

  return Object.entries(monthData).map(([dateLabel, count]) => ({ dateLabel, count }));
}

// UI Event Handlers
function setupEventListeners() {
  // Main Tab Navigation items
  document.querySelectorAll(".tab-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tabId = e.currentTarget.dataset.tab;
      switchTab(tabId);
    });
  });

  // Global Header Sync trigger
  document.getElementById("btn-sync-header").addEventListener("click", () => {
    syncFromSheet();
  });

  // Modal backdrop closer
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop" || e.target.id === "btn-close-modal") {
      closeModal();
    }
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update visual active classes in footer navigation
  document.querySelectorAll(".tab-item").forEach(btn => {
    const activeIcon = btn.querySelector(".active-indicator");
    const label = btn.querySelector("span");
    
    if (btn.dataset.tab === tabId) {
      btn.classList.add("text-[#E07A5F]");
      btn.classList.remove("text-[#3D405B]/40");
      if (activeIcon) activeIcon.classList.remove("hidden");
    } else {
      btn.classList.remove("text-[#E07A5F]");
      btn.classList.add("text-[#3D405B]/40");
      if (activeIcon) activeIcon.classList.add("hidden");
    }
  });

  renderApp();
}

function showModal(serverName) {
  const filtered = state.allMentions.filter(m => m.serverName === serverName);
  const total = filtered.reduce((acc, m) => acc + m.mentionsCount, 0);
  const yearlyRank = getFilteredYearlyScores(state.selectedYear).find(w => w.serverName === serverName)?.rank || "N/A";
  
  state.selectedWaiter = {
    serverName,
    totalMentions: total,
    yearlyRank,
    milestones: getWaiterMilestones(serverName)
  };

  const backdrop = document.getElementById("modal-backdrop");
  backdrop.classList.remove("hidden");
  backdrop.classList.add("flex");
  
  const card = document.getElementById("modal-card");
  setTimeout(() => {
    card.classList.remove("translate-y-full");
    card.classList.add("translate-y-0");
  }, 10);

  renderWaiterModal();
}

function closeModal() {
  const card = document.getElementById("modal-card");
  card.classList.remove("translate-y-0");
  card.classList.add("translate-y-full");
  
  setTimeout(() => {
    const backdrop = document.getElementById("modal-backdrop");
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    state.selectedWaiter = null;
  }, 300);
}

// Dynamic Rendering Core Router
function renderApp() {
  renderSyncStatus();
  renderErrorMessage();

  const container = document.getElementById("tab-view-container");
  container.innerHTML = ""; // Clear existing

  if (state.activeTab === "dashboard") {
    renderDashboardView(container);
  } else if (state.activeTab === "monthly") {
    renderMonthlyRaceView(container);
  } else if (state.activeTab === "yearly") {
    renderYearlyRaceView(container);
  } else if (state.activeTab === "bonus") {
    renderBonusWinnersView(container);
  } else if (state.activeTab === "settings") {
    renderSettingsView(container);
  }
}

// Subrenderers
function renderSyncStatus() {
  const dot = document.getElementById("sync-dot");
  const text = document.getElementById("sync-text");
  const syncBtn = document.getElementById("btn-sync-header");

  if (state.isSyncing) {
    dot.className = "w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping";
    text.textContent = "SYNCING";
    syncBtn.classList.add("animate-spin");
  } else if (state.lastSyncSuccess) {
    dot.className = "w-2.5 h-2.5 rounded-full bg-green-500";
    text.textContent = "SYNCED";
    syncBtn.classList.remove("animate-spin");
  } else {
    dot.className = "w-2.5 h-2.5 rounded-full bg-red-500";
    text.textContent = "DISCONNECTED";
    syncBtn.classList.remove("animate-spin");
  }
}

function renderErrorMessage() {
  const errBox = document.getElementById("global-error-box");
  if (state.errorMessage) {
    errBox.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <div class="flex-1">
          <p class="text-xs font-bold text-red-800">Connection Error</p>
          <p class="text-[11px] text-red-700 mt-0.5">${state.errorMessage}</p>
        </div>
      </div>
    `;
    errBox.classList.remove("hidden");
  } else {
    errBox.innerHTML = "";
    errBox.classList.add("hidden");
  }
}

function renderDashboardView(parent) {
  const scores = getFilteredMonthlyScores(state.selectedMonth, state.selectedYear);
  const topThree = scores.slice(0, 3);
  const remaining = scores.slice(3);

  // If syncing and empty state
  if (state.isSyncing && scores.length === 0) {
    parent.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-12">
        <div class="w-12 h-12 rounded-full border-4 border-[#E07A5F] border-t-transparent animate-spin mb-4"></div>
        <p class="text-sm font-bold text-[#3D405B]/60 text-center animate-pulse">Syncing with Mamazul Google Sheet...</p>
      </div>
    `;
    return;
  }

  // Pure Empty State
  if (scores.length === 0) {
    parent.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2rem] border border-[#F2CC8F]/20">
        <div class="w-20 h-20 rounded-full bg-[#FFF9F2] flex items-center justify-center mb-6 border-2 border-[#F2CC8F]">
          <span class="text-3xl text-[#E07A5F]">☀️</span>
        </div>
        <h3 class="text-lg font-black text-[#3D405B]">No Mentions for ${getMonthName(state.selectedMonth)} ${state.selectedYear}</h3>
        <p class="text-xs text-[#3D405B]/65 max-w-[260px] mt-2 leading-relaxed">Let's edit connection options in the Settings tab or trigger a synchronization with Google Sheets!</p>
        <button id="empty-state-sync" class="mt-6 px-6 py-2.5 bg-[#E07A5F] text-white text-xs font-black rounded-full shadow-md active:scale-95 transition-transform">SYNC DATA NOW</button>
      </div>
    `;
    document.getElementById("empty-state-sync").addEventListener("click", syncFromSheet);
    return;
  }

  // Dashboard structure
  let dashboardHtml = `
    <div class="flex flex-col gap-6">
      <!-- Title banner & Mini filter tag -->
      <div class="flex justify-between items-center px-2">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">CURRENT PRESTIGE SECTION</p>
          <h2 class="text-lg font-black text-[#3D405B]">${getMonthName(state.selectedMonth).toUpperCase()} ${state.selectedYear} CHAMPIONS</h2>
        </div>
        <div class="px-3 py-1 bg-[#81B29A]/15 text-[#81B29A] text-[9px] font-black rounded-full border border-[#81B29A]/20">
          ${scores.length} ACTIVATED
        </div>
      </div>

      <!-- Spotlight Podium Visual Component -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col">
        <h3 class="text-[10px] font-black uppercase tracking-[0.15em] text-[#3D405B]/50 mb-6 text-center">🏆 SECTOR HIGHLIGHT PODIUM</h3>
        
        <div class="flex items-end justify-center gap-4 min-h-[190px] pt-4">
  `;

  // Place 2nd
  if (topThree[1]) {
    dashboardHtml += `
      <div onclick="showModal('${topThree[1].serverName}')" class="flex flex-col items-center w-20 cursor-pointer group">
        <div class="relative mb-2">
          <div class="w-12 h-12 rounded-full border-2 border-[#81B29A] bg-[#81B29A]/15 flex items-center justify-center text-lg font-bold text-[#3D405B] shadow-inner">🥈</div>
        </div>
        <span class="text-xs font-black truncate max-w-[80px] text-center">${topThree[1].serverName}</span>
        <span class="text-[10px] font-bold text-[#81B29A] mt-0.5">${topThree[1].totalMentions} Mentions</span>
        <div class="w-full bg-gradient-to-t from-[#81B29A]/30 to-[#81B29A]/10 h-16 rounded-t-lg mt-3 flex items-center justify-center border-t-2 border-[#81B29A]/40">
          <span class="text-xs font-black text-[#3D405B]/60">2ND</span>
        </div>
      </div>
    `;
  } else {
    dashboardHtml += '<div class="w-20"></div>';
  }

  // Place 1st (Gold)
  if (topThree[0]) {
    dashboardHtml += `
      <div onclick="showModal('${topThree[0].serverName}')" class="flex flex-col items-center w-24 cursor-pointer relative -top-4 group">
        <div class="relative mb-2 flex flex-col items-center">
          <div class="absolute -top-6 text-xl animate-bounce">👑</div>
          <div class="w-16 h-16 rounded-full border-4 border-[#F2CC8F] bg-[#F2CC8F]/20 flex items-center justify-center text-2xl shadow-md">🏆</div>
        </div>
        <span class="text-xs font-black truncate max-w-[96px] text-center">${topThree[0].serverName}</span>
        <span class="text-xs font-black text-[#E07A5F] mt-0.5">${topThree[0].totalMentions} Mentions</span>
        <div class="w-full bg-gradient-to-t from-[#E07A5F]/20 to-[#F2CC8F]/35 h-24 rounded-t-xl mt-3 flex items-center justify-center border-t-4 border-[#E07A5F]/70 shadow-sm">
          <span class="text-xs font-black text-[#3D405B]">1ST</span>
        </div>
      </div>
    `;
  }

  // Place 3rd
  if (topThree[2]) {
    dashboardHtml += `
      <div onclick="showModal('${topThree[2].serverName}')" class="flex flex-col items-center w-20 cursor-pointer group">
        <div class="relative mb-2">
          <div class="w-12 h-12 rounded-full border-2 border-[#E07A5F]/50 bg-[#E07A5F]/10 flex items-center justify-center text-lg font-bold text-[#3D405B]">🥉</div>
        </div>
        <span class="text-xs font-black truncate max-w-[80px] text-center">${topThree[2].serverName}</span>
        <span class="text-[10px] font-bold text-[#3D405B]/60 mt-0.5">${topThree[2].totalMentions} Mentions</span>
        <div class="w-full bg-gradient-to-t from-[#E07A5F]/15 to-[#E07A5F]/5 h-12 rounded-t-lg mt-3 flex items-center justify-center border-t-2 border-[#E07A5F]/30">
          <span class="text-xs font-black text-[#3D405B]/60">3RD</span>
        </div>
      </div>
    `;
  } else {
    dashboardHtml += '<div class="w-20"></div>';
  }

  dashboardHtml += `
        </div>
      </div>

      <!-- Quick Summary Bonus Cards in Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[#E07A5F] p-4 rounded-[1.5rem] text-white flex flex-col justify-between min-h-[110px] shadow-sm transform active:scale-95 transition-transform cursor-pointer" onclick="switchTab('bonus')">
          <p class="text-[9px] font-black uppercase tracking-wider opacity-85">Monthly Bonus Winner</p>
          <div>
            <p class="text-[15px] font-black truncate">${topThree[0] ? topThree[0].serverName : 'None'}</p>
            <p class="text-[10px] font-bold mt-0.5">$1,500 MXN (${topThree[0] ? topThree[0].totalMentions : 0} Mentions)</p>
          </div>
        </div>
        
        <button class="bg-[#3D405B] p-4 rounded-[1.5rem] text-left text-white flex flex-col justify-between min-h-[110px] shadow-sm transform active:scale-95 transition-transform cursor-pointer" onclick="switchTab('yearly')">
          <p class="text-[9px] font-black uppercase tracking-wider opacity-85">Yearly Overall Leader</p>
          <div>
            <p class="text-[15px] font-black truncate">${getFilteredYearlyScores(state.selectedYear)[0]?.serverName || 'None'}</p>
            <p class="text-[10px] font-bold mt-0.5">${getFilteredYearlyScores(state.selectedYear)[0]?.totalMentions || 0} Mentions Total</p>
          </div>
        </button>
      </div>

      <!-- Racetrack Remaining list -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
        <h3 class="text-[10px] font-black uppercase tracking-[0.15em] text-[#3D405B]/50 mb-4">📜 LEADERBOARD POSITIONS</h3>
        <div class="flex flex-col gap-4">
  `;

  // Remaining list or complete list fallback
  const listToRender = scores;
  const maxVal = getFilteredMonthlyScores(state.selectedMonth, state.selectedYear)[0]?.totalMentions || 1;

  listToRender.forEach((item) => {
    let medal = "";
    if (item.rank === 1) medal = "🏆";
    else if (item.rank === 2) medal = "🥈";
    else if (item.rank === 3) medal = "🥉";
    else medal = `<span class="text-[10px] font-bold text-[#3D405B]/50">${item.rank}</span>`;

    const pct = Math.max(8, Math.min(100, (item.totalMentions / maxVal) * 100));
    let colorTheme = "bg-[#3D405B]";
    if (item.rank === 1) colorTheme = "bg-[#E07A5F]";
    else if (item.rank === 2) colorTheme = "bg-[#81B29A]";
    else if (item.rank === 3) colorTheme = "bg-[#F2CC8F]";

    dashboardHtml += `
      <div onclick="showModal('${item.serverName}')" class="flex flex-col gap-1 cursor-pointer active:bg-[#FFF9F2] p-2 rounded-xl transition-colors">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 flex items-center justify-center shrink-0">${medal}</div>
            <span class="text-sm font-black text-[#3D405B] truncate max-w-[160px]">${item.serverName}</span>
          </div>
          <span class="text-xs font-black text-[#E07A5F]">${item.totalMentions} MENTIONS</span>
        </div>
        <div class="h-2.5 w-full bg-[#F4F1DE] rounded-full overflow-hidden">
          <div class="h-full ${colorTheme} rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });

  dashboardHtml += `
        </div>
      </div>
    </div>
  `;

  parent.innerHTML = dashboardHtml;
}

function renderMonthlyRaceView(parent) {
  const scores = getFilteredMonthlyScores(state.selectedMonth, state.selectedYear);
  const maxVal = scores[0]?.totalMentions || 1;

  let raceHtml = `
    <div class="flex flex-col gap-6">
      <div class="px-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM RACETRACK MODE</p>
        <h2 class="text-lg font-black text-[#3D405B]">WAITERS REVIEW RACE</h2>
      </div>

      <!-- Filters container -->
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="text-[9px] font-black text-[#3D405B]/50 block mb-1">SELECT MONTH</label>
          <select id="select-month-race" class="w-full bg-white border border-[#F2CC8F]/40 px-3 py-2 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer">
  `;

  for (let m = 1; m <= 12; m++) {
    const s = m === state.selectedMonth ? "selected" : "";
    raceHtml += `<option value="${m}" ${s}>${getMonthName(m)}</option>`;
  }

  raceHtml += `
          </select>
        </div>

        <div class="flex-1">
          <label class="text-[9px] font-black text-[#3D405B]/50 block mb-1">SELECT YEAR</label>
          <select id="select-year-race" class="w-full bg-white border border-[#F2CC8F]/40 px-3 py-2 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer">
  `;

  const yearsAvailable = [2024, 2025, 2026, 2027];
  yearsAvailable.forEach(y => {
    const s = y === state.selectedYear ? "selected" : "";
    raceHtml += `<option value="${y}" ${s}>${y}</option>`;
  });

  raceHtml += `
          </select>
        </div>
      </div>

      <!-- Racing visualization card -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50">🟢 LIVE MENTIONS RACING</h3>
          <span class="text-[10px] font-black text-[#E07A5F]">FINISH LINE 🏁</span>
        </div>

        <div class="flex flex-col gap-6 relative">
          <!-- Lane dividing markers background -->
          <div class="absolute right-0 top-0 bottom-0 border-r-2 border-dashed border-[#F2CC8F]/30 z-0"></div>

          <div class="flex flex-col gap-6 z-10">
  `;

  if (scores.length === 0) {
    raceHtml += `
      <p class="text-xs text-[#3D405B]/60 text-center py-8">No runner details active for this month index yet.</p>
    `;
  } else {
    scores.forEach((item, index) => {
      const completionPct = Math.max(12, Math.min(95, (item.totalMentions / maxVal) * 95));
      const textPosition = Math.max(2, completionPct - 15);
      
      let avatarColor = "bg-[#3D405B] text-white";
      if (index === 0) avatarColor = "bg-[#E07A5F] text-white";
      else if (index === 1) avatarColor = "bg-[#81B29A] text-white";
      else if (index === 2) avatarColor = "bg-[#F2CC8F] text-[#3D405B]";

      raceHtml += `
        <div onclick="showModal('${item.serverName}')" class="relative cursor-pointer transition-transform duration-200 hover:scale-[1.01]">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-black text-[#3D405B]">${item.serverName}</span>
            <span class="text-[10px] font-bold text-[#E07A5F]">${item.totalMentions} pts</span>
          </div>
          <div class="h-8 w-full bg-[#F4F1DE]/40 rounded-xl relative overflow-hidden flex items-center border border-[#F2CC8F]/10">
            <!-- Animated progress block -->
            <div class="h-full bg-gradient-to-r from-[#F4F1DE] to-[#F2CC8F]/25 rounded-l-xl transition-all duration-1000 ease-out" style="width: ${completionPct}%"></div>
            
            <!-- Runner avatar moving component -->
            <div class="absolute flex items-center gap-1 transition-all duration-1000 ease-out" style="left: calc(${completionPct}% - 28px)">
              <div class="w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-sm transform scale-105">
                ${item.serverName.slice(0, 2).toUpperCase()}
              </div>
              <span class="text-[14px]">🏃</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  raceHtml += `
          </div>
        </div>
      </div>
    </div>
  `;

  parent.innerHTML = raceHtml;

  // Set selectors handlers
  document.getElementById("select-month-race").addEventListener("change", (e) => {
    state.selectedMonth = parseInt(e.target.value);
    renderApp();
  });

  document.getElementById("select-year-race").addEventListener("change", (e) => {
    state.selectedYear = parseInt(e.target.value);
    renderApp();
  });
}

function renderYearlyRaceView(parent) {
  const scores = getFilteredYearlyScores(state.selectedYear);
  const maxVal = scores[0]?.totalMentions || 1;

  let yearlyHtml = `
    <div class="flex flex-col gap-6">
      <div class="px-2 flex justify-between items-end">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">ANNUAL PRESTIGE ACCUMULATOR</p>
          <h2 class="text-lg font-black text-[#3D405B]">YEARLY COMPILATION</h2>
        </div>
        <select id="select-year-yearly" class="bg-white border border-[#F2CC8F]/40 px-3 py-1.5 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer">
  `;

  const yearsAvailable = [2024, 2025, 2026, 2027];
  yearsAvailable.forEach(y => {
    const s = y === state.selectedYear ? "selected" : "";
    yearlyHtml += `<option value="${y}" ${s}>${y}</option>`;
  });

  yearlyHtml += `
        </select>
      </div>

      <!-- Bar Chart container -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
        <h3 class="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50 mb-6">📊 CUMULATIVE SCORE DISTRIBUTION</h3>
        
        <div class="flex flex-col gap-5">
  `;

  if (scores.length === 0) {
    yearlyHtml += '<p class="text-xs text-[#3D405B]/60 text-center py-8">No annual data entries parsed for selected year yet.</p>';
  } else {
    // Show top 6 as actual visual charts
    const topScores = scores.slice(0, 6);
    topScores.forEach(item => {
      const pct = Math.max(5, Math.min(100, (item.totalMentions / maxVal) * 100));
      
      yearlyHtml += `
        <div onclick="showModal('${item.serverName}')" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-16 text-right shrink-0 truncate">
            <span class="text-xs font-black text-[#3D405B] hover:text-[#E07A5F]">${item.serverName}</span>
          </div>
          <div class="flex-1 h-5 bg-[#F4F1DE]/40 rounded-lg relative overflow-hidden flex items-center border border-[#F2CC8F]/10">
            <div class="h-full bg-gradient-to-r from-[#81B29A] to-[#81B29A]/50 rounded-l-lg transition-all duration-700 ease-out" style="width: ${pct}%"></div>
            <span class="absolute left-2 text-[9px] font-black text-[#3D405B]">${item.totalMentions} mentions</span>
          </div>
        </div>
      `;
    });
  }

  yearlyHtml += `
        </div>
      </div>

      <!-- Complete rankings list list -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
        <h3 class="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50 mb-4">🏆 ALL YEAR RANKINGS</h3>
        <div class="flex flex-col gap-3">
  `;

  scores.forEach(item => {
    yearlyHtml += `
      <div onclick="showModal('${item.serverName}')" class="flex justify-between items-center py-2 border-b border-[#F2CC8F]/15 cursor-pointer hover:bg-[#FFF9F2] px-2 rounded-xl transition-colors">
        <div class="flex items-center gap-3">
          <span class="text-xs font-black text-[#3D405B]/55 w-5">#${item.rank}</span>
          <span class="text-xs font-black text-[#3D405B] truncate max-w-[165px]">${item.serverName}</span>
        </div>
        <span class="text-xs font-black text-[#E07A5F]">${item.totalMentions} mentions</span>
      </div>
    `;
  });

  yearlyHtml += `
        </div>
      </div>
    </div>
  `;

  parent.innerHTML = yearlyHtml;

  document.getElementById("select-year-yearly").addEventListener("change", (e) => {
    state.selectedYear = parseInt(e.target.value);
    renderApp();
  });
}

function renderBonusWinnersView(parent) {
  const winners = getYearlyBonusWinners(state.selectedYear);

  let bonusHtml = `
    <div class="flex flex-col gap-6">
      <div class="px-2 flex justify-between items-end">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM EXCELLENCE COMPENSATIONS</p>
          <h2 class="text-lg font-black text-[#3D405B]">BONUS RECIPIENTS</h2>
        </div>
        <div class="px-3 py-1 bg-[#3D405B] text-white text-[9px] font-black rounded-full shadow-sm">
          ${winners.length} FOUND
        </div>
      </div>

      <!-- Quick highlight banner -->
      <div class="bg-gradient-to-r from-[#3D405B] to-[#E07A5F]/90 p-5 rounded-[2rem] text-white shadow-md relative overflow-hidden flex flex-col gap-2">
        <span class="relative z-10 text-[9px] font-black uppercase tracking-widest text-[#F2CC8F]">EXCELLENCE AWARD</span>
        <h3 class="relative z-10 text-lg font-black leading-tight">CHAMPION EARNS KEY</h3>
        <p class="relative z-10 text-[11px] opacity-90 leading-relaxed max-w-[280px]">Mamazul rewards the Top Waiter of the Month with a bonus of $1,500 MXN cash inside their envelope!</p>
        <span class="absolute -right-8 -bottom-8 text-7xl opacity-15 pointer-events-none">🇲🇽</span>
      </div>

      <!-- Winners dynamic container -->
      <div class="grid grid-cols-1 gap-4">
  `;

  if (winners.length === 0) {
    bonusHtml += `
      <div class="bg-white rounded-[2rem] p-8 text-center text-[#3D405B]/60 border border-[#F2CC8F]/25">
        No bonus records processed for selected filters yet.
      </div>
    `;
  } else {
    winners.forEach(w => {
      bonusHtml += `
        <div onclick="showModal('${w.serverName}')" class="bg-white p-5 rounded-[2rem] border border-[#F2CC8F]/25 shadow-sm flex items-center justify-between gap-4 cursor-pointer transform transition-transform duration-200 active:scale-[0.99] hover:border-[#E07A5F]/40">
          <div class="flex flex-col gap-1.5">
            <span class="text-[9px] font-black uppercase tracking-widest text-[#E07A5F]">${w.monthName.toUpperCase()} WINNER</span>
            <span class="text-[15px] font-black text-[#3D405B] truncate max-w-[190px]">${w.serverName}</span>
            <span class="text-[10px] font-bold text-[#3D405B]/55">Total Monthly mentions: ${w.totalMentions}</span>
          </div>
          <div class="bg-[#81B29A]/15 border border-[#81B29A]/30 text-[#81B29A] px-4 py-2 rounded-2xl text-center shrink-0 flex flex-col justify-center">
            <span class="text-[11px] font-black tracking-wide">${w.bonusAmount.split(" ")[0]}</span>
            <span class="text-[8px] font-black opacity-80 uppercase tracking-wider">${w.bonusAmount.split(" ")[1]}</span>
          </div>
        </div>
      `;
    });
  }

  bonusHtml += `
      </div>
    </div>
  `;

  parent.innerHTML = bonusHtml;
}

function renderSettingsView(parent) {
  let settingsHtml = `
    <div class="flex flex-col gap-6">
      <div class="px-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM PIPELINE CONTROLLER</p>
        <h2 class="text-lg font-black text-[#3D405B]">CONNECTION SETTINGS</h2>
      </div>

      <!-- Action Box Card -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col gap-5">
        <h3 class="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/55">⚙️ TARGET WORKBOOK IDENTIFIERS</h3>

        <div class="flex flex-col gap-3">
          <label class="text-[9px] font-black text-[#3D405B]/60 tracking-wider">SPREADSHEET ID KEY</label>
          <input type="text" id="input-spreadsheet-id" class="w-full bg-[#FFF9F2] border border-[#F2CC8F]/45 px-4 py-3 rounded-xl text-xs font-medium text-[#3D405B] focus:outline-none focus:border-[#E07A5F]" value="${state.spreadsheetId}">
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-[9px] font-black text-[#3D405B]/60 tracking-wider">WORKSHEET TAB NAME</label>
          <input type="text" id="input-sheet-name" class="w-full bg-[#FFF9F2] border border-[#F2CC8F]/45 px-4 py-3 rounded-xl text-xs font-semibold text-[#3D405B] focus:outline-none focus:border-[#E07A5F]" value="${state.sheetName}">
        </div>

        <div class="flex gap-4 pt-1">
          <button id="btn-save-settings" class="flex-1 py-3 bg-[#E07A5F] text-white text-xs font-black rounded-full shadow-sm active:scale-95 transition-all text-center">SAVE & LIVE SYNC</button>
          <button id="btn-reset-settings" class="px-5 py-3 border border-[#3D405B]/20 text-[#3D405B]/60 text-xs font-bold rounded-full active:scale-95 transition-all text-center">RESET</button>
        </div>
      </div>

      <!-- Synchronization Monitor Status Box -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col gap-3">
        <h3 class="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/55">📈 SYNC STATE ENGINE MONITOR</h3>
        
        <div class="flex flex-col gap-2 text-xs">
          <div class="flex justify-between border-b border-[#F2CC8F]/15 py-1.5">
            <span class="text-[#3D405B]/55 font-bold">Sync Result:</span>
            <span class="font-black ${state.lastSyncSuccess ? 'text-green-500' : 'text-red-500'}">${state.lastSyncSuccess ? 'SUCCESSFUL' : 'FAILED'}</span>
          </div>
          <div class="flex justify-between border-b border-[#F2CC8F]/15 py-1.5">
            <span class="text-[#3D405B]/55 font-bold">Last Attempt:</span>
            <span class="font-bold text-[#3D405B]">${formatDate(state.lastSyncTime)}</span>
          </div>
          <div class="flex flex-col gap-1 py-1.5">
            <span class="text-[#3D405B]/55 font-bold">Pipeline Details:</span>
            <p class="text-[11px] text-[#3D405B]/70 bg-[#FFF9F2] p-2.5 rounded-xl mt-1 border border-[#F2CC8F]/20 font-semibold leading-relaxed">${state.lastSyncMessage || 'No sync actions recorded. Tap Save or Trigger above.'}</p>
          </div>
        </div>
      </div>

      <!-- Multi step usage instructions -->
      <div class="bg-[#FFF9F2] rounded-[2rem] p-6 border-2 border-dashed border-[#F2CC8F]/40 flex flex-col gap-4">
        <h4 class="text-xs font-black text-[#3D405B] uppercase">Configure Google Spreadsheet:</h4>
        <ol class="text-[11px] text-[#3D405B]/75 leading-relaxed list-decimal list-inside space-y-2 font-medium">
          <li>Create or open your restaurant's reviews spreadsheet in Google Sheets.</li>
          <li>Ensure the Spreadsheet is shared to <b>"Anyone with the link can view"</b> in the top right Share menu.</li>
          <li>Copy the long string of alphanumeric keys in the address bar between '/d/' and '/edit' on your browser URL.</li>
          <li>Paste the key into the Spreadsheet ID form above, set tab name to <b>Monthly Totals</b>, and tap Save!</li>
        </ol>
      </div>
    </div>
  `;

  parent.innerHTML = settingsHtml;

  // Save Settings Clicked
  document.getElementById("btn-save-settings").addEventListener("click", () => {
    const id = document.getElementById("input-spreadsheet-id").value;
    const name = document.getElementById("input-sheet-name").value;
    updateSettings(id, name);
  });

  // Reset Settings Clicked
  document.getElementById("btn-reset-settings").addEventListener("click", () => {
    resetSettings();
  });
}

// Render Waiter Stats Modal Dialog Custom Content
function renderWaiterModal() {
  const waiter = state.selectedWaiter;
  if (!waiter) return;

  const content = document.getElementById("modal-detail-content");
  
  // Calculate average mentions
  const total = waiter.totalMentions;
  const itemNamesCount = waiter.milestones.length || 1;
  const avg = (total / itemNamesCount).toFixed(1);

  // Generate a custom mini CSS chart
  let chartHtml = `
    <div class="flex items-end justify-between gap-1 h-24 pt-4 border-b border-[#F2CC8F]/15">
  `;

  const maxVal = Math.max(1, ...waiter.milestones.map(m => m.count));
  waiter.milestones.forEach(m => {
    const pct = (m.count / maxVal) * 80;
    chartHtml += `
      <div class="flex flex-col items-center flex-1 group">
        <span class="text-[9px] font-black text-[#E07A5F] opacity-0 group-hover:opacity-100 transition-opacity mb-0.5">${m.count}</span>
        <div class="w-full bg-[#81B29A] rounded-t-sm transition-all duration-500 ease-out" style="height: ${Math.max(4, pct)}px"></div>
        <span class="text-[8px] font-black text-[#3D405B]/50 mt-1 truncate max-w-[40px]">${m.dateLabel}</span>
      </div>
    `;
  });

  chartHtml += '</div>';

  content.innerHTML = `
    <div class="flex flex-col gap-5">
      <!-- Profile Title Header and Medal badges -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-black text-lg shadow-sm">
          ${waiter.serverName.slice(0, 2).toUpperCase()}
        </div>
        <div class="flex-1">
          <h4 class="text-base font-black text-[#3D405B]">${waiter.serverName}</h4>
          <span class="text-[10px] font-black uppercase text-[#E07A5F] tracking-widest">🏆 YEAR RANK #${waiter.yearlyRank}</span>
        </div>
      </div>

      <!-- Key Performance Indicators Row -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[#FFF9F2] p-3.5 rounded-2xl border border-[#F2CC8F]/25 text-center">
          <span class="text-[9px] font-black uppercase text-[#3D405B]/50 block">Cumulative Points</span>
          <span class="text-xl font-black text-[#3D405B] mt-0.5 block">${waiter.totalMentions}</span>
        </div>
        
        <div class="bg-[#FFF9F2] p-3.5 rounded-2xl border border-[#F2CC8F]/25 text-center">
          <span class="text-[9px] font-black uppercase text-[#3D405B]/50 block">Monthly Performance Index</span>
          <span class="text-xl font-black text-[#81B29A] mt-0.5 block">${avg} pts</span>
        </div>
      </div>

      <!-- Trend analytics visualizer wrapper -->
      <div>
        <span class="text-[9px] font-black uppercase text-[#3D405B]/50 tracking-wider">📈 MENTIONS HISTORY TRENDLINE</span>
        ${chartHtml}
      </div>

      <!-- Milestones chronological details -->
      <div class="mt-1">
        <span class="text-[9px] font-black uppercase text-[#3D405B]/50 tracking-wider">🗓️ ALL DETECTED MILESTONES</span>
        <div class="flex flex-col gap-2 mt-2 max-h-[140px] overflow-y-auto pr-1">
          ${waiter.milestones.map(m => `
            <div class="flex justify-between items-center py-2 border-b border-[#F2CC8F]/10 text-xs">
              <span class="text-[#3D405B] font-semibold">${m.dateLabel} Target Sync</span>
              <span class="font-black text-[#E07A5F] bg-[#E07A5F]/10 px-2.5 py-0.5 rounded-full">${m.count} points</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}
