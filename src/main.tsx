import { StrictMode, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { css } from "../styled-system/css";
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

type ActionVariant = "classic" | "circular";

/** The browser owns the gesture, momentum, and snapping. JS only supplies visual feedback. */
function SwipeRow({
  chat,
  variant,
  onMute,
  onArchive,
}: {
  chat: Chat;
  variant: ActionVariant;
  onMute: () => void;
  onArchive: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current!;
    let frame = 0;
    let wasPastThreshold = false;
    const actions = actionsRef.current!;
    const buttons = actions.querySelectorAll("button");
    const revealAnimations: (Animation | undefined)[] = [];

    const update = () => {
      const progress = Math.max(
        0,
        Math.min(1, scroller.scrollLeft / actions.offsetWidth),
      );
      scroller.style.setProperty("--reveal", String(progress));
      setRevealed(progress > 0.05);

      if (variant === "circular") {
        buttons.forEach((button, index) => {
          // Latch each phase until closed, so reversing a swipe won't restart it.
          if (scroller.scrollLeft <= 1) {
            revealAnimations[index]?.cancel();
            revealAnimations[index] = undefined;
          } else if (
            progress >= (index === 0 ? 0.4 : 0.8) &&
            !revealAnimations[index] &&
            !prefersReducedMotion()
          ) {
            revealAnimations[index] = button.animate(
              [
                { transform: "scale(0)", offset: 0, easing: "ease-out" },
                { transform: "scale(1.07)", offset: 0.4, easing: "ease-in-out" },
                { transform: "scale(0.99)", offset: 0.75, easing: "ease-in-out" },
                { transform: "scale(1)", offset: 1 },
              ],
              { duration: 581, fill: "both" },
            );
          }
        });
      }

      const pastThreshold = progress >= 0.8;
      if (
        variant === "classic" &&
        pastThreshold &&
        !wasPastThreshold &&
        !prefersReducedMotion()
      ) {
        actions.querySelectorAll("button svg").forEach((icon, index) => {
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
      revealAnimations.forEach((animation) => animation?.cancel());
    };
  }, [variant]);

  const close = () =>
    scrollerRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });

  return (
    <li className={css({ overflow: "hidden" })}>
      <div
        className={css({
          "--reveal": "0",
          display: "flex",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        })}
        ref={scrollerRef}
        data-chat-id={chat.id}
      >
        <div
          className={css({
            position: "relative",
            flex: "0 0 100%",
            minWidth: "0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "15px 20px",
            background:
              variant === "circular"
                ? "rgba(var(--reveal-color), var(--reveal))"
                : "var(--surface)",
            borderRadius: "16px",
            overflow: variant === "circular" ? "hidden" : undefined,
            scrollSnapAlign: "start",
            touchAction: "pan-x pan-y",
            userSelect: "none",
            _after: {
              content: '""',
              position: "absolute",
              left: "82px",
              bottom: "0",
              right: "0",
              height: "1px",
              background: "var(--row-separator-color)",
              opacity:
                variant === "circular" ? "calc(1 - var(--reveal))" : undefined,
            },
            "li:last-child &": { _after: { display: "none" } },
            "@media (max-width: 520px)": {
              padding: "14px 15px",
              gap: "10px",
              _after: { left: "74px" },
            },
          })}
          onClick={close}
        >
          <div
            className={css({
              position: "relative",
              width: "49px",
              height: "49px",
              flexShrink: "0",
              display: "grid",
              placeItems: "center",
              color: "white",
              borderRadius: "50%",
              fontSize:
                chat.color === "violet"
                  ? "35px"
                  : chat.color === "green"
                    ? "32px"
                    : chat.color === "cyan"
                      ? "33px"
                      : chat.color === "lemon"
                        ? "26px"
                        : "17px",
              fontWeight: "550",
              letterSpacing: "-0.5px",
              background:
                chat.color === "peach"
                  ? "linear-gradient(145deg, #efc0a4, #d8917b)"
                  : chat.color === "violet"
                    ? "linear-gradient(145deg, #b0a5ed, #8070c9)"
                    : chat.color === "blue"
                      ? "linear-gradient(145deg, #89b9e1, #5e89b7)"
                      : chat.color === "green"
                        ? "linear-gradient(145deg, #a0cdb4, #68a387)"
                        : chat.color === "rose"
                          ? "linear-gradient(145deg, #e8b1c1, #c47f9a)"
                          : chat.color === "cyan"
                            ? "linear-gradient(145deg, #93ccda, #5b9eaf)"
                            : chat.color === "gold"
                              ? "linear-gradient(145deg, #dcc092, #b29874)"
                              : chat.color === "lemon"
                                ? "#f4e9b8"
                                : undefined,
            })}
            aria-hidden="true"
          >
            {chat.initials}
            {chat.online && (
              <span
                className={css({
                  position: "absolute",
                  right: "0",
                  bottom: "1px",
                  width: "12px",
                  height: "12px",
                  background: "#62bd86",
                  border: "2.5px solid var(--surface)",
                  borderRadius: "50%",
                })}
              />
            )}
          </div>
          <div className={css({ minWidth: "0", flex: "1" })}>
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
              })}
            >
              <span
                className={css({
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "13px",
                  fontWeight: "650",
                  letterSpacing: "-0.15px",
                })}
              >
                {chat.name}
              </span>
              {chat.muted && (
                <Icon
                  name="mute"
                  className={css({
                    width: "12px",
                    height: "12px",
                    color: "#b2bac4",
                    flexShrink: "0",
                  })}
                />
              )}
              <div
                className={css({
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#a4acb7",
                  fontSize: "9px",
                  whiteSpace: "nowrap",
                })}
              >
                {chat.sent && (
                  <Icon
                    name="check"
                    className={css({
                      width: "15px",
                      height: "15px",
                      color: "#56afd9",
                    })}
                  />
                )}
                <time>{chat.time}</time>
              </div>
            </div>
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "6px",
              })}
            >
              <span
                className={css({
                  minWidth: "0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "11px",
                  color: "#929ca8",
                  lineHeight: "18px",
                })}
              >
                {chat.sender && (
                  <span className={css({ color: "#5a6879" })}>
                    {chat.sender}:{" "}
                  </span>
                )}
                {chat.preview}
              </span>
              {chat.unread ? (
                <span
                  className={css({
                    display: "grid",
                    placeItems: "center",
                    flexShrink: "0",
                    marginLeft: "auto",
                    height: "18px",
                    minWidth: "18px",
                    padding: "0 5px",
                    borderRadius: "10px",
                    background: chat.muted ? "#c2cad3" : "#43a7dc",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "600",
                  })}
                >
                  {chat.unread}
                </span>
              ) : chat.pinned ? (
                <Icon
                  name="pin"
                  className={css({
                    width: "13px",
                    height: "13px",
                    marginLeft: "auto",
                    color: "#b6c0cb",
                    flexShrink: "0",
                  })}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div
          ref={actionsRef}
          className={css({
            display: "flex",
            flex: "0 0 160px",
            alignSelf: "stretch",
            scrollSnapAlign: "end",
            alignItems: variant === "circular" ? "center" : undefined,
            gap: variant === "circular" ? "12px" : undefined,
            padding: variant === "circular" ? "0 14px" : undefined,
            background: "transparent",
          })}
          inert={!revealed}
        >
          <button
            className={css({
              display: "flex",
              flex: variant === "circular" ? "0 0 60px" : "1",
              height: variant === "circular" ? "60px" : undefined,
              borderRadius: variant === "circular" ? "50%" : undefined,
              minWidth: "0",
              justifyContent: "center",
              alignItems: "center",
              border: "0",
              padding: "0",
              color: "white",
              background: "#9299c6",
              transform: variant === "circular" ? "scale(0)" : undefined,
              "@media (prefers-reduced-motion: reduce)": { transform: "none" },
              "&:active": { filter: "brightness(0.94)" },
              "&:focus-visible": {
                outlineOffset: "-4px",
                outlineColor: "white",
              },
            })}
            aria-label={`${chat.muted ? "Unmute" : "Mute"} ${chat.name}`}
            onClick={() => {
              onMute();
              close();
            }}
          >
            <span
              className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: variant === "classic" ? "7px" : undefined,
                fontSize: "10px",
                fontWeight: "550",
                opacity:
                  variant === "circular"
                    ? "1"
                    : "calc(0.35 + var(--reveal) * 0.65)",
                transform:
                  variant === "circular"
                    ? undefined
                    : "translateX(calc((1 - var(--reveal)) * 12px)) scale(calc(0.86 + var(--reveal) * 0.14))",
                "@media (prefers-reduced-motion: reduce)": {
                  transform: "none",
                  opacity: "1",
                },
              })}
            >
              <Icon
                name={chat.muted ? "bell" : "mute"}
                className={css({ width: "23px", height: "23px" })}
              />
              {variant === "classic" && (
                <span>{chat.muted ? "Unmute" : "Mute"}</span>
              )}
            </span>
          </button>
          <button
            className={css({
              display: "flex",
              flex: variant === "circular" ? "0 0 60px" : "1",
              height: variant === "circular" ? "60px" : undefined,
              borderRadius: variant === "circular" ? "50%" : undefined,
              minWidth: "0",
              justifyContent: "center",
              alignItems: "center",
              border: "0",
              padding: "0",
              color: "white",
              background: "#469ed3",
              transform: variant === "circular" ? "scale(0)" : undefined,
              "@media (prefers-reduced-motion: reduce)": { transform: "none" },
              "&:active": { filter: "brightness(0.94)" },
              "&:focus-visible": {
                outlineOffset: "-4px",
                outlineColor: "white",
              },
            })}
            aria-label={`Archive ${chat.name}`}
            onClick={onArchive}
          >
            <span
              className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: variant === "classic" ? "7px" : undefined,
                fontSize: "10px",
                fontWeight: "550",
                opacity:
                  variant === "circular"
                    ? "1"
                    : "calc(0.35 + var(--reveal) * 0.65)",
                transform:
                  variant === "circular"
                    ? undefined
                    : "translateX(calc((1 - var(--reveal)) * 12px)) scale(calc(0.86 + var(--reveal) * 0.14))",
                "@media (prefers-reduced-motion: reduce)": {
                  transform: "none",
                  opacity: "1",
                },
              })}
            >
              <Icon
                name="archive"
                className={css({ width: "23px", height: "23px" })}
              />
              {variant === "classic" && <span>Archive</span>}
            </span>
          </button>
        </div>
      </div>
    </li>
  );
}

