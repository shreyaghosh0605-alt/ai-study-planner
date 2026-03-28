const STORAGE_KEY = "ai-study-planner-topics";

let topics = loadTopics();

const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const strengthInput = document.getElementById("strength");

const addBtn = document.getElementById("addBtn");
const sampleBtn = document.getElementById("sampleBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

const totalCount = document.getElementById("totalCount");
const weakCount = document.getElementById("weakCount");
const doneCount = document.getElementById("doneCount");
const strongCount = document.getElementById("strongCount");
const completionText = document.getElementById("completionText");
const progressFill = document.getElementById("progressFill");

const suggestionBox = document.getElementById("suggestionBox");
const planList = document.getElementById("planList");
const topicList = document.getElementById("topicList");
const planEmpty = document.getElementById("planEmpty");
const topicEmpty = document.getElementById("topicEmpty");

function loadTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTopics() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
}

function uid() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function addTopic() {
  const subject = normalizeText(subjectInput.value);
  const topic = normalizeText(topicInput.value);
  const strength = strengthInput.value;

  if (!subject || !topic) {
    alert("Please enter both subject and topic.");
    return;
  }

  topics.unshift({
    id: uid(),
    subject,
    topic,
    strength,
    done: false,
    createdAt: new Date().toISOString(),
  });

  saveTopics();
  renderAll();

  subjectInput.value = "";
  topicInput.value = "";
  strengthInput.value = "strong";
  subjectInput.focus();
}

function toggleDone(id) {
  topics = topics.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );

  saveTopics();
  renderAll();
}

function deleteTopic(id) {
  topics = topics.filter((item) => item.id !== id);
  saveTopics();
  renderAll();
}

function strengthRank(strength) {
  if (strength === "weak") return 0;
  if (strength === "medium") return 1;
  return 2;
}

function prioritySort(a, b) {
  const byStrength = strengthRank(a.strength) - strengthRank(b.strength);
  if (byStrength !== 0) return byStrength;

  const byDone = Number(a.done) - Number(b.done);
  if (byDone !== 0) return byDone;

  return new Date(b.createdAt) - new Date(a.createdAt);
}

function buildStats() {
  const total = topics.length;
  const weak = topics.filter((item) => item.strength === "weak").length;
  const strong = topics.filter((item) => item.strength === "strong").length;
  const done = topics.filter((item) => item.done).length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  totalCount.textContent = total;
  weakCount.textContent = weak;
  strongCount.textContent = strong;
  doneCount.textContent = done;

  completionText.textContent = `${completion}%`;
  progressFill.style.width = `${completion}%`;
}

function buildSuggestion() {
  const undone = topics.filter((item) => !item.done);
  const weakUndone = undone.filter((item) => item.strength === "weak");

  if (weakUndone.length > 0) {
    const top = weakUndone.sort(prioritySort)[0];
    suggestionBox.innerHTML = `
      <strong>🔥 Focus today:</strong> ${top.subject} — ${top.topic}.<br/>
      Study it for 45 minutes, then solve 10 questions.
    `;
    return;
  }

  if (undone.length > 0) {
    const next = undone.sort(prioritySort)[0];
    suggestionBox.innerHTML = `
      <strong>✅ Good momentum.</strong> No weak topic is pending right now.<br/>
      Next up: ${next.subject} — ${next.topic}.
    `;
    return;
  }

  if (topics.length > 0) {
    suggestionBox.innerHTML = `
      <strong>🏁 Everything is marked complete.</strong><br/>
      Add the next chapter to continue building your revision map.
    `;
    return;
  }

  suggestionBox.innerHTML = `
    <strong>Start here:</strong> add a subject and topic above.
  `;
}

function buildPlan() {
  const plan = [...topics].sort(prioritySort).slice(0, 5);

  planList.innerHTML = "";
  topicList.innerHTML = "";

  planEmpty.style.display = topics.length ? "none" : "block";
  topicEmpty.style.display = topics.length ? "none" : "block";

  plan.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "plan-item";

    li.innerHTML = `
      <div>
        <div class="topic-title">${index + 1}. ${escapeHtml(item.subject)} — ${escapeHtml(item.topic)}</div>
        <div class="topic-meta">
          <span class="badge ${item.strength}">${item.strength}</span>
          <span>${item.done ? "completed" : "pending"}</span>
        </div>
      </div>
    `;

    planList.appendChild(li);
  });

  topics.forEach((item) => {
    const li = document.createElement("li");
    li.className = `topic-item ${item.done ? "done" : ""}`;

    li.innerHTML = `
      <div class="topic-main">
        <div class="topic-title">${escapeHtml(item.subject)} — ${escapeHtml(item.topic)}</div>
        <div class="topic-meta">
          <span class="badge ${item.strength}">${item.strength}</span>
          <span>${item.done ? "completed" : "pending"}</span>
        </div>
      </div>

      <div class="topic-actions">
        <button class="small-btn done-btn" data-action="toggle">
          ${item.done ? "Mark undone" : "Mark done"}
        </button>
        <button class="small-btn delete-btn" data-action="delete">Delete</button>
      </div>
    `;

    li.querySelector('[data-action="toggle"]').addEventListener("click", () => {
      toggleDone(item.id);
    });

    li.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteTopic(item.id);
    });

    topicList.appendChild(li);
  });
}

function renderAll() {
  buildStats();
  buildSuggestion();
  buildPlan();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(topics, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-study-planner-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  const ok = confirm("Reset everything? This will delete all saved topics.");
  if (!ok) return;

  topics = [];
  saveTopics();
  renderAll();
}

function loadSample() {
  topics = [
    {
      id: uid(),
      subject: "Mathematics",
      topic: "Probability",
      strength: "weak",
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      subject: "Electronics",
      topic: "Digital Logic",
      strength: "medium",
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      subject: "Programming",
      topic: "Loops and Functions",
      strength: "strong",
      done: true,
      createdAt: new Date().toISOString(),
    },
  ];

  saveTopics();
  renderAll();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

addBtn.addEventListener("click", addTopic);
sampleBtn.addEventListener("click", loadSample);
exportBtn.addEventListener("click", exportJson);
clearBtn.addEventListener("click", clearAll);

subjectInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTopic();
});

topicInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTopic();
});

renderAll();
