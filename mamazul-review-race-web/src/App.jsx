import React, { useState, useEffect, useMemo } from 'react';

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

// CSV Parser RFC 4180
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

export default function App() {
  // Persistent Settings
  const [spreadsheetId, setSpreadsheetId] = useState(() => localStorage.getItem("mamazul_spreadsheetId") || DEFAULT_SPREADSHEET_ID);
  const [sheetName, setSheetName] = useState(() => localStorage.getItem("mamazul_sheetName") || DEFAULT_SHEET_NAME);
  
  // App States
  const [allMentions, setAllMentions] = useState(() => {
    const raw = localStorage.getItem("mamazul_allMentions");
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { return SEEDED_MENTIONS; }
    }
    return SEEDED_MENTIONS;
  });

  const [syncMeta, setSyncMeta] = useState(() => {
    const raw = localStorage.getItem("mamazul_syncMetadata");
    if (raw) {
      try {
        const meta = JSON.parse(raw);
        return {
          lastSyncSuccess: meta.lastSyncSuccess !== undefined ? meta.lastSyncSuccess : true,
          lastSyncTime: meta.lastSyncTime || Date.now(),
          lastSyncMessage: meta.lastSyncMessage || "Loaded cached database successfully."
        };
      } catch (e) {}
    }
    return {
      lastSyncSuccess: true,
      lastSyncTime: Date.now(),
      lastSyncMessage: "Seeded local database configured successfully."
    };
  });

  const [selectedMonth, setSelectedMonth] = useState(5); // May
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, monthly, yearly, bonus, settings
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Buffer fields for settings screen input
  const [inputSpreadsheetId, setInputSpreadsheetId] = useState(spreadsheetId);
  const [inputSheetName, setInputSheetName] = useState(sheetName);

  // Auto-sync if cache have never sync successfully on load
  useEffect(() => {
    const neverSynced = !localStorage.getItem("mamazul_syncMetadata");
    if (neverSynced && allMentions === SEEDED_MENTIONS) {
      triggerSync(spreadsheetId, sheetName);
    }
  }, []);

  // Save changes to localStorage whenever options change
  const saveAllToStorage = (mentions, meta) => {
    localStorage.setItem("mamazul_spreadsheetId", spreadsheetId);
    localStorage.setItem("mamazul_sheetName", sheetName);
    localStorage.setItem("mamazul_allMentions", JSON.stringify(mentions));
    localStorage.setItem("mamazul_syncMetadata", JSON.stringify(meta));
  };

  // Google Sheets integration logic
  const triggerSync = async (targetId, targetName) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setErrorMessage(null);

    try {
      const encodedTab = encodeURIComponent(targetName);
      const url = `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodedTab}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      if (!csvText || csvText.length < 5) {
        throw new Error("Received empty or corrupt data from spreadsheet. Check sheet sharing settings.");
      }

      const parsedRows = parseCSV(csvText);
      if (parsedRows.length <= 1) {
        throw new Error(`No mentions rows could be compiled from sheet '${targetName}'.`);
      }

      const headers = parsedRows[0].map(h => h.trim().toLowerCase());
      const serverIdx = headers.findIndex(h => h === "server_name" || h === "server");
      const monthIdx = headers.findIndex(h => h === "month" || h === "date");
      const mentionsIdx = headers.findIndex(h => h === "mentions" || h === "mentions_count");

      const fallbackMode = serverIdx === -1 || monthIdx === -1 || mentionsIdx === -1;
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
          year,
          monthValue,
          mentionsCount
        });
      }

      if (fetchedMentions.length === 0) {
        throw new Error("Filtered spreadsheet results yielded zero active waiter records.");
      }

      const newMeta = {
        lastSyncSuccess: true,
        lastSyncTime: Date.now(),
        lastSyncMessage: `Successfully compiled ${fetchedMentions.length} mentions rows.`
      };

      setAllMentions(fetchedMentions);
      setSyncMeta(newMeta);
      saveAllToStorage(fetchedMentions, newMeta);

    } catch (err) {
      console.error(err);
      const failMsg = err.message || "Failed to sync spreadsheet data.";
      const newMeta = {
        lastSyncSuccess: false,
        lastSyncTime: Date.now(),
        lastSyncMessage: `Sync Failed: ${failMsg}`
      };
      setErrorMessage(failMsg);
      setSyncMeta(newMeta);
      saveAllToStorage(allMentions, newMeta);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("mamazul_spreadsheetId", inputSpreadsheetId.trim());
    localStorage.setItem("mamazul_sheetName", inputSheetName.trim());
    setSpreadsheetId(inputSpreadsheetId.trim());
    setSheetName(inputSheetName.trim());
    triggerSync(inputSpreadsheetId.trim(), inputSheetName.trim());
  };

  const handleResetSettings = () => {
    setInputSpreadsheetId(DEFAULT_SPREADSHEET_ID);
    setInputSheetName(DEFAULT_SHEET_NAME);
    localStorage.setItem("mamazul_spreadsheetId", DEFAULT_SPREADSHEET_ID);
    localStorage.setItem("mamazul_sheetName", DEFAULT_SHEET_NAME);
    setSpreadsheetId(DEFAULT_SPREADSHEET_ID);
    setSheetName(DEFAULT_SHEET_NAME);
    triggerSync(DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME);
  };

  // Memoized aggregators
  const monthlyScores = useMemo(() => {
    const filtered = allMentions.filter(m => m.year === selectedYear && m.monthValue === selectedMonth);
    const scoresMap = {};
    filtered.forEach(m => {
      scoresMap[m.serverName] = (scoresMap[m.serverName] || 0) + m.mentionsCount;
    });
    return Object.entries(scoresMap)
      .map(([serverName, totalMentions]) => ({ serverName, totalMentions }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [allMentions, selectedMonth, selectedYear]);

  const yearlyScores = useMemo(() => {
    const filtered = allMentions.filter(m => m.year === selectedYear);
    const scoresMap = {};
    filtered.forEach(m => {
      scoresMap[m.serverName] = (scoresMap[m.serverName] || 0) + m.mentionsCount;
    });
    return Object.entries(scoresMap)
      .map(([serverName, totalMentions]) => ({ serverName, totalMentions }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [allMentions, selectedYear]);

  const yearlyBonusWinners = useMemo(() => {
    const winners = [];
    for (let m = 1; m <= 12; m++) {
      const filtered = allMentions.filter(ment => ment.year === selectedYear && ment.monthValue === m);
      const scoresMap = {};
      filtered.forEach(ment => {
        scoresMap[ment.serverName] = (scoresMap[ment.serverName] || 0) + ment.mentionsCount;
      });
      const scores = Object.entries(scoresMap)
        .map(([serverName, totalMentions]) => ({ serverName, totalMentions }))
        .sort((a, b) => b.totalMentions - a.totalMentions);

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
  }, [allMentions, selectedYear]);

  // Modal open detail helper
  const handleShowWaiterModal = (serverName) => {
    const filtered = allMentions.filter(m => m.serverName === serverName);
    const total = filtered.reduce((acc, m) => acc + m.mentionsCount, 0);
    const yRank = yearlyScores.find(w => w.serverName === serverName)?.rank || "N/A";
    
    // Milestones history parsed
    const monthData = {};
    filtered.forEach(m => {
      const label = `${getMonthName(m.monthValue).slice(0, 3)} ${m.year}`;
      monthData[label] = (monthData[label] || 0) + m.mentionsCount;
    });
    const milestones = Object.entries(monthData).map(([dateLabel, count]) => ({ dateLabel, count }));

    setSelectedWaiter({
      serverName,
      totalMentions: total,
      yearlyRank: yRank,
      milestones
    });
  };

  return (
    <div className="h-full w-full max-w-md bg-[#FFF9F2] text-[#3D405B] flex flex-col overflow-hidden relative shadow-2xl md:rounded-[3rem] border border-[#F2CC8F]/20">
      
      {/* App Header Bar */}
      <header className="bg-white px-6 pt-12 pb-4 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.01)] border-b border-[#F2CC8F]/25 flex flex-col shrink-0 gap-3 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E07A5F]">Mamazul Tulum</p>
            <h1 className="text-xl font-black text-[#3D405B]">Review Race</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sync status pills */}
            <div className="flex items-center gap-1.5 bg-[#FFF9F2] px-2.5 py-1 rounded-full border border-[#F2CC8F]/30 shadow-inner">
              <span className="text-[9px] font-black tracking-wide text-[#3D405B]/80 uppercase">
                {isSyncing ? "SYNCING" : syncMeta.lastSyncSuccess ? "SYNCED" : "DISCONNECTED"}
              </span>
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-ping' : syncMeta.lastSyncSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            
            {/* Sync trigger button */}
            <button 
              onClick={() => triggerSync(spreadsheetId, sheetName)} 
              disabled={isSyncing}
              className={`w-10 h-10 rounded-full bg-[#E07A5F]/10 flex items-center justify-center border-2 border-[#E07A5F] active:scale-95 transition-all duration-200 ${isSyncing ? 'animate-spin' : ''}`}
            >
              <svg className="w-5 h-5 text-[#E07A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Connection error panel */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl shrink-0 z-10 transition-all duration-300">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-800">Connection Action Failed</p>
              <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 font-bold text-xs shrink-0 px-1">✕</button>
          </div>
        </div>
      )}

      {/* Main Container Router */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-24 flex flex-col gap-6">

        {/* --- Tab 1: Dashboard View --- */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            
            {/* Title headers */}
            <div className="flex justify-between items-center px-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">CURRENT PRESTIGE SECTION</p>
                <h2 className="text-lg font-black text-[#3D405B]">{getMonthName(selectedMonth).toUpperCase()} {selectedYear} CHAMPIONS</h2>
              </div>
              <div className="px-3 py-1 bg-[#81B29A]/15 text-[#81B29A] text-[9px] font-black rounded-full border border-[#81B29A]/20">
                {monthlyScores.length} ACTIVATED
              </div>
            </div>

            {/* Empty state conditional */}
            {monthlyScores.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2rem] border border-[#F2CC8F]/20">
                <div className="w-20 h-20 rounded-full bg-[#FFF9F2] flex items-center justify-center mb-6 border-2 border-[#F2CC8F]">
                  <span className="text-3xl text-[#E07A5F]">☀️</span>
                </div>
                <h3 className="text-lg font-black text-[#3D405B]">No Mentions for {getMonthName(selectedMonth)} {selectedYear}</h3>
                <p className="text-xs text-[#3D405B]/65 max-w-[260px] mt-2 leading-relaxed">Let's edit connections inside settings or initiate a live sync now!</p>
                <button 
                  onClick={() => triggerSync(spreadsheetId, sheetName)}
                  className="mt-6 px-6 py-2.5 bg-[#E07A5F] text-white text-xs font-black rounded-full shadow-md active:scale-95 transition-transform"
                >
                  SYNC DATA NOW
                </button>
              </div>
            ) : (
              <>
                {/* Visual Spotlight Podium banner card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3D405B]/50 mb-6 text-center">🏆 SECTOR HIGHLIGHT PODIUM</h3>
                  
                  <div className="flex items-end justify-center gap-4 min-h-[190px] pt-4">
                    {/* Second Place */}
                    {monthlyScores[1] ? (
                      <div onClick={() => handleShowWaiterModal(monthlyScores[1].serverName)} className="flex flex-col items-center w-20 cursor-pointer group">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full border-2 border-[#81B29A] bg-[#81B29A]/15 flex items-center justify-center text-lg font-bold text-[#3D405B] shadow-inner">🥈</div>
                        </div>
                        <span className="text-xs font-black truncate max-w-[80px] text-center">{monthlyScores[1].serverName}</span>
                        <span className="text-[10px] font-bold text-[#81B29A] mt-0.5">{monthlyScores[1].totalMentions} Mentions</span>
                        <div className="w-full bg-gradient-to-t from-[#81B29A]/30 to-[#81B29A]/10 h-16 rounded-t-lg mt-3 flex items-center justify-center border-t-2 border-[#81B29A]/40">
                          <span className="text-xs font-black text-[#3D405B]/60">2ND</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20"></div>
                    )}

                    {/* First Place (Gold) */}
                    {monthlyScores[0] ? (
                      <div onClick={() => handleShowWaiterModal(monthlyScores[0].serverName)} className="flex flex-col items-center w-24 cursor-pointer relative -top-4 group">
                        <div className="relative mb-2 flex flex-col items-center">
                          <div className="absolute -top-6 text-xl animate-bounce">👑</div>
                          <div className="w-16 h-16 rounded-full border-4 border-[#F2CC8F] bg-[#F2CC8F]/20 flex items-center justify-center text-2xl shadow-md">🏆</div>
                        </div>
                        <span className="text-xs font-black truncate max-w-[96px] text-center">{monthlyScores[0].serverName}</span>
                        <span className="text-xs font-black text-[#E07A5F] mt-0.5">{monthlyScores[0].totalMentions} Mentions</span>
                        <div className="w-full bg-gradient-to-t from-[#E07A5F]/20 to-[#F2CC8F]/35 h-24 rounded-t-xl mt-3 flex items-center justify-center border-t-4 border-[#E07A5F]/70 shadow-sm">
                          <span className="text-xs font-black text-[#3D405B]">1ST</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24"></div>
                    )}

                    {/* Third Place */}
                    {monthlyScores[2] ? (
                      <div onClick={() => handleShowWaiterModal(monthlyScores[2].serverName)} className="flex flex-col items-center w-20 cursor-pointer group">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full border-2 border-[#E07A5F]/50 bg-[#E07A5F]/10 flex items-center justify-center text-lg font-bold text-[#3D405B]">🥉</div>
                        </div>
                        <span className="text-xs font-black truncate max-w-[80px] text-center">{monthlyScores[2].serverName}</span>
                        <span className="text-[10px] font-bold text-[#3D405B]/60 mt-0.5">{monthlyScores[2].totalMentions} Mentions</span>
                        <div className="w-full bg-gradient-to-t from-[#E07A5F]/15 to-[#E07A5F]/5 h-12 rounded-t-lg mt-3 flex items-center justify-center border-t-2 border-[#E07A5F]/30">
                          <span className="text-xs font-black text-[#3D405B]/60">3RD</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20"></div>
                    )}
                  </div>
                </div>

                {/* Grid stats overview cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setActiveTab("bonus")}
                    className="bg-[#E07A5F] p-4 rounded-[1.5rem] text-white flex flex-col justify-between min-h-[110px] shadow-sm transform active:scale-95 transition-transform cursor-pointer"
                  >
                    <p className="text-[9px] font-black uppercase tracking-wider opacity-85">Monthly Bonus Winner</p>
                    <div>
                      <p className="text-[15px] font-black truncate">{monthlyScores[0] ? monthlyScores[0].serverName : 'None'}</p>
                      <p className="text-[10px] font-bold mt-0.5">$1,500 MXN ({monthlyScores[0] ? monthlyScores[0].totalMentions : 0} Mentions)</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("yearly")}
                    className="bg-[#3D405B] p-4 rounded-[1.5rem] text-left text-white flex flex-col justify-between min-h-[110px] shadow-sm transform active:scale-95 transition-transform cursor-pointer"
                  >
                    <p className="text-[9px] font-black uppercase tracking-wider opacity-85">Yearly Overall Leader</p>
                    <div>
                      <p className="text-[15px] font-black truncate">{yearlyScores[0]?.serverName || 'None'}</p>
                      <p className="text-[10px] font-bold mt-0.5">{yearlyScores[0]?.totalMentions || 0} Mentions Total</p>
                    </div>
                  </div>
                </div>

                {/* Sublist table overview */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3D405B]/50 mb-4">📜 LEADERBOARD POSITIONS</h3>
                  <div className="flex flex-col gap-4">
                    {monthlyScores.map((item) => {
                      const maxVal = monthlyScores[0]?.totalMentions || 1;
                      const pct = Math.max(8, Math.min(100, (item.totalMentions / maxVal) * 100));
                      let colorTheme = "bg-[#3D405B]";
                      if (item.rank === 1) colorTheme = "bg-[#E07A5F]";
                      else if (item.rank === 2) colorTheme = "bg-[#81B29A]";
                      else if (item.rank === 3) colorTheme = "bg-[#F2CC8F]";

                      return (
                        <div 
                          key={item.serverName} 
                          onClick={() => handleShowWaiterModal(item.serverName)}
                          className="flex flex-col gap-1 cursor-pointer active:bg-[#FFF9F2] p-2 rounded-xl transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                                {item.rank === 1 ? "🏆" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `${item.rank}`}
                              </span>
                              <span className="text-sm font-black text-[#3D405B] truncate max-w-[160px]">{item.serverName}</span>
                            </div>
                            <span className="text-xs font-black text-[#E07A5F]">{item.totalMentions} MENTIONS</span>
                          </div>
                          <div className="h-2.5 w-full bg-[#F4F1DE] rounded-full overflow-hidden">
                            <div className={`h-full ${colorTheme} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- Tab 2: Racetrack Overview --- */}
        {activeTab === "monthly" && (
          <div className="flex flex-col gap-6">
            <div className="px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM RACETRACK MODE</p>
              <h2 class="text-lg font-black text-[#3D405B] font-black">WAITERS REVIEW RACE</h2>
            </div>

            {/* Filter controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[9px] font-black text-[#3D405B]/50 block mb-1">SELECT MONTH</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full bg-white border border-[#F2CC8F]/40 px-3 py-2 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-[9px] font-black text-[#3D405B]/50 block mb-1">SELECT YEAR</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full bg-white border border-[#F2CC8F]/40 px-3 py-2 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic visual racetrack lane and runner avatars */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50">🟢 LIVE MENTIONS RACING</h3>
                <span className="text-[10px] font-black text-[#E07A5F]">FINISH LINE 🏁</span>
              </div>

              <div className="flex flex-col gap-6 relative">
                <div className="absolute right-0 top-0 bottom-0 border-r-2 border-dashed border-[#F2CC8F]/30 z-0"></div>

                <div className="flex flex-col gap-6 z-10">
                  {monthlyScores.length === 0 ? (
                    <p className="text-xs text-[#3D405B]/60 text-center py-8">No runner profiles parsed for these filters yet.</p>
                  ) : (
                    monthlyScores.map((item, index) => {
                      const maxVal = monthlyScores[0]?.totalMentions || 1;
                      const completionPct = Math.max(12, Math.min(95, (item.totalMentions / maxVal) * 95));
                      
                      let avatarColor = "bg-[#3D405B] text-white";
                      if (index === 0) avatarColor = "bg-[#E07A5F] text-white";
                      else if (index === 1) avatarColor = "bg-[#81B29A] text-white";
                      else if (index === 2) avatarColor = "bg-[#F2CC8F] text-[#3D405B]";

                      return (
                        <div 
                          key={item.serverName} 
                          onClick={() => handleShowWaiterModal(item.serverName)}
                          className="relative cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black text-[#3D405B]">{item.serverName}</span>
                            <span className="text-[10px] font-bold text-[#E07A5F]">{item.totalMentions} pts</span>
                          </div>
                          
                          <div className="h-8 w-full bg-[#F4F1DE]/40 rounded-xl relative overflow-hidden flex items-center border border-[#F2CC8F]/10">
                            {/* Visual tracking trail */}
                            <div className="h-full bg-gradient-to-r from-[#F4F1DE] to-[#F2CC8F]/25 rounded-l-xl transition-all duration-1000 ease-out" style={{ width: `${completionPct}%` }}></div>
                            
                            {/* Running avatar component */}
                            <div className="absolute flex items-center gap-1 transition-all duration-1000 ease-out" style={{ left: `calc(${completionPct}% - 28px)` }}>
                              <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-sm transform scale-105`}>
                                {item.serverName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[14px]">🏃</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 3: Yearly Compilations --- */}
        {activeTab === "yearly" && (
          <div className="flex flex-col gap-6">
            <div className="px-2 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">ANNUAL PRESTIGE ACCUMULATOR</p>
                <h2 className="text-lg font-black text-[#3D405B]">YEARLY COMPILATION</h2>
              </div>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white border border-[#F2CC8F]/40 px-3 py-1.5 rounded-xl text-xs font-black text-[#3D405B] focus:outline-none focus:border-[#E07A5F] cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Custom SVG analytics distribution bar metrics */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50 mb-6">📊 CUMULATIVE SCORE DISTRIBUTION</h3>
              
              <div className="flex flex-col gap-5">
                {yearlyScores.length === 0 ? (
                  <p className="text-xs text-[#3D405B]/60 text-center py-8">No years listings detected.</p>
                ) : (
                  yearlyScores.slice(0, 6).map(item => {
                    const maxVal = yearlyScores[0]?.totalMentions || 1;
                    const pct = Math.max(5, Math.min(100, (item.totalMentions / maxVal) * 100));

                    return (
                      <div 
                        key={item.serverName} 
                        onClick={() => handleShowWaiterModal(item.serverName)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-16 text-right shrink-0 truncate">
                          <span className="text-xs font-black text-[#3D405B] hover:text-[#E07A5F] transition-colors">{item.serverName}</span>
                        </div>
                        <div className="flex-1 h-5 bg-[#F4F1DE]/40 rounded-lg relative overflow-hidden flex items-center border border-[#F2CC8F]/10">
                          <div className="h-full bg-gradient-to-r from-[#81B29A] to-[#81B29A]/50 rounded-l-lg transition-all duration-700 ease-out" style={{ width: `${pct}%` }}></div>
                          <span className="absolute left-2 text-[9px] font-black text-[#3D405B]">{item.totalMentions} mentions</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* General ranking list block */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/50 mb-4">🏆 ALL YEAR RANKINGS</h3>
              <div className="flex flex-col gap-3">
                {yearlyScores.map(item => (
                  <div 
                    key={item.serverName} 
                    onClick={() => handleShowWaiterModal(item.serverName)}
                    className="flex justify-between items-center py-2 border-b border-[#F2CC8F]/15 cursor-pointer hover:bg-[#FFF9F2] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#3D405B]/55 w-5">#{item.rank}</span>
                      <span className="text-xs font-black text-[#3D405B] truncate max-w-[165px]">{item.serverName}</span>
                    </div>
                    <span className="text-xs font-black text-[#E07A5F]">{item.totalMentions} mentions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 4: Bonus award Winners list --- */}
        {activeTab === "bonus" && (
          <div className="flex flex-col gap-6">
            <div className="px-2 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM EXCELLENCE COMPENSATIONS</p>
                <h2 className="text-lg font-black text-[#3D405B]">BONUS RECIPIENTS</h2>
              </div>
              <div className="px-3 py-1 bg-[#3D405B] text-white text-[9px] font-black rounded-full shadow-sm">
                {yearlyBonusWinners.length} FOUND
              </div>
            </div>

            {/* Reward highlights info banner page */}
            <div className="bg-gradient-to-r from-[#3D405B] to-[#E07A5F]/90 p-5 rounded-[2rem] text-white shadow-md relative overflow-hidden flex flex-col gap-2">
              <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-[#F2CC8F]">EXCELLENCE AWARD</span>
              <h3 className="relative z-10 text-lg font-black leading-tight">CHAMPION EARNS KEY</h3>
              <p className="relative z-10 text-[11px] opacity-90 leading-relaxed max-w-[280px]">Mamazul rewards the Top Waiter of the Month with a bonus of $1,500 MXN cash inside their envelope!</p>
              <span className="absolute -right-8 -bottom-8 text-7xl opacity-15 pointer-events-none">🇲🇽</span>
            </div>

            {/* Winners cards row mapping design */}
            <div className="grid grid-cols-1 gap-4">
              {yearlyBonusWinners.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-8 text-center text-[#3D405B]/60 border border-[#F2CC8F]/25">
                  No monthly bonus winner records configured here yet.
                </div>
              ) : (
                yearlyBonusWinners.map(w => (
                  <div 
                    key={w.monthValue}
                    onClick={() => handleShowWaiterModal(w.serverName)}
                    className="bg-white p-5 rounded-[2rem] border border-[#F2CC8F]/25 shadow-sm flex items-center justify-between gap-4 cursor-pointer transform transition-transform duration-200 active:scale-[0.99] hover:border-[#E07A5F]/40"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#E07A5F]">{w.monthName.toUpperCase()} WINNER</span>
                      <span className="text-[15px] font-black text-[#3D405B] truncate max-w-[190px]">{w.serverName}</span>
                      <span className="text-[10px] font-bold text-[#3D405B]/55">Total Monthly mentions: {w.totalMentions}</span>
                    </div>
                    
                    <div className="bg-[#81B29A]/15 border border-[#81B29A]/30 text-[#81B29A] px-4 py-2 rounded-2xl text-center shrink-0 flex flex-col justify-center">
                      <span className="text-[11px] font-black tracking-wide">{w.bonusAmount.split(" ")[0]}</span>
                      <span className="text-[8px] font-black opacity-80 uppercase tracking-wider">{w.bonusAmount.split(" ")[1]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- Tab 5: Settings and Sync Controller Configuration --- */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6">
            <div className="px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#E07A5F]">TULUM PIPELINE CONTROLLER</p>
              <h2 className="text-lg font-black text-[#3D405B]">CONNECTION SETTINGS</h2>
            </div>

            {/* Input form panel card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col gap-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/55">⚙️ TARGET WORKBOOK IDENTIFIERS</h3>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-[#3D405B]/60 tracking-wider">SPREADSHEET ID KEY</label>
                <input 
                  type="text" 
                  value={inputSpreadsheetId}
                  onChange={(e) => setInputSpreadsheetId(e.target.value)}
                  className="w-full bg-[#FFF9F2] border border-[#F2CC8F]/45 px-4 py-3 rounded-xl text-xs font-medium text-[#3D405B] focus:outline-none focus:border-[#E07A5F]" 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-[#3D405B]/60 tracking-wider">WORKSHEET TAB NAME</label>
                <input 
                  type="text" 
                  value={inputSheetName}
                  onChange={(e) => setInputSheetName(e.target.value)}
                  className="w-full bg-[#FFF9F2] border border-[#F2CC8F]/45 px-4 py-3 rounded-xl text-xs font-semibold text-[#3D405B] focus:outline-none focus:border-[#E07A5F]" 
                />
              </div>

              <div className="flex gap-4 pt-1">
                <button 
                  onClick={handleSaveSettings}
                  className="flex-1 py-3 bg-[#E07A5F] text-white text-xs font-black rounded-full shadow-sm active:scale-95 transition-all text-center"
                >
                  SAVE & LIVE SYNC
                </button>
                <button 
                  onClick={handleResetSettings}
                  className="px-5 py-3 border border-[#3D405B]/20 text-[#3D405B]/60 text-xs font-bold rounded-full active:scale-95 transition-all text-center"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Database sync status logger stats */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F2CC8F]/20 flex flex-col gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3D405B]/55">📈 SYNC STATE ENGINE MONITOR</h3>
              
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b border-[#F2CC8F]/15 py-1.5">
                  <span className="text-[#3D405B]/55 font-bold">Sync Result:</span>
                  <span className={`font-black ${syncMeta.lastSyncSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    {syncMeta.lastSyncSuccess ? 'SUCCESSFUL' : 'FAILED'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F2CC8F]/15 py-1.5">
                  <span className="text-[#3D405B]/55 font-bold">Last Attempt:</span>
                  <span className="font-bold text-[#3D405B]">{formatDate(syncMeta.lastSyncTime)}</span>
                </div>
                <div className="flex flex-col gap-1 py-1.5">
                  <span className="text-[#3D405B]/55 font-bold">Pipeline Details:</span>
                  <p className="text-[11px] text-[#3D405B]/70 bg-[#FFF9F2] p-2.5 rounded-xl mt-1 border border-[#F2CC8F]/20 font-semibold leading-relaxed">
                    {syncMeta.lastSyncMessage || 'No syncing registered. Press Save or Sync above.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed guidelines instructional box */}
            <div className="bg-[#FFF9F2] rounded-[2rem] p-6 border-2 border-dashed border-[#F2CC8F]/40 flex flex-col gap-4">
              <h4 className="text-xs font-black text-[#3D405B] uppercase">Configure Google Spreadsheet:</h4>
              <ol className="text-[11px] text-[#3D405B]/75 leading-relaxed list-decimal list-inside space-y-2 font-medium">
                <li>Create or open your restaurant's reviews spreadsheet in Google Sheets.</li>
                <li>Ensure the Spreadsheet is shared to <b>"Anyone with the link can view"</b> in the top right Share menu.</li>
                <li>Copy the long string of alphanumeric keys in the address bar between '/d/' and '/edit' on your browser URL.</li>
                <li>Paste the key into the Spreadsheet ID form above, set tab name to <b>Monthly Totals</b>, and tap Save!</li>
              </ol>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Navigation Tab bar */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#F2CC8F]/30 flex justify-around items-center px-4 pb-4 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`tab-item flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all text-center ${activeTab === 'dashboard' ? 'text-[#E07A5F]' : 'text-[#3D405B]/40'}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            {activeTab === 'dashboard' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E07A5F] rounded-full"></div>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">LEADERBOARD</span>
        </button>

        <button 
          onClick={() => setActiveTab("monthly")}
          className={`tab-item flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all text-center ${activeTab === 'monthly' ? 'text-[#E07A5F]' : 'text-[#3D405B]/40'}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
            </svg>
            {activeTab === 'monthly' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E07A5F] rounded-full"></div>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">RACE</span>
        </button>

        <button 
          onClick={() => setActiveTab("yearly")}
          className={`tab-item flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all text-center ${activeTab === 'yearly' ? 'text-[#E07A5F]' : 'text-[#3D405B]/40'}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
            </svg>
            {activeTab === 'yearly' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E07A5F] rounded-full"></div>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">YEARLY</span>
        </button>

        <button 
          onClick={() => setActiveTab("bonus")}
          className={`tab-item flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all text-center ${activeTab === 'bonus' ? 'text-[#E07A5F]' : 'text-[#3D405B]/40'}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {activeTab === 'bonus' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E07A5F] rounded-full"></div>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">BONUS</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")}
          className={`tab-item flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all text-center ${activeTab === 'settings' ? 'text-[#E07A5F]' : 'text-[#3D405B]/40'}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
            {activeTab === 'settings' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E07A5F] rounded-full"></div>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">SETTINGS</span>
        </button>

      </nav>

      {/* --- Overlay Waiter Modal Bottom sheet --- */}
      {selectedWaiter && (
        <div 
          onClick={(e) => { if (e.target.id === "modal-backdrop") setSelectedWaiter(null); }}
          id="modal-backdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 transition-opacity duration-300"
        >
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 pb-10 shadow-2xl transform translate-y-0 transition-transform duration-300 ease-out border-t border-[#F2CC8F]/30 relative z-50 max-h-[85%] flex flex-col">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 shrink-0"></div>
            
            <div className="overflow-y-auto pr-1 flex-1">
              <div className="flex flex-col gap-5">
                {/* Header detail */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {selectedWaiter.serverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-[#3D405B]">{selectedWaiter.serverName}</h4>
                    <span className="text-[10px] font-black uppercase text-[#E07A5F] tracking-widest">🏆 YEAR RANK #{selectedWaiter.yearlyRank}</span>
                  </div>
                </div>

                {/* Score Indicators layout */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFF9F2] p-3.5 rounded-2xl border border-[#F2CC8F]/25 text-center">
                    <span className="text-[9px] font-black uppercase text-[#3D405B]/50 block">Cumulative Points</span>
                    <span className="text-xl font-black text-[#3D405B] mt-0.5 block">{selectedWaiter.totalMentions}</span>
                  </div>
                  
                  <div className="bg-[#FFF9F2] p-3.5 rounded-2xl border border-[#F2CC8F]/25 text-center">
                    <span className="text-[9px] font-black uppercase text-[#3D405B]/50 block">Monthly Performance Index</span>
                    <span className="text-xl font-black text-[#81B29A] mt-0.5 block">
                      {(selectedWaiter.totalMentions / (selectedWaiter.milestones.length || 1)).toFixed(1)} pts
                    </span>
                  </div>
                </div>

                {/* Visual History Trendlines */}
                <div>
                  <span className="text-[9px] font-black uppercase text-[#3D405B]/50 tracking-wider">📈 MENTIONS HISTORY TRENDLINE</span>
                  <div className="flex items-end justify-between gap-1 h-24 pt-4 border-b border-[#F2CC8F]/15">
                    {selectedWaiter.milestones.map((m) => {
                      const maxVal = Math.max(1, ...selectedWaiter.milestones.map(mile => mile.count));
                      const hPct = (m.count / maxVal) * 80;
                      return (
                        <div key={m.dateLabel} className="flex flex-col items-center flex-1 group">
                          <span className="text-[9px] font-black text-[#E07A5F] transition-opacity mb-0.5">{m.count}</span>
                          <div className="w-full bg-[#81B29A] rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${Math.max(4, hPct)}px` }}></div>
                          <span className="text-[8px] font-black text-[#3D405B]/50 mt-1 truncate max-w-[40px]">{m.dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detected detail records list */}
                <div className="mt-1">
                  <span className="text-[9px] font-black uppercase text-[#3D405B]/50 tracking-wider">🗓️ ALL DETECTED MILESTONES</span>
                  <div className="flex flex-col gap-2 mt-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                    {selectedWaiter.milestones.map(m => (
                      <div key={m.dateLabel} className="flex justify-between items-center py-2 border-b border-[#F2CC8F]/10 text-xs">
                        <span className="text-[#3D405B] font-semibold">{m.dateLabel} Target Sync</span>
                        <span className="font-black text-[#E07A5F] bg-[#E07A5F]/10 px-2.5 py-0.5 rounded-full">{m.count} points</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <button 
              onClick={() => setSelectedWaiter(null)}
              className="mt-6 w-full py-3.5 bg-[#E07A5F] text-white text-xs font-black rounded-full active:scale-95 transition-all outline-none"
            >
              DISMISS DETAILS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