function ConversationDemo({ variant }: { variant: ActionVariant }) {
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
      ?.querySelectorAll("[data-chat-id]")
      .forEach((row) => row.scrollTo({ left: 0, behavior: "instant" }));
    setChats(initialChats);
    setFilter("all");
    setQuery("");
    setNotice(null);
  }

  return (
    <>
      <section
        className={css({
          position: "relative",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "19px",
          overflow: "hidden",
          boxShadow: "0 16px 45px -20px #2d486b30, 0 2px 5px #263c5003",
          "@media (max-width: 520px)": { borderRadius: "16px" },
        })}
        aria-label={
          variant === "circular"
            ? "Circular actions demo"
            : "Conversation list demo"
        }
      >
        <header
          className={css({
            padding: "22px 21px 0",
            "@media (max-width: 520px)": { padding: "20px 16px 0" },
          })}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            })}
          >
            <h2
              className={css({
                fontSize: "23px",
                fontWeight: "700",
                letterSpacing: "-0.8px",
                margin: "0",
              })}
            >
              Chats
            </h2>
            <span
              className={css({
                marginLeft: "auto",
                fontSize: "10px",
                color: "#9aa4ae",
                "@media (max-width: 520px)": { fontSize: "9px" },
              })}
            >
              {variant === "circular"
                ? "Circular actions"
                : "Demo conversations"}
            </span>
          </div>
          <label
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "9px",
              borderRadius: "9px",
              padding: "10px 12px",
              background: "var(--control-bg)",
              color: "#9ba6b1",
              "&:focus-within": { boxShadow: "0 0 0 2px #299adb55" },
            })}
          >
            <Icon
              name="search"
              className={css({
                width: "17px",
                height: "17px",
                flexShrink: "0",
              })}
            />
            <input
              className={css({
                width: "100%",
                border: "0",
                outline: "medium none currentColor",
                minWidth: "0",
                background: "transparent",
                fontSize: "12px",
                color: "#394656",
                _placeholder: { color: "#96a0ac" },
              })}
              placeholder="Search conversations"
              aria-label="Search conversations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span
              className={css({
                color: "#bbc2ca",
                fontSize: "17px",
                lineHeight: "1",
              })}
            >
              ⌕
            </span>
          </label>
          <div
            className={css({ display: "flex", gap: "23px", marginTop: "14px" })}
            aria-label="Filter conversations"
          >
            <button
              aria-pressed={filter === "all"}
              className={css({
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 1px 14px",
                color: "#98a0ab",
                border: "0",
                background: "transparent",
                fontSize: "12px",
                fontWeight: "600",
                '&[aria-pressed="true"]': {
                  color: "#2996d0",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "3px",
                    background: "#299bd5",
                    borderRadius: "3px 3px 0 0",
                  },
                },
              })}
              onClick={() => setFilter("all")}
            >
              All chats{" "}
              <span
                className={css({
                  fontSize: "9px",
                  background: "var(--count-bg)",
                  color: "#919ba8",
                  padding: "2px 5px",
                  borderRadius: "8px",
                  'button[aria-pressed="true"] &': {
                    color: "#2797d1",
                    background: "var(--count-active-bg)",
                  },
                })}
              >
                {chats.length}
              </span>
            </button>
            <button
              aria-pressed={filter === "unread"}
              className={css({
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 1px 14px",
                color: "#98a0ab",
                border: "0",
                background: "transparent",
                fontSize: "12px",
                fontWeight: "600",
                '&[aria-pressed="true"]': {
                  color: "#2996d0",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "3px",
                    background: "#299bd5",
                    borderRadius: "3px 3px 0 0",
                  },
                },
              })}
              onClick={() => setFilter("unread")}
            >
              Unread{" "}
              <span
                className={css({
                  fontSize: "9px",
                  background: "var(--count-bg)",
                  color: "#919ba8",
                  padding: "2px 5px",
                  borderRadius: "8px",
                  'button[aria-pressed="true"] &': {
                    color: "#2797d1",
                    background: "var(--count-active-bg)",
                  },
                })}
              >
                {unreadCount}
              </span>
            </button>
          </div>
        </header>

        <ul
          className={css({
            listStyle: "none",
            padding: "0",
            margin: "0",
            borderTop: "1px solid var(--separator-color)",
          })}
          ref={listRef}
        >
          {shownChats.map((chat) => (
            <SwipeRow
              key={chat.id}
              chat={chat}
              variant={variant}
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
            <li
              className={css({
                padding: "60px 20px",
                textAlign: "center",
                color: "#929ca8",
                fontSize: "13px",
              })}
            >
              {query ? "No conversations found." : "You’re all caught up."}
            </li>
          )}
        </ul>
        <footer
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "15px 10px",
            background: "var(--surface-subtle)",
            borderTop: "1px solid var(--separator-color)",
            fontSize: "9px",
            color: "#9aa6b4",
            "@media (max-width: 520px)": { fontSize: "8px", gap: "4px" },
          })}
        >
          <Icon
            name="swipe"
            className={css({
              width: "14px",
              height: "14px",
              marginRight: "2px",
            })}
          />
          <span>Swipe left for mute & archive</span>
          <span className={css({ padding: "0 2px", color: "#c3ccd5" })}>·</span>
          <span>Swipe right to close</span>
        </footer>
        {notice && (
          <div
            className={css({
              position: "absolute",
              bottom: "52px",
              left: "12px",
              right: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "13px 16px",
              borderRadius: "10px",
              background: "#263647",
              color: "white",
              fontSize: "12px",
              boxShadow: "0 4px 20px #172a4226",
              animation: "toast-in 180ms ease-out",
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            })}
            role="status"
          >
            <span>{notice.text}</span>
            {notice.undo && (
              <button
                className={css({
                  border: "0",
                  padding: "0",
                  background: "transparent",
                  color: "#89cef4",
                  fontWeight: "600",
                  fontSize: "12px",
                })}
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

      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          margin: "17px 3px 0",
          fontSize: "10px",
          color: "#97a2af",
          "@media (max-width: 520px)": { fontSize: "9px", gap: "5px" },
        })}
      >
        <span>Try it with touch or a trackpad.</span>
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "13px",
            "@media (max-width: 520px)": { gap: "10px" },
          })}
        >
          <button
            className={css({
              padding: "5px 0",
              border: "0",
              background: "transparent",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#398fbf",
              "&:hover": { color: "#246e97" },
            })}
            onClick={() => {
              const row = listRef.current?.querySelector("[data-chat-id]");
              row?.scrollTo({
                left: row.scrollWidth,
                behavior: scrollBehavior(),
              });
            }}
          >
            Preview swipe{" "}
            <Icon
              name="arrow"
              className={css({ width: "12px", height: "12px" })}
            />
          </button>
          <button
            className={css({
              padding: "5px 0",
              border: "0",
              background: "transparent",
              fontSize: "10px",
              color: "#9da6b2",
              "&:hover": { color: "#246e97" },
            })}
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <main
      className={css({
        width: "min(100% - 40px, 460px)",
        margin: "0 auto",
        padding: "54px 0 26px",
        "@media (max-width: 520px)": {
          width: "min(100% - 24px, 460px)",
          paddingTop: "28px",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        },
      })}
    >
      <header
        className={css({
          textAlign: "center",
          marginBottom: "29px",
          "@media (max-width: 520px)": { marginBottom: "23px" },
        })}
      >
        <span
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            color: "#83909e",
            fontSize: "9px",
            fontWeight: "650",
            letterSpacing: "1.7px",
          })}
        >
          <span
            className={css({
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#48a9d7",
              boxShadow: "0 0 0 3px #e4edf4",
            })}
          />
          WEB DEMO
        </span>
        <h1
          className={css({
            margin: "15px 0 8px",
            fontSize: "28px",
            lineHeight: "1.2",
            letterSpacing: "-1px",
            fontWeight: "600",
            textWrap: "pretty",
            "@media (max-width: 520px)": { fontSize: "25px" },
          })}
        >
          Swipe Actions with CSS Scroll Snap
        </h1>
        <p
          className={css({
            margin: "0",
            fontSize: "12px",
            color: "#8a94a1",
            "@media (max-width: 520px)": { fontSize: "11px" },
          })}
        >
          Swipe a list row to reveal contextual actions.
        </p>
      </header>

      <ConversationDemo variant="classic" />
      <div className={css({ marginTop: "48px" })}>
        <ConversationDemo variant="circular" />
      </div>
      <footer
        className={css({
          display: "flex",
          justifyContent: "center",
          gap: "9px",
          marginTop: "31px",
          color: "#aab4bf",
          fontSize: "8px",
          letterSpacing: "1.15px",
          "@media (max-width: 520px)": {
            fontSize: "7px",
            gap: "6px",
            letterSpacing: "0.8px",
          },
        })}
      >
        NATIVE SCROLL <span className={css({ color: "#bdc5ce" })}>+</span> CSS
        SCROLL SNAP <span className={css({ color: "#bdc5ce" })}>·</span> NO
        GESTURE LIBRARY
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
