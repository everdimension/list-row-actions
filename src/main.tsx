import { StrictMode, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type IconName =
  | "plane"
  | "search"
  | "mute"
  | "bell"
  | "archive"
  | "check"
  | "pin"
  | "arrow"
  | "swipe";

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    plane: <path d="m21 3-7 18-4-7-7-4L21 3Zm0 0L10 14" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    mute: (
      <>
        <path d="M9.5 4.5A5 5 0 0 1 17 9v4l3 4H8M7 9v4l-3 4M10 21h4M3 3l18 18" />
      </>
    ),
    bell: (
      <>
        <path d="M7 9a5 5 0 0 1 10 0v4l3 4H4l3-4V9ZM10 21h4" />
      </>
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="4" rx="1" />
        <path d="M5 7v13h14V7M9 11h6" />
      </>
    ),
    check: (
      <>
        <path d="m2 12 4 4L16 6M10 15l2 2L22 7" />
      </>
    ),
    pin: <path d="m15 3 6 6-3 1-4 4-1 4-3-3-5 5m5-5-4-4 4-1 4-4 1-3Z" />,
    arrow: <path d="M19 12H5m6-6-6 6 6 6" />,
    swipe: (
      <>
        <path d="M20 7H4m4-4L4 7l4 4M5 16h14M15 12l4 4-4 4" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type Chat = {
  id: number;
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  unread?: number;
  muted?: boolean;
  pinned?: boolean;
  sent?: boolean;
  online?: boolean;
  sender?: string;
};

const initialChats: Chat[] = [
  {
    id: 1,
    name: "Sofia Chen",
    initials: "SC",
    color: "peach",
    preview: "That little place on the corner? ☕",
    time: "12:42",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "The design corner",
    initials: "✳",
    color: "violet",
    sender: "Oliver",
    preview: "okay, one more tiny iteration",
    time: "12:38",
    unread: 12,
    pinned: true,
  },
  {
    id: 3,
    name: "Alex Morgan",
    initials: "AM",
    color: "blue",
    preview: "Sent you the playlist. No skips.",
    time: "12:24",
    sent: true,
    online: true,
  },
  {
    id: 4,
    name: "Weekend people",
    initials: "☀",
    color: "green",
    sender: "Mia",
    preview: "Photo",
    time: "11:56",
    unread: 4,
    muted: true,
  },
  {
    id: 5,
    name: "Nina Park",
    initials: "NP",
    color: "rose",
    preview: "This is exactly what I had in mind",
    time: "11:30",
    sent: true,
  },
  {
    id: 6,
    name: "Product notes",
    initials: "↗",
    color: "cyan",
    preview: "Small details, big difference.",
    time: "10:48",
    unread: 1,
    muted: true,
  },
  {
    id: 7,
    name: "Leo Rivera",
    initials: "LR",
    color: "gold",
    preview: "Voice message · 0:18",
    time: "10:12",
  },
  {
    id: 8,
    name: "Sunday dinner",
    initials: "🍋",
    color: "lemon",
    sender: "You",
    preview: "I’ll bring something sweet",
    time: "Yesterday",
    sent: true,
    muted: true,
  },
];

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "instant" : "smooth";

/** The browser owns the gesture, momentum, and snapping. JS only supplies visual feedback. */
function SwipeRow({
  chat,
  onMute,
  onArchive,
}: {
  chat: Chat;
  onMute: () => void;
  onArchive: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current!;
    let frame = 0;
    let wasPastThreshold = false;
    const actions = scroller.querySelector<HTMLElement>(".row-actions")!;

    const update = () => {
      const progress = Math.max(
        0,
        Math.min(1, scroller.scrollLeft / actions.offsetWidth),
      );
      actions.style.setProperty("--reveal", String(progress));
      setRevealed(progress > 0.05);

      const pastThreshold = progress >= 0.8;
      if (pastThreshold && !wasPastThreshold && !prefersReducedMotion()) {
        scroller.querySelectorAll(".action-icon").forEach((icon, index) => {
          icon.getAnimations().forEach((animation) => animation.cancel());
          icon.animate(
            [
              { transform: "scale(1)", offset: 0 },
              { transform: "scale(1.25)", offset: 0.35 },
              { transform: "scale(.96)", offset: 0.7 },
              { transform: "scale(1)", offset: 1 },
            ],
            { duration: 420, delay: index * 70, easing: "ease-out" },
          );
        });
      }
      wasPastThreshold = pastThreshold;
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = () =>
    scrollerRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });

  return (
    <li className="chat-row">
      <div className="row-scroller" ref={scrollerRef} data-chat-id={chat.id}>
        <div className="conversation" onClick={close}>
          <div className={`avatar ${chat.color}`} aria-hidden="true">
            {chat.initials}
            {chat.online && <span className="online-dot" />}
          </div>
          <div className="conversation-copy">
            <div className="conversation-topline">
              <span className="conversation-name">{chat.name}</span>
              {chat.muted && <Icon name="mute" className="muted-icon" />}
              <div className="timestamp">
                {chat.sent && <Icon name="check" />}
                <time>{chat.time}</time>
              </div>
            </div>
            <div className="conversation-bottomline">
              <span className="preview">
                {chat.sender && <span className="sender">{chat.sender}: </span>}
                {chat.preview}
              </span>
              {chat.unread ? (
                <span className={`unread ${chat.muted ? "muted" : ""}`}>
                  {chat.unread}
                </span>
              ) : chat.pinned ? (
                <Icon name="pin" className="pin-icon" />
              ) : null}
            </div>
          </div>
        </div>
        <div className="row-actions" inert={!revealed}>
          <button
            className="row-action mute-action"
            aria-label={`${chat.muted ? "Unmute" : "Mute"} ${chat.name}`}
            onClick={() => {
              onMute();
              close();
            }}
          >
            <span className="action-content">
              <Icon
                name={chat.muted ? "bell" : "mute"}
                className="action-icon"
              />
              <span>{chat.muted ? "Unmute" : "Mute"}</span>
            </span>
          </button>
          <button
            className="row-action archive-action"
            aria-label={`Archive ${chat.name}`}
            onClick={onArchive}
          >
            <span className="action-content">
              <Icon name="archive" className="action-icon" />
              <span>Archive</span>
            </span>
          </button>
        </div>
      </div>
    </li>
  );
}

function App() {
  const [chats, setChats] = useState(initialChats);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notice, setNotice] = useState<{
    text: string;
    undo?: () => void;
  } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const shownChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || chat.unread),
  );
  const unreadCount = chats.filter((chat) => chat.unread).length;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function archive(chat: Chat) {
    const index = chats.findIndex((item) => item.id === chat.id);
    setChats((current) => current.filter((item) => item.id !== chat.id));
    setNotice({
      text: `${chat.name} archived`,
      undo: () =>
        setChats((current) => {
          if (current.some((item) => item.id === chat.id)) return current;
          const restored = [...current];
          restored.splice(index, 0, chat);
          return restored;
        }),
    });
  }

  function reset() {
    listRef.current
      ?.querySelectorAll(".row-scroller")
      .forEach((row) => row.scrollTo({ left: 0, behavior: "instant" }));
    setChats(initialChats);
    setFilter("all");
    setQuery("");
    setNotice(null);
  }

  return (
    <main className="demo">
      <header className="demo-heading">
        <span className="eyebrow">
          <span className="status-dot" />
          WEB DEMO
        </span>
        <h1 style={{ textWrap: "pretty" }}>
          Swipe Actions with CSS Scroll Snap
        </h1>
        <p>Swipe a list row to reveal contextual actions.</p>
      </header>

      <section className="messenger" aria-label="Conversation list demo">
        <header className="messenger-header">
          <div className="app-heading">
            <h2>Chats</h2>
            <span className="connection-status">Demo conversations</span>
          </div>
          <label className="search">
            <Icon name="search" />
            <input
              placeholder="Search conversations"
              aria-label="Search conversations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="search-hint">⌕</span>
          </label>
          <div className="filters" aria-label="Filter conversations">
            <button
              aria-pressed={filter === "all"}
              className={filter === "all" ? "selected" : ""}
              onClick={() => setFilter("all")}
            >
              All chats <span>{chats.length}</span>
            </button>
            <button
              aria-pressed={filter === "unread"}
              className={filter === "unread" ? "selected" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread <span>{unreadCount}</span>
            </button>
          </div>
        </header>

        <ul className="conversation-list" ref={listRef}>
          {shownChats.map((chat) => (
            <SwipeRow
              key={chat.id}
              chat={chat}
              onArchive={() => archive(chat)}
              onMute={() => {
                setChats((current) =>
                  current.map((item) =>
                    item.id === chat.id
                      ? { ...item, muted: !item.muted }
                      : item,
                  ),
                );
                setNotice({
                  text: `${chat.name} ${chat.muted ? "unmuted" : "muted"}`,
                });
              }}
            />
          ))}
          {shownChats.length === 0 && (
            <li className="empty-state">
              {query ? "No conversations found." : "You’re all caught up."}
            </li>
          )}
        </ul>
        <footer className="messenger-footer">
          <Icon name="swipe" />
          <span>Swipe left for mute & archive</span>
          <span className="footer-dot">·</span>
          <span>Swipe right to close</span>
        </footer>
        {notice && (
          <div className="toast" role="status">
            <span>{notice.text}</span>
            {notice.undo && (
              <button
                onClick={() => {
                  notice.undo?.();
                  setNotice(null);
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </section>

      <div className="demo-controls">
        <span>Try it with touch or a trackpad.</span>
        <div>
          <button
            className="preview-button"
            onClick={() => {
              const row = listRef.current?.querySelector(".row-scroller");
              row?.scrollTo({
                left: row.scrollWidth,
                behavior: scrollBehavior(),
              });
            }}
          >
            Preview swipe <Icon name="arrow" />
          </button>
          <button className="reset-button" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
      <footer className="page-footer">
        NATIVE SCROLL <span>+</span> CSS SCROLL SNAP <span>·</span> NO GESTURE
        LIBRARY
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
