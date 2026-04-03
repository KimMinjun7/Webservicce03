import type { ReactNode } from "react";

export type IconName =
  | "brand"
  | "search"
  | "date"
  | "calendar"
  | "calendarRange"
  | "moon"
  | "cake"
  | "badge"
  | "calculator"
  | "percent"
  | "scale"
  | "coins"
  | "ruler"
  | "thermometer"
  | "rocket"
  | "drafting"
  | "bot"
  | "languages"
  | "fileText"
  | "wand"
  | "brain"
  | "heart"
  | "paw"
  | "spark"
  | "bank"
  | "bulb"
  | "car"
  | "building"
  | "hourglass"
  | "wave"
  | "tree"
  | "flame"
  | "crown"
  | "microscope"
  | "palette"
  | "butterfly"
  | "checkSquare"
  | "shield"
  | "gear"
  | "gift"
  | "wrench"
  | "flower"
  | "bolt"
  | "theater"
  | "dog"
  | "cat"
  | "rabbit"
  | "fox"
  | "bear"
  | "deer"
  | "penguin"
  | "hamster";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function paths(name: IconName): ReactNode {
  switch (name) {
    case "brand":
      return (
        <>
          <path d="M12 2 4 12h5l-1 10 8-10h-5l1-10Z" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </>
      );
    case "date":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18M8 14h3M13 14h3M8 18h3" />
        </>
      );
    case "calendarRange":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18M7 16h10" />
        </>
      );
    case "moon":
      return <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15A9 9 0 1 1 15.5 3.5Z" />;
    case "cake":
      return (
        <>
          <path d="M12 4v4M10.5 5.5c0 1 1.5 1 1.5 2.5" />
          <path d="M5 10h14v10H5z" />
          <path d="M5 14c2 1.8 4 1.8 6 0 2 1.8 4 1.8 6 0 1 .9 2 .9 2 .9" />
        </>
      );
    case "badge":
      return (
        <>
          <path d="M12 3 14.5 6l3.9.6-2.7 2.6.7 3.8L12 11.8 8.6 13l.7-3.8L6.6 6.6 10.5 6 12 3Z" />
          <path d="M9 14.5V21l3-1.8 3 1.8v-6.5" />
        </>
      );
    case "calculator":
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h8" />
        </>
      );
    case "percent":
      return (
        <>
          <path d="m18 6-12 12" />
          <circle cx="7.5" cy="7.5" r="2.5" />
          <circle cx="16.5" cy="16.5" r="2.5" />
        </>
      );
    case "scale":
      return (
        <>
          <path d="M12 4v16M7 4h10" />
          <path d="M5 8 3 12h4L5 8Zm14 0-2 4h4l-2-4Z" />
          <path d="M6 12a2 2 0 0 1-2 2 2 2 0 0 1-2-2M20 12a2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
          <path d="M8 20h8" />
        </>
      );
    case "coins":
      return (
        <>
          <ellipse cx="12" cy="6" rx="6" ry="3" />
          <path d="M6 6v4c0 1.7 2.7 3 6 3s6-1.3 6-3V6" />
          <path d="M6 10v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
        </>
      );
    case "ruler":
      return (
        <>
          <path d="M4 17 17 4l3 3L7 20H4v-3Z" />
          <path d="M11 6l2 2M8 9l2 2M5 12l2 2M14 3l2 2" />
        </>
      );
    case "thermometer":
      return (
        <>
          <path d="M10 14.5V6a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z" />
          <path d="M12 11v6" />
        </>
      );
    case "rocket":
      return (
        <>
          <path d="M14 4c3 0 6 3 6 6-2 1-4 1-6 0-1-2-1-4 0-6Z" />
          <path d="m10 14-4 4M9 9l6 6M8 16l-1 4 4-1" />
        </>
      );
    case "drafting":
      return (
        <>
          <path d="M4 19 14 5l6 14" />
          <path d="M8 13h8M6 19h14" />
        </>
      );
    case "bot":
      return (
        <>
          <rect x="5" y="7" width="14" height="11" rx="3" />
          <path d="M12 3v4M8 12h.01M16 12h.01M9 16h6M3 11h2M19 11h2" />
        </>
      );
    case "languages":
      return (
        <>
          <path d="M4 6h8M8 6c0 7-3 10-3 10M8 6c0 3 2 6 5 8" />
          <path d="M14 10h6M17 10v9M14.5 16h5" />
        </>
      );
    case "fileText":
      return (
        <>
          <path d="M8 3h6l4 4v14H8z" />
          <path d="M14 3v4h4M10 11h6M10 15h6M10 19h4" />
        </>
      );
    case "wand":
      return (
        <>
          <path d="m4 20 10-10" />
          <path d="m13 5 1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1ZM18 10l.7-1.5L20 8l-1.3-.5L18 6l-.7 1.5L16 8l1.3.5L18 10Z" />
        </>
      );
    case "brain":
      return (
        <>
          <path d="M9 7a3 3 0 0 1 6 0 3 3 0 0 1 3 3v1a3 3 0 0 1-2 2.8V15a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-1.2A3 3 0 0 1 6 11v-1a3 3 0 0 1 3-3Z" />
          <path d="M12 7v10M9 10h6" />
        </>
      );
    case "heart":
      return <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.3A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" />;
    case "paw":
      return (
        <>
          <circle cx="8" cy="8" r="1.7" />
          <circle cx="12" cy="6.5" r="1.7" />
          <circle cx="16" cy="8" r="1.7" />
          <circle cx="18" cy="12" r="1.5" />
          <path d="M12 12c-3 0-5 2.2-5 4.4 0 1.6 1.2 2.6 2.7 2.6 1 0 1.7-.5 2.3-1.1.6.6 1.3 1.1 2.3 1.1 1.5 0 2.7-1 2.7-2.6C17 14.2 15 12 12 12Z" />
        </>
      );
    case "spark":
      return (
        <>
          <path d="M12 3 14 10l7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" />
        </>
      );
    case "bank":
      return (
        <>
          <path d="M3 10 12 4l9 6" />
          <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
        </>
      );
    case "bulb":
      return (
        <>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.9.7-1.5 1.8-1.5 3.1h-4c0-1.3-.6-2.4-1.5-3.1A6 6 0 0 1 12 3Z" />
        </>
      );
    case "car":
      return (
        <>
          <path d="M5 16h14l-1.5-5H6.5L5 16Z" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
          <path d="M7 11 9 7h6l2 4" />
        </>
      );
    case "building":
      return (
        <>
          <path d="M6 20V6l6-3 6 3v14" />
          <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
        </>
      );
    case "hourglass":
      return (
        <>
          <path d="M7 3h10M7 21h10M8 3c0 4 3 4 4 6-1 2-4 2-4 6M16 3c0 4-3 4-4 6 1 2 4 2 4 6" />
        </>
      );
    case "wave":
      return <path d="M3 14c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 3 4" />;
    case "tree":
      return (
        <>
          <path d="M12 4c3 0 5 2 5 5 0 .8-.2 1.6-.6 2.3A4 4 0 0 1 14 18H10a4 4 0 0 1-2.4-6.7A5 5 0 0 1 12 4Z" />
          <path d="M12 18v3" />
        </>
      );
    case "flame":
      return <path d="M13 3c1 3-1 4 1 6 1 1 3 2 3 5a5 5 0 0 1-10 0c0-4 3-5 4-7 1-1 1-2 2-4Z" />;
    case "crown":
      return <path d="m4 17 2-9 6 5 6-5 2 9H4Z" />;
    case "microscope":
      return (
        <>
          <path d="m10 4 4 4-2 2-4-4 2-2ZM12 10l-3 3" />
          <path d="M9 13a4 4 0 0 0 0 6h7M5 21h14" />
        </>
      );
    case "palette":
      return (
        <>
          <path d="M12 4a8 8 0 1 0 0 16h1.5a1.5 1.5 0 0 0 0-3h-1a2 2 0 0 1 0-4h1.2A4.8 4.8 0 0 0 18.5 8 4 4 0 0 0 12 4Z" />
          <circle cx="7.5" cy="10" r="1" />
          <circle cx="10" cy="7.5" r="1" />
          <circle cx="14.5" cy="8" r="1" />
        </>
      );
    case "butterfly":
      return (
        <>
          <path d="M12 12c0-4-2-7-5-8-1 3 0 6 2 8-2 2-3 5-2 8 3-1 5-4 5-8Zm0 0c0-4 2-7 5-8 1 3 0 6-2 8 2 2 3 5 2 8-3-1-5-4-5-8Zm0-2v4" />
        </>
      );
    case "checkSquare":
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="m8 12 2.5 2.5L16 9" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 6 5v5c0 4 2.7 7.6 6 9 3.3-1.4 6-5 6-9V5l-6-2Z" />
        </>
      );
    case "gear":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
        </>
      );
    case "gift":
      return (
        <>
          <path d="M4 10h16v10H4zM12 10v10M4 14h16" />
          <path d="M12 10H8.5a2.5 2.5 0 1 1 0-5c2 0 3.5 5 3.5 5Zm0 0h3.5a2.5 2.5 0 1 0 0-5C13.5 5 12 10 12 10Z" />
        </>
      );
    case "wrench":
      return <path d="M14 6a4 4 0 0 0 4 4l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 0-1-5Z" />;
    case "flower":
      return (
        <>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 5a3 3 0 0 1 0 6 3 3 0 0 1 0-6Zm0 8a3 3 0 0 1 0 6 3 3 0 0 1 0-6ZM5 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0Zm8 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0Z" />
        </>
      );
    case "bolt":
      return <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />;
    case "theater":
      return (
        <>
          <path d="M6 5h12l1 10H5L6 5Zm2 3c1 1 2 1 3 0 1 1 2 1 3 0 1 1 2 1 3 0" />
          <path d="M9 11h.01M15 11h.01" />
        </>
      );
    case "dog":
      return (
        <>
          <path d="M7 10 5 7l2-2 2 2M17 10l2-3-2-2-2 2" />
          <path d="M8 10h8l1 3-2 5H9l-2-5 1-3Z" />
          <path d="M10 13h.01M14 13h.01M11 16h2" />
        </>
      );
    case "cat":
      return (
        <>
          <path d="m8 8 2-3 2 2 2-2 2 3" />
          <path d="M8 8h8l1 4-2 6H9l-2-6 1-4Z" />
          <path d="M10 13h.01M14 13h.01M9 15l-2 1M15 15l2 1M12 14v2" />
        </>
      );
    case "rabbit":
      return (
        <>
          <path d="M10 8V4a2 2 0 1 1 4 0v4M8 12a4 4 0 1 1 8 0v2a4 4 0 1 1-8 0v-2Z" />
          <path d="M10 14h.01M14 14h.01M11 17h2" />
        </>
      );
    case "fox":
      return (
        <>
          <path d="m6 9 3-4 3 3 3-3 3 4-2 8H8L6 9Z" />
          <path d="M10 12h.01M14 12h.01M11 15h2" />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="8" cy="8" r="2" />
          <circle cx="16" cy="8" r="2" />
          <path d="M7 11a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0v-2Z" />
          <path d="M10 14h.01M14 14h.01M11 16h2" />
        </>
      );
    case "deer":
      return (
        <>
          <path d="M9 7 7 4M9 7 5 6M15 7l2-3M15 7l4-1" />
          <path d="M8 9h8l1 4-2 5H9l-2-5 1-4Z" />
          <path d="M10 13h.01M14 13h.01M11 16h2" />
        </>
      );
    case "penguin":
      return (
        <>
          <path d="M12 4c3 0 5 3 5 7v4c0 3-2 5-5 5s-5-2-5-5v-4c0-4 2-7 5-7Z" />
          <path d="M10 10h.01M14 10h.01M11 13h2M9 18l-1 2M15 18l1 2" />
        </>
      );
    case "hamster":
      return (
        <>
          <circle cx="12" cy="13" r="6" />
          <circle cx="8" cy="8" r="2" />
          <circle cx="16" cy="8" r="2" />
          <path d="M10 13h.01M14 13h.01M11 16h2" />
        </>
      );
    default:
      return null;
  }
}

export default function Icon({ name, size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths(name)}
    </svg>
  );
}
