import {
  StrictMode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { css } from "../styled-system/css";
import "./styles.css";

type IconName =
  | "plane"
  | "mute"
  | "bell"
  | "archive"
  | "mail"
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
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
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
    name: "John Lennon",
    initials: "SC",
    color: "orange",
    preview: "That little place on the corner? ☕",
    time: "12:42",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "The design corner",
    initials: "✳\uFE0E", // Request text presentation so iOS doesn't render a colored emoji.
    color: "red",
    sender: "Oliver",
    preview: "okay, one more tiny iteration",
    time: "12:38",
    unread: 12,
    pinned: true,
  },
  {
    id: 3,
    name: "Ringo Starr",
    initials: "AM",
    color: "blue",
    preview: "Sent you the playlist. No skips.",
    time: "12:24",
    sent: true,
    online: true,
  },
  {
    id: 4,
    name: "Final build",
    initials: "☀\uFE0E", // Request text presentation so iOS doesn't render a colored emoji.
    color: "sky",
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
    color: "pink",
    preview: "This is exactly what I had in mind",
    time: "11:30",
    sent: true,
  },
  {
    id: 6,
    name: "Product notes",
    initials: "↗",
    color: "amber",
    preview: "Small details, big difference.",
    time: "10:48",
    unread: 1,
    muted: true,
  },
  {
    id: 7,
    name: "Leo Rivera",
    initials: "LR",
    color: "slate",
    preview: "Voice message · 0:18",
    time: "10:12",
  },
  {
    id: 8,
    name: "Sunday dinner",
    initials: "SD",
    color: "yellow",
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

type ActionVariant = "classic" | "circular" | "circular-leading";

function CircularActionButton({
  icon,
  label,
  onClick,
  tone = "accent",
  size = "50px",
  style,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  size?: string;
  tone?: "accent" | "secondary" | "surface";
  style?: CSSProperties;
}) {
  return (
    <button
      style={{ ["--size" as string]: size }}
      className={css({
        display: "grid",
        placeItems: "center",
        flex: "0 0 var(--size)",
        height: "var(--size)",
        border: "0",
        borderRadius: "50%",
        padding: "0",
        background:
          tone === "secondary"
            ? "var(--secondary-action)"
            : tone === "surface"
              ? "var(--surface)"
              : "var(--accent-solid)",
        color:
          tone === "secondary" || tone === "surface"
            ? "var(--secondary-action-foreground)"
            : "var(--accent-foreground)",
        ...style,
        "@media (prefers-reduced-motion: reduce)": { transform: "none" },
        "&:active": { filter: "brightness(0.94)" },
        "&:focus-visible": {
          outlineOffset: "-4px",
          outlineColor:
            tone === "secondary" || tone === "surface"
              ? "var(--secondary-action-foreground)"
              : "var(--accent-foreground)",
        },
      })}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} className={css({ width: "23px", height: "23px" })} />
    </button>
  );
}

