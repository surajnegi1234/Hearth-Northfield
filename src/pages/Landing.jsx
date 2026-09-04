import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Brand from "../components/Brand.jsx";

const FEATURES = [
  {
    n: "01",
    title: "Ask before you ping People on Teams",
    copy: "PTO, who owns payroll, how to book Bengaluru. Hearth answers from the desk, not from a 40-page wiki.",
  },
  {
    n: "02",
    title: "A directory that isn’t a spreadsheet",
    copy: "Filter by shop, search a last name, see who’s actually around. Emails are one click, not a hunt.",
  },
  {
    n: "03",
    title: "Headcount without the deck",
    copy: "Who’s in, who’s on leave, how the teams split. Built for Monday standups, not board theatre.",
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="landing">
      <header className="land-nav">
        <Brand />
        <nav>
          <a href="#how">How it works</a>
          <a href="#bits">What’s in it</a>
          <button type="button" className="ghost-btn" onClick={toggleTheme}>
            {theme === "dark" ? "Day" : "Night"}
          </button>
          <Link className="btn solid" to="/desk">
            Open the desk
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Internal only · v0.8</p>
          <h1>
            The office assistant
            <br />
            that lives on your desk,
            <br />
            <em>not in another tab you’ll forget.</em>
          </h1>
          <p className="lede">
            Hearth is Northfield’s in-house desk: a chat for the boring questions,
            a people list that doesn’t rot, and a pulse view for whoever’s covering
            Friday ops. Built for us. Please don’t demo it to a client.
          </p>
          <div className="hero-actions">
            <Link className="btn solid lg" to="/desk">
              Start a thread
            </Link>
            <a className="btn ghost lg" href="#how">
              Show me around
            </a>
          </div>
          <p className="fine">
            Works in the browser. Gemini for answers. Your chat stays on this machine.
          </p>
        </div>

        <aside className="hero-card" aria-hidden="true">
          <div className="fake-chat">
            <header>
              <span className="dot rust" />
              <span>Desk · today</span>
            </header>
            <div className="fake-line them">
              Who actually signs off travel for the Pune office?
            </div>
            <div className="fake-line us">
              Anjali Deshpande, Ops — office lead for west. She’s in Pune. Mail
              her before you book anything over two nights.
            </div>
            <div className="fake-line them">got it, thanks</div>
          </div>
          <p className="card-caption">From Tuesday, 9:14am. Not a mockup we invented in a sprint.</p>
        </aside>
      </section>

      <section className="strip" id="how">
        <p>
          People · Engineering · Finance · Ops · Design · Sales · People ·
          Engineering · Finance · Ops · Design · Sales ·
        </p>
      </section>

      <section className="intro">
        <div>
          <p className="eyebrow">Why this exists</p>
          <h2>We got tired of pinging Priya for the same three things.</h2>
        </div>
        <p>
          Hearth sits between “I’ll just guess” and “I’ll open a ticket.” It knows
          the directory, it can draft the awkward email, and it will tell you when
          it doesn’t know — which, honestly, is most of the policy stuff until
          People write it down.
        </p>
      </section>

      <section className="bits" id="bits">
        {FEATURES.map((f) => (
          <article key={f.n}>
            <span>{f.n}</span>
            <h3>{f.title}</h3>
            <p>{f.copy}</p>
          </article>
        ))}
      </section>

      <section className="cta">
        <h2>If you’re on the Northfield network, you’re already late.</h2>
        <p>Open the desk, ask something small, see if it beats hunting through Drive.</p>
        <Link className="btn solid lg" to="/desk">
          Go to the desk
        </Link>
      </section>

      <footer className="land-foot">
        <span>© Northfield · desk team, 3rd floor</span>
        <span>Not an official HR system. Still ask People for anything legal.</span>
      </footer>
    </div>
  );
}
