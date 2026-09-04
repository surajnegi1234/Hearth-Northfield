import { employees } from "../data/employees.js";

function lookup(needle) {
  const q = needle.toLowerCase();
  return employees.filter((p) => {
    const hay = `${p.name} ${p.position} ${p.department} ${p.email} ${p.location}`.toLowerCase();
    return hay.includes(q) || q.split(/\s+/).some((bit) => bit.length > 2 && hay.includes(bit));
  });
}

export function localDeskReply(userText) {
  const q = (userText || "").toLowerCase();

  if (/payroll|nikhil|bansal/.test(q)) {
    const nikhil = employees.find((p) => p.name.startsWith("Nikhil"));
    return `Payroll sits with ${nikhil.name} in Finance (${nikhil.email}). If Nikhil is out, ping Priya Menon in People — she’ll tell you who is covering. Don’t dump the sheet in the company WhatsApp.`;
  }

  if (/tokyo|bengaluru|meeting room|book|huddle/.test(q)) {
    return `Bengaluru rooms go through Ramesh Pillai (Ops). Mail ramesh.pillai@northfield.internal with the date, time, and headcount. Same-day bookings after 4pm usually fail. Anjali Deshpande can override for Pune if Ramesh doesn’t reply.`;
  }

  if (/pto|leave|vacation|holiday/.test(q)) {
    return `PTO is paid time you’ve accrued. Unpaid leave is a People conversation, not a calendar hold. Put the dates in the leave form and tell your lead. Contractors: you don’t get PTO — invoice around the days you’re off. Priya Menon owns the policy.`;
  }

  if (/new hire|intro|welcome/.test(q)) {
    return `Keep it short:\n\n“This is [name], joining Design this week. They’ll sit with Ananya Reddy for the first sprint. Say hello, don’t dump a 40-link onboarding doc in the thread.”\n\nSwap the names if it’s another shop.`;
  }

  if (/expense|nudge|late/.test(q)) {
    return `Try: “Hi — your March expenses are still open in the tool. Finance closes the period Friday. If something’s stuck, forward the receipt to Nikhil Bansal and he’ll unblock it. Thanks.” No lecture.`;
  }

  const people = lookup(q);
  if (people.length === 1) {
    const p = people[0];
    const status =
      p.status === "leave"
        ? "They’re on leave right now."
        : p.status === "inactive"
          ? "They’ve been offboarded."
          : "They’re on the roster.";
    return `${p.name} — ${p.position} in ${p.department}, based in ${p.location}. ${status} Mail: ${p.email}. Started ${p.started}.`;
  }
  if (people.length > 1 && people.length < 6) {
    return people
      .map((p) => `${p.name} (${p.department}, ${p.location}) — ${p.email}`)
      .join("\n");
  }

  return `I can look people up, draft a note, or talk through leave / rooms / payroll. Ask for someone by name, or a department.`;
}
