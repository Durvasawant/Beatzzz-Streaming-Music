import { useEffect, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // "3:45"
  rating: number;   // 0–5
  plays: number;
  coverColor: string; // fallback gradient seed
  coverUrl?: string;
}

interface ChatMessage {
  id: string;
  sender: "me" | "friend";
  senderName: string;
  avatar: string;
  text: string;
  sharedSong?: Song;
  timestamp: string;
}

// ─── Mock Data (replace with real API / store calls) ──────────────────────────
const MOCK_SONGS: Song[] = [
  { id: "1", title: "Neon Jungle", artist: "Priya & The Echo", album: "Urban Nights", duration: "3:42", rating: 4.9, plays: 128400, coverColor: "#e040fb" },
  { id: "2", title: "Coastal Drive", artist: "Blue Horizon", album: "Coastal Dreaming", duration: "4:11", rating: 4.8, plays: 115200, coverColor: "#00bcd4" },
  { id: "3", title: "Midnight Pulse", artist: "Arjun Waves", album: "Midnight Sessions", duration: "3:58", rating: 4.7, plays: 98700, coverColor: "#ff6f00" },
  { id: "4", title: "Raga Dawn", artist: "Sitar Soul", album: "Eastern Dreams", duration: "5:23", rating: 4.6, plays: 87300, coverColor: "#76ff03" },
  { id: "5", title: "Mumbai Rain", artist: "Monsoon Collective", album: "Urban Nights", duration: "3:33", rating: 4.5, plays: 76500, coverColor: "#f06292" },
  { id: "6", title: "Desert Wind", artist: "Nomad Keys", album: "Eastern Dreams", duration: "4:02", rating: 4.4, plays: 65100, coverColor: "#ffca28" },
  { id: "7", title: "Sine Wave", artist: "Low Freq", album: "Midnight Sessions", duration: "3:19", rating: 4.3, plays: 54800, coverColor: "#80deea" },
  { id: "8", title: "Golden Hour", artist: "Priya & The Echo", album: "Coastal Dreaming", duration: "3:55", rating: 4.2, plays: 44200, coverColor: "#ff8a65" },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "friend",
    senderName: "Manam Dhanya",
    avatar: "M",
    text: "Bro this track is 🔥🔥",
    sharedSong: MOCK_SONGS[0],
    timestamp: "10:32 AM",
  },
  {
    id: "m2",
    sender: "me",
    senderName: "Durva Sawant",
    avatar: "D",
    text: "Omg yes been on repeat since morning",
    timestamp: "10:33 AM",
  },
  {
    id: "m3",
    sender: "friend",
    senderName: "Manam Dhanya",
    avatar: "M",
    text: "Check this one too, totally different vibe",
    sharedSong: MOCK_SONGS[2],
    timestamp: "10:35 AM",
  },
  {
    id: "m4",
    sender: "me",
    senderName: "Durva Sawant",
    avatar: "D",
    text: "Adding it to my midnight playlist rn 🌙",
    timestamp: "10:36 AM",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPlays(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f5c518", fontSize: "11px", letterSpacing: "1px" }}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#888", marginLeft: 4, fontSize: "10px" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function CoverArt({ song, size = 44 }: { song: Song; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        flexShrink: 0,
        background: `linear-gradient(135deg, ${song.coverColor}99, ${song.coverColor}33)`,
        border: `1px solid ${song.coverColor}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        boxShadow: `0 0 12px ${song.coverColor}44`,
      }}
    >
      🎵
    </div>
  );
}

// ─── Trending Panel ───────────────────────────────────────────────────────────
function TrendingPanel({
  songs,
  onShare,
}: {
  songs: Song[];
  onShare: (song: Song) => void;
}) {
  const sorted = [...songs].sort((a, b) => b.rating - a.rating || b.plays - a.plays);

  return (
    <div style={styles.trendingPanel}>
      <div style={styles.trendingHeader}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
          🔥 Trending Now
        </span>
        <span style={{ fontSize: 10, color: "#fffdfd", marginTop: 2 }}>sorted by ratings & plays</span>
      </div>

      <div style={styles.trendingList}>
        {sorted.map((song, i) => (
          <div key={song.id} style={styles.trendingItem} className="trending-item">
            <span style={styles.trendingRank}>{i + 1}</span>
            <CoverArt song={song} size={50} />
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div style={styles.songTitle}>{song.title}</div>
              <div style={styles.songArtist}>{song.artist}</div>
              <StarRating rating={song.rating} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={styles.playCount}>{formatPlays(song.plays)}</span>
              <button
                onClick={() => onShare(song)}
                style={styles.shareBtn}
                title="Share in chat"
              >
                ↗
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Song Card (in chat) ───────────────────────────────────────────────
function SharedSongCard({ song }: { song: Song }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: `linear-gradient(135deg, ${song.coverColor}22, #1a1a2e)`,
        border: `1px solid ${song.coverColor}44`,
        borderRadius: 10,
        padding: "8px 12px",
        marginTop: 6,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <CoverArt song={song} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{song.artist} · {song.album}</div>
        <StarRating rating={song.rating} />
      </div>
      <span style={{ fontSize: 18, opacity: 0.6 }}>▶</span>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [activeFriend] = useState({ name: "Manam Dhanya", avatar: "M", status: "idle" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string, sharedSong?: Song) => {
    if (!text.trim() && !sharedSong) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "me",
      senderName: "Durva Sawant",
      avatar: "D",
      text,
      sharedSong,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleShare = (song: Song) => {
    sendMessage(`Check out this trending track! 🎶`, song);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={styles.root}>
      <style>{CSS_OVERRIDES}</style>

      {/* ── Chat Area ─────────────────────────────────── */}
      <div style={styles.chatArea}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <div style={styles.avatarCircle}>{activeFriend.avatar}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{activeFriend.name}</div>
            <div style={{ fontSize: 11, color: "#1db954" }}>● Online</div>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messageList}>
          {messages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div key={msg.id} style={{ ...styles.messageRow, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                {!isMe && <div style={{ ...styles.avatarCircle, width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>{msg.avatar}</div>}
                <div style={{ maxWidth: "62%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      ...styles.bubble,
                      background: isMe ? "linear-gradient(135deg,#1db954,#17a348)" : "#1e1e2e",
                      borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      color: isMe ? "#fff" : "#ddd",
                    }}
                  >
                    {msg.text}
                    {msg.sharedSong && <SharedSongCard song={msg.sharedSong} />}
                  </div>
                  <span style={styles.timestamp}>{msg.timestamp}</span>
                </div>
                {isMe && <div style={{ ...styles.avatarCircle, width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>{msg.avatar}</div>}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Send a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.sendBtn} onClick={() => sendMessage(input)}>
            ➤
          </button>
        </div>
      </div>

      {/* ── Trending Panel ────────────────────────────── */}
      <TrendingPanel songs={MOCK_SONGS} onShare={handleShare} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100%",
    width: "100%",
    background: "#06140a",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#fff",
    overflow: "hidden",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1e1e2e",
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    borderBottom: "1px solid #1e1e2e",
    background: "#10101a",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#1db954,#00acc1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },
  bubble: {
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.5,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  timestamp: {
    fontSize: 10,
    color: "#555",
    marginTop: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    borderTop: "1px solid #1e1e2e",
    background: "#10101a",
  },
  input: {
    flex: 1,
    background: "#1a1a2a",
    border: "1px solid #2a2a3a",
    borderRadius: 24,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    background: "#014b1b",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  // Trending Panel
  trendingPanel: {
    width: 400,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: "#0d0d14",
    overflow: "hidden",
  },
  trendingHeader: {
    padding: "16px 16px 10px",
    borderBottom: "1px solid #1e1e2e",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  trendingList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  trendingItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 14px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  trendingRank: {
    fontSize: 11,
    color: "#555",
    width: 16,
    textAlign: "center" as const,
    flexShrink: 0,
  },
  songTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  songArtist: {
    fontSize: 10,
    color: "#888",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginBottom: 2,
  },
  playCount: {
    fontSize: 10,
    color: "#666",
  },
  shareBtn: {
    background: "transparent",
    border: "1px solid #c9efca",
    borderRadius: 4,
    color: "#097b31",
    fontSize: 13,
    width: 24,
    height: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    transition: "all 0.15s",
  },
};

const CSS_OVERRIDES = `
  .trending-item:hover { background: #1a1a2a !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
`;