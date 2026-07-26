import "./style.css";

type Secret = {
  id: string;
  code: string;
  name: string;
  line: string;
  mark: string;
};

type SavedState = {
  selected: string[];
};

const secrets: Secret[] = [
  {
    id: "amber",
    code: "FRAME 07",
    name: "琥珀余温",
    line: "有些心意，会在靠近你时慢慢变暖。",
    mark: "07",
  },
  {
    id: "blue",
    code: "FRAME 16",
    name: "蓝调时刻",
    line: "愿所有值得记住的瞬间，都恰好有你。",
    mark: "16",
  },
  {
    id: "midnight",
    code: "FRAME 25",
    name: "午夜花火",
    line: "浪漫不必喧哗，它会在日常里突然发亮。",
    mark: "25",
  },
];

const storageKey = "xiaobai-bao-private-screening-v1";
function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Page element is missing: ${selector}`);
  return element;
}

const app = requireElement<HTMLElement>("#app");
const toast = requireElement<HTMLElement>("#toast");

let state = loadState();
let interactionLocked = false;

function loadState(): SavedState {
  if (new URLSearchParams(window.location.search).get("reset") === "xbbao") {
    localStorage.removeItem(storageKey);
    history.replaceState({}, "", window.location.pathname);
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "{}") as SavedState;
    const knownIds = new Set(secrets.map((secret) => secret.id));
    const selected = Array.isArray(parsed.selected)
      ? [...new Set(parsed.selected.filter((id) => knownIds.has(id)))].slice(0, 2)
      : [];
    return { selected };
  } catch {
    return { selected: [] };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    const swapIndex = random % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function filmRails() {
  return `
    <div class="film-rail film-rail--top" aria-hidden="true">${"<i></i>".repeat(18)}</div>
    <div class="film-rail film-rail--bottom" aria-hidden="true">${"<i></i>".repeat(18)}</div>
  `;
}

function renderIntro() {
  const hasProgress = state.selected.length > 0;
  const isComplete = state.selected.length === 2;
  const buttonLabel = isComplete ? "查看结果" : hasProgress ? "继续" : "开始";

  app.innerHTML = `
    ${filmRails()}
    <section class="screen intro-screen" aria-labelledby="intro-title">
      <header class="screen-header">
        <span>ROLL 01</span>
        <span>PRIVATE SCREENING · 2026</span>
      </header>

      <div class="intro-copy">
        <p class="eyebrow reveal-up">A SMALL FILM FOR</p>
        <h1 id="intro-title" class="display-title reveal-up reveal-up--delay">
          Xiaobai <em>bao</em>
        </h1>
        <div class="title-rule reveal-up reveal-up--delay-two" aria-hidden="true">
          <span></span><i>✦</i><span></span>
        </div>
        <p class="intro-lead reveal-up reveal-up--delay-two">有三份礼物，选两份。</p>
        <button class="primary-button reveal-up reveal-up--delay-three" id="start-button">
          <span>${buttonLabel}</span>
          <b aria-hidden="true">→</b>
        </button>
        ${
          hasProgress && !isComplete
            ? `<p class="saved-hint">已保存第一次选择</p>`
            : ""
        }
      </div>

      <footer class="screen-footer">
        <span>SHOT WITH LOVE</span>
        <span>NO. XBB—02</span>
      </footer>
    </section>
  `;

  document.querySelector<HTMLButtonElement>("#start-button")?.addEventListener("click", () => {
    if (state.selected.length === 2) {
      renderFinale();
    } else {
      renderDraw();
    }
  });
}

function renderDraw() {
  const drawNumber = state.selected.length + 1;
  const remaining = shuffle(secrets.filter((secret) => !state.selected.includes(secret.id)));
  interactionLocked = true;

  app.innerHTML = `
    ${filmRails()}
    <section class="screen draw-screen" aria-labelledby="draw-title">
      <header class="screen-header">
        <button class="text-button" id="back-button" aria-label="返回片头">← 片头</button>
        <span>TAKE 0${drawNumber} / 02</span>
      </header>

      <div class="draw-heading">
        <div class="chapter-tag">
          <span>CHAPTER</span>
          <b>0${drawNumber}</b>
        </div>
        <div>
          <p class="eyebrow">${drawNumber === 1 ? "THE FIRST TAKE" : "ONE MORE TAKE"}</p>
          <h1 id="draw-title">${drawNumber === 1 ? "第一次选择" : "再选一份"}</h1>
          <p>
            ${
              drawNumber === 1
                ? "从三张卡片中选一张。"
                : "从剩下两张中再选一张。"
            }
          </p>
        </div>
      </div>

      <div class="deck is-shuffling" id="secret-deck" aria-label="未显影的礼物底片">
        ${remaining
          .map(
            (secret, index) => `
              <button
                class="secret-card"
                data-secret-id="${secret.id}"
                aria-label="选择第 ${index + 1} 张未显影底片"
                disabled
                style="--card-index:${index}"
              >
                <span class="card-corner">0${index + 1}</span>
                <span class="card-cross" aria-hidden="true"></span>
                <span class="card-monogram">X<em>b</em></span>
                <span class="card-status">UNDEVELOPED</span>
                <span class="card-smallprint">TO BE REVEALED · 2026</span>
              </button>
            `,
          )
          .join("")}
      </div>

      <div class="draw-footer">
        <div class="progress-dots" aria-label="抽取进度：${state.selected.length} / 2">
          <i class="${state.selected.length >= 1 ? "is-filled" : ""}"></i>
          <i class="${state.selected.length >= 2 ? "is-filled" : ""}"></i>
        </div>
        <p id="draw-status" aria-live="polite">正在洗牌…</p>
      </div>
    </section>
  `;

  document.querySelector<HTMLButtonElement>("#back-button")?.addEventListener("click", renderIntro);

  window.setTimeout(() => {
    const deck = document.querySelector<HTMLElement>("#secret-deck");
    const cards = [...document.querySelectorAll<HTMLButtonElement>(".secret-card")];
    deck?.classList.remove("is-shuffling");
    cards.forEach((card) => {
      card.disabled = false;
      card.addEventListener("click", () => chooseSecret(card));
    });
    interactionLocked = false;
    const status = document.querySelector<HTMLElement>("#draw-status");
    if (status) status.textContent = "请选择一张。";
  }, 1250);
}

function chooseSecret(card: HTMLButtonElement) {
  if (interactionLocked) return;

  const secret = secrets.find((item) => item.id === card.dataset.secretId);
  if (!secret || state.selected.includes(secret.id)) return;

  interactionLocked = true;
  document.querySelectorAll<HTMLButtonElement>(".secret-card").forEach((item) => {
    item.disabled = true;
    item.classList.add(item === card ? "is-chosen" : "is-dismissed");
  });

  const status = document.querySelector<HTMLElement>("#draw-status");
  if (status) status.textContent = "正在打开…";

  window.setTimeout(() => {
    state.selected.push(secret.id);
    saveState();
    renderReveal(secret);
  }, 950);
}

function renderReveal(secret: Secret) {
  const isLast = state.selected.length === 2;

  app.innerHTML = `
    ${filmRails()}
    <section class="screen reveal-screen" aria-labelledby="secret-name">
      <header class="screen-header">
        <span>DEVELOPED</span>
        <span>TAKE 0${state.selected.length} / 02</span>
      </header>

      <div class="developed-frame">
        <div class="exposure-flash" aria-hidden="true"></div>
        <div class="developed-photo">
          <div class="photo-number">${secret.mark}</div>
          <span class="photo-star" aria-hidden="true">✦</span>
          <p>${secret.code}</p>
          <h1 id="secret-name">${secret.name}</h1>
          <blockquote>${secret.line}</blockquote>
          <div class="photo-signature">for Xiaobai bao</div>
        </div>
        <div class="frame-note">
          <span>${isLast ? "SECOND KEEPSAKE" : "FIRST KEEPSAKE"}</span>
          <span>1 / 1</span>
        </div>
      </div>

      <div class="reveal-copy">
        <p class="eyebrow">SELECTION SAVED</p>
        <h2>${isLast ? "第二份已选好。" : "第一份已选好。"}</h2>
        <p>${
          isLast
            ? "两次选择已经完成。"
            : "还剩一次选择。"
        }</p>
        <button class="primary-button" id="continue-button">
          <span>${isLast ? "查看结果" : "继续"}</span>
          <b aria-hidden="true">→</b>
        </button>
      </div>
    </section>
  `;

  document.querySelector<HTMLButtonElement>("#continue-button")?.addEventListener("click", () => {
    if (isLast) {
      renderFinale();
    } else {
      renderDraw();
    }
  });
}

function renderFinale() {
  const selected = state.selected
    .map((id) => secrets.find((secret) => secret.id === id))
    .filter((secret): secret is Secret => Boolean(secret));

  if (selected.length < 2) {
    renderDraw();
    return;
  }

  app.innerHTML = `
    ${filmRails()}
    <section class="screen finale-screen" aria-labelledby="finale-title">
      <header class="screen-header">
        <span>THE FINAL CUT</span>
        <span>ROLL COMPLETE</span>
      </header>

      <div class="finale-layout">
        <div class="finale-copy">
          <p class="eyebrow">SELECTION COMPLETE</p>
          <h1 id="finale-title">选择完成。</h1>
          <p>礼物内容暂时保密。</p>
        </div>

        <div class="result-stack" aria-label="你的两次抽取结果">
          ${selected
            .map(
              (secret, index) => `
                <article class="result-photo result-photo--${index + 1}">
                  <div class="result-image">
                    <span>${secret.mark}</span>
                    <i aria-hidden="true">✦</i>
                  </div>
                  <div class="result-caption">
                    <p>${secret.code}</p>
                    <h2>${secret.name}</h2>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="final-actions">
        <button class="primary-button" id="share-button">
          <span>分享抽签结果</span>
          <b aria-hidden="true">↗</b>
        </button>
        <button class="text-button" id="replay-button">返回片头</button>
        <p>结果已留在这台设备里，刷新页面也不会消失。</p>
      </div>

      <footer class="screen-footer">
        <span>END OF ROLL</span>
        <span>WITH LOVE, ALWAYS</span>
      </footer>
    </section>
  `;

  document.querySelector<HTMLButtonElement>("#replay-button")?.addEventListener("click", renderIntro);
  document.querySelector<HTMLButtonElement>("#share-button")?.addEventListener("click", shareResult);
}

async function shareResult() {
  const selected = state.selected
    .map((id) => secrets.find((secret) => secret.id === id))
    .filter((secret): secret is Secret => Boolean(secret));
  const text = `Xiaobai bao 的两份心动：${selected
    .map((secret) => `${secret.code}「${secret.name}」`)
    .join("、")}。`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "For Xiaobai bao · 两次心动",
        text,
      });
      showToast("结果已经准备好分享");
      return;
    }

    await navigator.clipboard.writeText(text);
    showToast("抽签结果已复制");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    showToast("可以截下这一页，把结果发给我");
  }
}

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

renderIntro();
