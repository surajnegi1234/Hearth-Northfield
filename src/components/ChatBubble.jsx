import { useTypedText } from "../hooks/useTypedText.js";

export default function ChatBubble({ message, animate }) {
  const mine = message.role === "user";
  const body = useTypedText(message.content, Boolean(animate) && !mine);

  return (
    <div className={mine ? "bubble-row mine" : "bubble-row"}>
      {!mine && <span className="avatar tiny hearth">H</span>}
      <div className={mine ? "bubble mine" : "bubble"}>
        {message.error ? (
          <p className="err-copy">{body}</p>
        ) : (
          <p>{body}</p>
        )}
        <time>
          {new Date(message.at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="bubble-row">
      <span className="avatar tiny hearth">H</span>
      <div className="bubble waiting" aria-label="Hearth is typing">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
