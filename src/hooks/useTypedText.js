import { useEffect, useState } from "react";

export function useTypedText(fullText, enabled) {
  const [shown, setShown] = useState(enabled ? "" : fullText);

  useEffect(() => {
    if (!enabled) {
      setShown(fullText);
      return undefined;
    }
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [fullText, enabled]);

  return shown;
}