/** The browser owns gestures and snapping; enhanced variants add reveal feedback. */
function SwipeRow({
  chat,
  variant,
  onMute,
  onArchive,
  onToggleRead,
}: {
  chat: Chat;
  variant: ActionVariant;
  onMute: () => void;
  onArchive: () => void;
  onToggleRead: () => void;
}) {
  const isCircular = variant !== "classic";
  const hasLeadingActions = variant === "circular-leading";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const leadingActionsRef = useRef<HTMLDivElement>(null);
  const [revealedEdge, setRevealedEdge] = useState<
    "leading" | "trailing" | null
  >(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current!;
    let frame = 0;
    let wasPastThreshold = false;
    const actions = actionsRef.current;
    if (!actions) {
      return;
    }
    const buttons = actions.querySelectorAll("button");
    const leadingActions = leadingActionsRef.current;
    const buttonReveals = [
      ...Array.from(buttons, (button, index) => ({
        button,
        edge: "trailing",
        threshold: index === 0 ? 0.4 : 0.8,
      })),
      ...Array.from(
        leadingActions?.querySelectorAll("button") ?? [],
        (button) => ({
          button,
          edge: "leading",
          threshold: 0.4,
        }),
      ),
    ];
    const revealAnimations: (Animation | undefined)[] = [];

    const update = () => {
      const closedOffset = leadingActions?.offsetWidth ?? 0;
      const displacement = scroller.scrollLeft - closedOffset;
      const progress = Math.max(
        0,
        Math.min(1, displacement / actions.offsetWidth),
      );
      const leadingProgress =
        closedOffset > 0
          ? Math.max(0, Math.min(1, -displacement / closedOffset))
          : 0;
      scroller.style.setProperty(
        "--reveal",
        String(Math.max(progress, leadingProgress)),
      );
      setRevealedEdge(
        leadingProgress > 0.05
          ? "leading"
          : progress > 0.05
            ? "trailing"
            : null,
      );

      if (isCircular) {
        buttonReveals.forEach(({ button, edge, threshold }, index) => {
          const buttonProgress =
            edge === "leading" ? leadingProgress : progress;
          // Reset when this edge closes, including swipes that cross to the other edge.
          if (buttonProgress <= 0.01) {
            revealAnimations[index]?.cancel();
            revealAnimations[index] = undefined;
          } else if (
            buttonProgress >= threshold &&
            !revealAnimations[index] &&
            !prefersReducedMotion()
          ) {
            revealAnimations[index] = button.animate(
              [
                { transform: "scale(0)", offset: 0, easing: "ease-out" },
                {
                  transform: "scale(1.07)",
                  offset: 0.4,
                  easing: "ease-in-out",
                },
                {
                  transform: "scale(0.99)",
                  offset: 0.75,
                  easing: "ease-in-out",
                },
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
    // With a leading tray, the closed row starts after it. Position before first paint.
    scroller.scrollTo({
      left: leadingActions?.offsetWidth ?? 0,
      behavior: "instant",
    });
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      revealAnimations.forEach((animation) => animation?.cancel());
    };
  }, [variant, isCircular]);

  const close = () =>
    scrollerRef.current?.scrollTo({
      left: leadingActionsRef.current?.offsetWidth ?? 0,
      behavior: scrollBehavior(),
    });

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
        {hasLeadingActions && (
          <div
            ref={leadingActionsRef}
            data-leading-actions=""
            className={css({
              display: "flex",
              flex: "0 0 78px",
              alignItems: "center",
              padding: "0 14px",
              scrollSnapAlign: "start",
            })}
            inert={revealedEdge !== "leading"}
          >
            <CircularActionButton
              icon={chat.unread ? "check" : "mail"}
              label={`Mark ${chat.name} as ${chat.unread ? "read" : "unread"}`}
              style={{ transform: "scale(0)" }}
              onClick={() => {
                onToggleRead();
                close();
              }}
            />
          </div>
        )}
        <div
          className={css({
            position: "relative",
            flex: "0 0 100%",
            minWidth: "0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "15px 20px",
            background: isCircular
              ? "rgba(var(--reveal-color), var(--reveal))"
              : "var(--surface)",
            borderRadius: "16px",
            overflow: isCircular ? "hidden" : undefined,
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            touchAction: "pan-x pan-y",
            userSelect: "none",
            _after: {
              display: isCircular ? "none" : undefined,
              content: '""',
              position: "absolute",
              left: "82px",
              bottom: "0",
              right: "0",
              height: "1px",
              background: "var(--row-separator-color)",
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
              color: "var(--avatar-ink)",
              borderRadius: "50%",
              fontSize:
                chat.color === "red" ||
                chat.color === "sky" ||
                chat.color === "amber"
                  ? "24px"
                  : "15px",
              fontWeight: "500",
              letterSpacing: "-0.5px",
              backgroundColor: "var(--avatar-bg)",
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 4px, var(--avatar-hatch) 4px 5px)",
              boxShadow: "inset 0 0 0 1px var(--avatar-border)",
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
                  background: "var(--online)",
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
                    color: "var(--icon-muted)",
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
                  color: "var(--text-muted)",
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
                      color: "var(--accent)",
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
                  color: "var(--text-secondary)",
                  lineHeight: "18px",
                })}
              >
                {chat.sender && (
                  <span className={css({ color: "var(--text-color)" })}>
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
                    background: chat.muted
                      ? "var(--count-bg)"
                      : "var(--accent-solid)",
                    color: chat.muted
                      ? "var(--text-secondary)"
                      : "var(--accent-foreground)",
                    fontSize: "11px",
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
                    color: "var(--icon-muted)",
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
            flex: isCircular ? "0 0 140px" : "0 0 160px",
            alignSelf: "stretch",
            scrollSnapAlign: "end",
            alignItems: isCircular ? "center" : undefined,
            gap: isCircular ? "12px" : undefined,
            padding: isCircular ? "0 14px" : undefined,
            background: "transparent",
          })}
          inert={revealedEdge !== "trailing"}
        >
          <button
            className={css({
              display: "flex",
              flex: isCircular ? "0 0 50px" : "1",
              height: isCircular ? "50px" : undefined,
              borderRadius: isCircular ? "50%" : undefined,
              minWidth: "0",
              justifyContent: "center",
              alignItems: "center",
              border: "0",
              padding: "0",
              color:
                variant === "classic"
                  ? "white"
                  : "var(--secondary-action-foreground)",
              background:
                variant === "classic" ? "#007aff" : "var(--secondary-action)",
              transform: isCircular ? "scale(0)" : undefined,
              "@media (prefers-reduced-motion: reduce)": { transform: "none" },
              "&:active": { filter: "brightness(0.94)" },
              "&:focus-visible": {
                outlineOffset: "-4px",
                outlineColor:
                  variant === "classic"
                    ? "white"
                    : "var(--secondary-action-foreground)",
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
                fontSize: "11px",
                fontWeight: "550",
                opacity: isCircular ? "1" : "calc(0.35 + var(--reveal) * 0.65)",
                transform: isCircular
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
              flex: isCircular ? "0 0 50px" : "1",
              height: isCircular ? "50px" : undefined,
              borderRadius: isCircular ? "50%" : undefined,
              minWidth: "0",
              justifyContent: "center",
              alignItems: "center",
              border: "0",
              padding: "0",
              color:
                variant === "classic" ? "white" : "var(--accent-foreground)",
              background:
                variant === "classic" ? "#ff3b30" : "var(--accent-solid)",
              transform: isCircular ? "scale(0)" : undefined,
              "@media (prefers-reduced-motion: reduce)": { transform: "none" },
              "&:active": { filter: "brightness(0.94)" },
              "&:focus-visible": {
                outlineOffset: "-4px",
                outlineColor:
                  variant === "classic" ? "white" : "var(--accent-foreground)",
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
                fontSize: "11px",
                fontWeight: "550",
                opacity: isCircular ? "1" : "calc(0.35 + var(--reveal) * 0.65)",
                transform: isCircular
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
  const title =
    variant === "circular-leading"
      ? "Both edges"
      : variant === "classic"
        ? "Classic"
        : "Circular";
  const [chats, setChats] = useState(() => initialChats.slice(0, 4));
  const [notice, setNotice] = useState<{
    text: string;
    undo?: () => void;
  } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
    listRef.current?.querySelectorAll("[data-chat-id]").forEach((row) =>
      row.scrollTo({
        left:
          row.querySelector<HTMLElement>("[data-leading-actions]")
            ?.offsetWidth ?? 0,
        behavior: "instant",
      }),
    );
    setChats(initialChats.slice(0, 4));
    setNotice(null);
  }

  return (
    <div>
      <section
        className={css({
          position: "relative",
          background: "var(--surface)",
          border: "2px solid var(--border-color)",
          borderRadius: "19px",
          overflow: "hidden",
          boxShadow: "var(--card-shadow)",
          "@media (max-width: 520px)": { borderRadius: "16px" },
        })}
        aria-label={`${title} swipe actions demo`}
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
              {title}
            </h2>
            <span
              className={css({
                marginLeft: "auto",
                fontSize: "11px",
                color: "var(--text-muted)",
              })}
            >
              {variant === "circular-leading"
                ? "Leading + trailing"
                : "Trailing actions"}
            </span>
          </div>
        </header>

        <ul
          className={css({
            listStyle: "none",
            padding: "0",
            margin: "0",
            borderTop: "2px solid var(--separator-color)",
            display: "grid",
            gridTemplateColumns: "minmax(0, auto)",
            gap: variant === "classic" ? 0 : 1,
          })}
          ref={listRef}
        >
          {chats.map((chat) => (
            <SwipeRow
              key={chat.id}
              chat={chat}
              variant={variant}
              onArchive={() => archive(chat)}
              onToggleRead={() => {
                setChats((current) =>
                  current.map((item) =>
                    item.id === chat.id
                      ? { ...item, unread: item.unread ? 0 : 1 }
                      : item,
                  ),
                );
                setNotice({
                  text: `${chat.name} marked as ${chat.unread ? "read" : "unread"}`,
                });
              }}
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
          {chats.length === 0 && (
            <li
              className={css({
                padding: "60px 20px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "13px",
              })}
            >
              No conversations left. Reset to start again.
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
            borderTop: "2px solid var(--separator-color)",
            fontSize: "11px",
            color: "var(--text-muted)",
            "@media (max-width: 520px)": { gap: "4px" },
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
          <span>
            {variant === "circular-leading"
              ? "Swipe either way to reveal actions"
              : "Swipe left to reveal actions"}
          </span>
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
              background: "var(--toast-bg)",
              color: "white",
              fontSize: "12px",
              boxShadow: "0 4px 20px #00000026",
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
                  color: "var(--toast-link)",
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
          fontSize: "11px",
          color: "var(--text-muted)",
          "@media (max-width: 520px)": { gap: "5px" },
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
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--accent)",
              "&:hover": { color: "var(--accent-hover)" },
            })}
            onClick={() => {
              const row = listRef.current?.querySelector("[data-chat-id]");
              if (!row) return;
              const leadingWidth =
                row.querySelector<HTMLElement>("[data-leading-actions]")
                  ?.offsetWidth ?? 0;
              row?.scrollTo({
                left:
                  leadingWidth > 0 && row.scrollLeft >= leadingWidth
                    ? 0
                    : row.scrollWidth,
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
              fontSize: "11px",
              color: "var(--text-muted)",
              "&:hover": { color: "var(--accent-hover)" },
            })}
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

type ReleaseItem = {
  id: number;
  name: string;
  platform: string;
  status: "Ready" | "Testing" | "Blocked" | "Review";
  updated: string;
};

const initialReleaseItems: ReleaseItem[] = [
  {
    id: 1,
    name: "Steam Deck build",
    platform: "Steam",
    status: "Testing",
    updated: "12:18",
  },
  {
    id: 2,
    name: "Windows build",
    platform: "PC",
    status: "Ready",
    updated: "12:42",
  },
  {
    id: 3,
    name: "Localization",
    platform: "All platforms",
    status: "Blocked",
    updated: "11:56",
  },
  {
    id: 4,
    name: "Store assets",
    platform: "Steam",
    status: "Review",
    updated: "Yesterday",
  },
];

function TableRowDemo() {
  const [items, setItems] = useState(initialReleaseItems);
  const listRef = useRef<HTMLUListElement>(null);

  function reset() {
    listRef.current
      ?.querySelectorAll<HTMLElement>("[data-release-id]")
      .forEach((row) => row.scrollTo({ left: 0, behavior: "instant" }));
    setItems(initialReleaseItems);
  }

  return (
    <section
      className={css({
        position: "relative",
        background: "var(--surface)",
        border: "2px solid var(--border-color)",
        borderRadius: "19px",
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
        "@media (max-width: 520px)": { borderRadius: "16px" },
      })}
      aria-label="Release checklist swipe actions demo"
    >
      <header
        className={css({
          padding: "22px 21px 18px",
          "@media (max-width: 520px)": { padding: "20px 16px 16px" },
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "10px",
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
            Table rows
          </h2>
          {/*<span
            className={css({
              marginLeft: "auto",
              fontSize: "11px",
              color: "var(--text-muted)",
            })}
          >
            Table rows
          </span>*/}
        </div>
      </header>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "minmax(0, auto)",
        })}
      >
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 92px 80px",
            gap: "12px",
            padding: "9px 20px",
            color: "var(--text-muted)",
            background: "var(--surface-subtle)",
            borderTop: "1px solid var(--separator-color)",
            borderBottom: "1px solid var(--separator-color)",
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            "@media (max-width: 520px)": { padding: "9px 15px", gap: "8px" },
          })}
        >
          <span>Item</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        <ul
          ref={listRef}
          className={css({
            listStyle: "none",
            padding: "0",
            margin: "0",
            display: "grid",
            gap: 1,
          })}
        >
          {items.map((item) => (
            <ReleaseRow
              key={item.id}
              item={item}
              onArchive={() => {
                setItems((current) =>
                  current.filter((entry) => entry.id !== item.id),
                );
              }}
            />
          ))}
          {items.length === 0 && (
            <li
              className={css({
                padding: "44px 20px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "13px",
              })}
            >
              Everything is archived. Reset to start again.
            </li>
          )}
        </ul>
      </div>
      <footer
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "15px 10px",
          background: "var(--surface-subtle)",
          borderTop: "1px solid var(--separator-color)",
          fontSize: "11px",
          color: "var(--text-muted)",
        })}
      >
        <Icon
          name="swipe"
          className={css({ width: "14px", height: "14px", marginRight: "2px" })}
        />
        <span>Swipe a row to reveal actions</span>
        <button
          className={css({
            marginLeft: "8px",
            border: "0",
            background: "none",
            color: "var(--accent)",
            font: "inherit",
            cursor: "pointer",
          })}
          onClick={reset}
        >
          Reset
        </button>
      </footer>
    </section>
  );
}

function ReleaseRow({
  item,
  onArchive,
}: {
  item: ReleaseItem;
  onArchive: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useLayoutEffect(() => {
    const scroller = scrollerRef.current!;
    const actions = actionsRef.current!;
    const buttons = actions.querySelectorAll("button");
    const animations: (Animation | undefined)[] = [];
    let frame = 0;
    const update = () => {
      const progress = Math.min(1, scroller.scrollLeft / actions.offsetWidth);
      scroller.style.setProperty("--reveal", String(progress));
      setRevealed(progress > 0.05);
      buttons.forEach((button, index) => {
        const threshold = index === 0 ? 0.4 : 0.8;
        if (progress <= 0.01) {
          animations[index]?.cancel();
          animations[index] = undefined;
        } else if (
          progress >= threshold &&
          !animations[index] &&
          !prefersReducedMotion()
        ) {
          animations[index] = button.animate(
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
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      animations.forEach((animation) => animation?.cancel());
    };
  }, []);
  const close = () =>
    scrollerRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });
  const statusColor =
    item.status === "Ready"
      ? "var(--accent)"
      : item.status === "Blocked"
        ? "var(--text-secondary)"
        : "var(--text-muted)";
  return (
    <li className={css({ overflow: "hidden" })}>
      <div
        ref={scrollerRef}
        data-release-id={item.id}
        className={css({
          "--reveal": "0",
          display: "flex",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        })}
      >
        <div
          className={css({
            flex: "0 0 100%",
            minWidth: "0",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 92px 80px",
            gap: "12px",
            alignItems: "center",
            padding: "16px 20px",
            // background: "rgba(var(--reveal-color), 0)",
            scrollSnapAlign: "start",
            "@media (max-width: 520px)": {
              gridTemplateColumns: "minmax(0, 1fr) 92px 80px",
              gap: "8px",
              padding: "15px",
            },
          })}
          onClick={close}
        >
          <span
            className={css({
              minWidth: "0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "13px",
              fontWeight: "600",
            })}
          >
            {item.name}
            <small
              className={css({
                display: "block",
                marginTop: "4px",
                color: "var(--text-secondary)",
                fontSize: "11px",
                fontWeight: "400",
              })}
            >
              {item.platform}
            </small>
          </span>
          <span
            className={css({
              color: statusColor,
              fontSize: "11px",
              fontWeight: "600",
            })}
          >
            {item.status}
          </span>
          <time
            className={css({
              color: "var(--text-muted)",
              fontSize: "11px",
              whiteSpace: "nowrap",
            })}
          >
            {item.updated}
          </time>
        </div>
        <div
          ref={actionsRef}
          className={css({
            display: "flex",
            // flex: "0 0 130px",
            scrollSnapAlign: "end",
            paddingInlineEnd: 10,
          })}
          inert={!revealed}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              background: "rgba(var(--reveal-color), var(--reveal))",
              borderRadius: "1000px",
              alignSelf: "center",
            })}
          >
            <CircularActionButton
              size="40px"
              icon="check"
              tone="surface"
              label={`Mark ${item.name} ready`}
              style={{ transform: "scale(0)" }}
              onClick={close}
            />
            <CircularActionButton
              size="40px"
              icon="archive"
              label={`Archive ${item.name}`}
              style={{ transform: "scale(0)" }}
              onClick={onArchive}
            />
          </div>
        </div>
      </div>
    </li>
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
        <h1
          className={css({
            margin: "0 8px",
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
            color: "var(--text-secondary)",
            "@media (max-width: 520px)": { fontSize: "11px" },
          })}
        >
          Swipe a list row to reveal contextual actions.
        </p>
      </header>

      <div
        className={css({
          display: "grid",
          gap: 48,
          gridTemplateColumns: "minmax(0, auto)",
        })}
      >
        <ConversationDemo variant="circular" />
        <ConversationDemo variant="circular-leading" />
        <TableRowDemo />
        <ConversationDemo variant="classic" />
      </div>

      <footer
        className={css({
          display: "flex",
          justifyContent: "center",
          gap: "9px",
          marginTop: "31px",
          color: "var(--text-muted)",
          fontSize: "11px",
          letterSpacing: "1.15px",
          "@media (max-width: 520px)": {
            gap: "6px",
            letterSpacing: "0.8px",
          },
        })}
      >
        NATIVE SCROLL{" "}
        <span className={css({ color: "var(--icon-muted)" })}>+</span> CSS
        SCROLL SNAP{" "}
        <span className={css({ color: "var(--icon-muted)" })}>·</span> NO
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
