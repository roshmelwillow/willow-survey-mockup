import React, { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Willow — Patient UX Survey prototype                               */
/*  Two modes:                                                         */
/*   • Patient flow  — mock inbox → open email → take the survey       */
/*   • Review tool   — QA view of each survey with cohort/goal spec    */
/* ------------------------------------------------------------------ */

const CSS = `
:root{
  --paper:#F4F6F0; --ink:#18231D; --muted:#5C6A60; --faint:#8B968C;
  --pine:#2C5544; --pine-deep:#1E3B2E; --sage:#DCE4D6; --sage-soft:#E9EEE4;
  --sage-line:#C4D1BC; --honey:#D29A36; --honey-soft:#F4E6C8; --card:#FFFFFF;
  --shadow:0 1px 2px rgba(24,35,29,.04), 0 12px 30px rgba(24,35,29,.06);
}
*{box-sizing:border-box;}
.wz{font-family:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:var(--ink);background:var(--paper);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.5;}
.wz-shell{max-width:1080px;margin:0 auto;padding:22px 20px 56px;}

/* header */
.wz-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;}
.wz-brand{display:flex;align-items:center;gap:10px;}
.wz-mark{width:30px;height:30px;flex:none;}
.wz-word{font-family:"Fraunces",Georgia,serif;font-size:23px;font-weight:600;letter-spacing:-.01em;}
.wz-sub{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-top:2px;}
.wz-tabs{display:flex;gap:4px;background:var(--sage-soft);padding:4px;border-radius:999px;border:1px solid var(--sage-line);}
.wz-tab{font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;border:none;background:transparent;
  color:var(--muted);padding:8px 16px;border-radius:999px;transition:background .2s,color .2s,box-shadow .2s;}
.wz-tab[aria-pressed="true"]{background:var(--card);color:var(--pine-deep);box-shadow:0 1px 3px rgba(24,35,29,.12);}
.wz-tab:focus-visible{outline:2px solid var(--pine);outline-offset:2px;}
.wz-subrow{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
.wz-subrow-label{font-family:"Spline Sans Mono","SF Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);}

/* layout */
.wz-grid{display:grid;grid-template-columns:1fr 312px;gap:22px;align-items:start;}
@media (max-width:840px){.wz-grid{grid-template-columns:1fr;}}
.wz-solo{max-width:600px;margin:0 auto;}

/* canvas */
.wz-canvas{background:var(--card);border:1px solid var(--sage-line);border-radius:20px;box-shadow:var(--shadow);
  padding:34px 38px 26px;min-height:520px;display:flex;flex-direction:column;}
@media (max-width:560px){.wz-canvas{padding:26px 22px 22px;}}

/* intro */
.wz-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--honey);font-weight:700;}
.wz-title{font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:32px;line-height:1.12;letter-spacing:-.015em;margin:14px 0 0;}
.wz-lede{font-size:16px;color:var(--muted);margin:16px 0 0;max-width:46ch;}
.wz-meta-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px;}
.wz-pill{font-size:12px;color:var(--pine-deep);background:var(--sage-soft);border:1px solid var(--sage-line);
  border-radius:999px;padding:6px 12px;display:inline-flex;align-items:center;gap:6px;}
.wz-spacer{flex:1;}

/* question */
.wz-qhead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;}
.wz-step{font-family:"Spline Sans Mono","SF Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);}
.wz-chip{font-family:"Spline Sans Mono","SF Mono",monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--pine);background:var(--sage-soft);border:1px solid var(--sage-line);border-radius:6px;padding:3px 8px;white-space:nowrap;}
.wz-prompt{font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:26px;line-height:1.22;letter-spacing:-.01em;margin:16px 0 4px;max-width:26ch;}
.wz-help{font-size:14.5px;color:var(--muted);margin:0 0 4px;}
.wz-fade{animation:wzIn .42s cubic-bezier(.2,.7,.2,1);}
@keyframes wzIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}

/* answers */
.wz-answers{margin-top:24px;display:flex;flex-direction:column;gap:10px;}
.wz-rate{display:flex;gap:8px;}
.wz-rate-7{gap:6px;}
.wz-rdot{flex:1;min-width:0;font:inherit;cursor:pointer;background:var(--card);border:1.5px solid var(--sage-line);
  border-radius:13px;padding:16px 4px;font-size:18px;font-weight:600;color:var(--muted);transition:all .16s ease;}
.wz-rate-7 .wz-rdot{padding:15px 2px;font-size:16px;border-radius:11px;}
.wz-rdot:hover{border-color:var(--pine);color:var(--pine);transform:translateY(-2px);}
.wz-rdot[aria-pressed="true"]{background:var(--pine);border-color:var(--pine);color:#fff;box-shadow:0 6px 16px rgba(44,85,68,.24);}
.wz-rdot:focus-visible{outline:2px solid var(--pine);outline-offset:2px;}
.wz-scalelabels{display:flex;justify-content:space-between;margin-top:9px;font-size:12.5px;color:var(--faint);}
.wz-opt{text-align:left;font:inherit;cursor:pointer;background:var(--card);border:1.5px solid var(--sage-line);
  border-radius:13px;padding:14px 16px;font-size:15px;color:var(--ink);transition:all .16s ease;display:flex;align-items:center;gap:13px;}
.wz-opt:hover{border-color:var(--pine);background:var(--sage-soft);}
.wz-opt[aria-pressed="true"]{border-color:var(--pine);background:var(--sage-soft);box-shadow:inset 0 0 0 1px var(--pine);}
.wz-opt:focus-visible{outline:2px solid var(--pine);outline-offset:2px;}
.wz-tick{width:20px;height:20px;border-radius:999px;border:1.5px solid var(--sage-line);flex:none;display:grid;place-items:center;transition:all .16s;}
.wz-opt[aria-pressed="true"] .wz-tick{background:var(--pine);border-color:var(--pine);}
.wz-text{font:inherit;font-size:15.5px;width:100%;min-height:128px;resize:vertical;border:1.5px solid var(--sage-line);
  border-radius:13px;padding:14px 16px;background:var(--card);color:var(--ink);}
.wz-text:focus{outline:none;border-color:var(--pine);box-shadow:0 0 0 3px rgba(44,85,68,.12);}
.wz-optional{font-size:12.5px;color:var(--faint);margin-top:8px;}

/* footer nav + sprig */
.wz-foot{margin-top:auto;padding-top:26px;}
.wz-sprig-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:18px;}
.wz-sprig{width:100%;max-width:360px;height:46px;}
.sprig-stem{fill:none;stroke:var(--sage-line);stroke-width:1.4;stroke-linecap:round;}
.leaf{transition:fill .55s ease,opacity .55s ease;}
.leaf-todo{fill:var(--sage);opacity:.85;}
.leaf-done{fill:var(--pine);}
.leaf-current{fill:var(--honey);}
.wz-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.wz-btn{font:inherit;font-weight:600;font-size:15px;cursor:pointer;border-radius:11px;padding:13px 24px;transition:all .16s ease;border:1.5px solid transparent;}
.wz-btn-primary{background:var(--pine);color:#fff;}
.wz-btn-primary:hover{background:var(--pine-deep);}
.wz-btn-primary:disabled{background:var(--sage);color:var(--faint);cursor:not-allowed;}
.wz-btn-ghost{background:transparent;color:var(--muted);border-color:transparent;padding-left:6px;}
.wz-btn-ghost:hover{color:var(--ink);}
.wz-btn-ghost:disabled{opacity:0;pointer-events:none;}
.wz-btn:focus-visible{outline:2px solid var(--pine);outline-offset:2px;}

/* rail */
.wz-rail{display:flex;flex-direction:column;gap:16px;}
.wz-rcard{background:var(--card);border:1px solid var(--sage-line);border-radius:16px;padding:18px;box-shadow:var(--shadow);}
.wz-rlabel{font-family:"Spline Sans Mono","SF Mono",monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--honey);font-weight:600;margin:0 0 10px;}
.wz-goal{font-size:14px;color:var(--muted);margin:0;}
.wz-clist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.wz-cli{font-size:13.5px;color:var(--ink);display:flex;gap:9px;align-items:flex-start;}
.wz-cdot{width:6px;height:6px;border-radius:999px;background:var(--pine);margin-top:7px;flex:none;}
.wz-spine{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
.wz-sitem{display:flex;align-items:center;gap:11px;padding:9px 8px;border-radius:10px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font:inherit;transition:background .15s;}
.wz-sitem:hover{background:var(--sage-soft);}
.wz-sitem[aria-current="true"]{background:var(--sage-soft);}
.wz-snum{width:22px;height:22px;border-radius:999px;border:1.5px solid var(--sage-line);display:grid;place-items:center;font-size:11px;font-weight:700;color:var(--faint);flex:none;transition:all .15s;}
.wz-sitem[aria-current="true"] .wz-snum{border-color:var(--honey);color:var(--honey);}
.wz-snum.done{background:var(--pine);border-color:var(--pine);color:#fff;}
.wz-stext{font-size:13.5px;color:var(--ink);flex:1;min-width:0;}
.wz-stype{font-family:"Spline Sans Mono","SF Mono",monospace;font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--faint);}
.wz-rfoot{font-size:12px;color:var(--faint);display:flex;align-items:center;gap:7px;margin-top:10px;border-top:1px dashed var(--sage-line);padding-top:12px;}
.wz-railtoggle{display:none;}
@media (max-width:840px){
  .wz-rail{order:2;}
  .wz-railtoggle{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--sage-line);
    border-radius:10px;padding:10px 14px;font:inherit;font-size:13.5px;font-weight:600;color:var(--muted);cursor:pointer;width:100%;justify-content:center;}
  .wz-rail-collapsed{display:none;}
}

/* email inbox */
.wz-mail{background:var(--card);border:1px solid var(--sage-line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden;}
.wz-mail-head{padding:17px 22px;border-bottom:1px solid var(--sage-line);display:flex;align-items:baseline;justify-content:space-between;}
.wz-mail-title{font-family:"Fraunces",Georgia,serif;font-size:19px;font-weight:600;}
.wz-mail-sub{font-size:12.5px;color:var(--faint);}
.wz-mrow{display:flex;gap:14px;padding:16px 22px;cursor:pointer;border:none;border-bottom:1px solid var(--sage-soft);
  background:transparent;width:100%;text-align:left;font:inherit;transition:background .15s;align-items:flex-start;}
.wz-mrow:last-child{border-bottom:none;}
.wz-mrow:hover{background:var(--sage-soft);}
.wz-mrow:focus-visible{outline:2px solid var(--pine);outline-offset:-2px;}
.wz-avatar{width:40px;height:40px;border-radius:999px;background:var(--sage-soft);display:grid;place-items:center;flex:none;border:1px solid var(--sage-line);}
.wz-mbody{flex:1;min-width:0;display:flex;flex-direction:column;}
.wz-mfrom{display:flex;justify-content:space-between;gap:10px;align-items:baseline;}
.wz-msender{font-weight:700;font-size:14.5px;}
.wz-mtime{font-size:12px;color:var(--faint);white-space:nowrap;}
.wz-msubj{font-size:14px;font-weight:600;margin-top:2px;}
.wz-mprev{font-size:13px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.wz-unread{width:8px;height:8px;border-radius:999px;background:var(--honey);flex:none;margin-top:7px;}
.wz-flowhint{text-align:center;font-size:12.5px;color:var(--faint);margin-top:14px;}

/* email reading */
.wz-read{background:var(--card);border:1px solid var(--sage-line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden;}
.wz-read-bar{padding:13px 18px;border-bottom:1px solid var(--sage-line);display:flex;align-items:center;gap:12px;}
.wz-iconbtn{width:34px;height:34px;border-radius:9px;border:1px solid var(--sage-line);background:var(--card);display:grid;place-items:center;cursor:pointer;}
.wz-iconbtn:hover{background:var(--sage-soft);}
.wz-iconbtn:focus-visible{outline:2px solid var(--pine);outline-offset:2px;}
.wz-read-barlabel{font-size:13.5px;font-weight:600;color:var(--muted);}
.wz-read-body{padding:24px 26px 28px;}
@media (max-width:560px){.wz-read-body{padding:20px;}}
.wz-read-from{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
.wz-readaddr{font-size:12.5px;color:var(--faint);}
.wz-read-subj{font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:24px;line-height:1.16;letter-spacing:-.01em;margin:0 0 16px;}
.wz-read-p{font-size:15px;color:var(--muted);margin:0 0 13px;line-height:1.62;}
.wz-read-foot{font-size:11.5px;color:var(--faint);margin-top:24px;border-top:1px solid var(--sage-soft);padding-top:14px;}
.wz-backlink{background:none;border:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--muted);cursor:pointer;padding:4px 2px;margin-bottom:12px;display:inline-flex;align-items:center;gap:6px;}
.wz-backlink:hover{color:var(--ink);}

/* done */
.wz-done{display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center;flex:1;padding:30px 10px;}
.wz-done-mark{width:74px;height:74px;margin-bottom:8px;}
.wz-recap{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:20px 0 6px;}
.wz-recap .wz-pill{background:var(--honey-soft);border-color:#EAD6A8;color:var(--pine-deep);}
.wz-note{margin-top:22px;font-size:12.5px;color:var(--faint);max-width:42ch;border-top:1px dashed var(--sage-line);padding-top:16px;}
.wz-donebtns{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap;justify-content:center;}

@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
`;

/* ---- icons ---- */
const Leaf = ({ s = 30 }) => (
  <svg viewBox="0 0 32 32" width={s} height={s} aria-hidden="true">
    <path d="M27 5C13 6 6 13 6 24c0 1 .3 2 .7 3 .9-7 5-12 13-15-6 4-9 9-10 16 11 .5 18-6 18-18 0-2-.3-3.6-.7-5Z" fill="#2C5544"/>
    <path d="M7 27C9 18 14 13 24 9" stroke="#D29A36" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
  </svg>
);
const Check = ({ c = "#fff", s = 12 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Back = ({ s = 16 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
    <path d="M14 6l-6 6 6 6" stroke="#5C6A60" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ---- survey definitions ---- */
const AGREE = ["Strongly disagree", "Strongly agree"];
const EASE = ["Very hard", "Very easy"];
const CLEAR = ["Not clear", "Very clear"];

const SURVEYS = {
  onboarding: {
    label: "Onboarding",
    name: "Your sign-up experience",
    intro:
      "A few quick questions about signing up with Willow. Your answers help us make getting started simpler — there are no wrong ones.",
    privacy: "Anonymous · about 2 minutes · no medical details asked",
    goal: "Understand where sign-up feels hard and what shapes the decision to continue with Willow.",
    cohort: [
      "Recently completed onboarding",
      "Continued, paused, or chose another provider",
      "May not have full patient portal access yet",
    ],
    sync: "Built in Tally / Typeform → Customer.io segment",
    questions: [
      { id: "q_medical", label: "Medical questionnaire", type: "rating", points: 7, chip: "Rating 1–7",
        prompt: "The medical questionnaire was easy to complete.", scale: AGREE },
      { id: "q_idv", label: "Identity verification", type: "rating", points: 7, chip: "Rating 1–7",
        prompt: "Submitting my ID or selfie for identity verification was easy.", scale: AGREE },
      { id: "q_payment", label: "Payment information", type: "rating", points: 7, chip: "Rating 1–7",
        prompt: "It was easy for me to submit my payment information.", scale: AGREE },
      { id: "q_next", label: "What happens next", type: "rating", points: 7, chip: "Rating 1–7",
        prompt: "After submitting my information, I understood what would happen next.", scale: AGREE },
      { id: "q_confidence", label: "Confidence to continue", type: "rating", points: 7, chip: "Rating 1–7",
        prompt: "The sign-up process made me feel confident about continuing with Willow.", scale: AGREE },
      { id: "q_time", label: "Time vs. expected", type: "single", chip: "Multiple choice",
        prompt: "Did the sign-up process take about as much time as you expected?",
        options: [
          "It took less time than expected",
          "It took about as much time as expected",
          "It took more time than expected",
          "I'm not sure",
        ] },
      { id: "q_hardest", label: "Hardest / longest part", type: "single", chip: "Multiple choice",
        prompt: "Which part of the sign-up process took the most time or felt hardest to complete?",
        options: [
          "Filling out the medical questionnaire",
          "Uploading my ID or completing identity verification",
          "Understanding pricing or payment",
          "Submitting my payment information",
          "Understanding what happens after signing up",
          "Waiting for doctor review or approval",
          "Understanding prescription or dosage approval",
          "Logging in or accessing my account",
          "Nothing felt difficult",
          "Other",
        ] },
      { id: "q_improve", label: "Biggest improvement", type: "text", chip: "Open text", optional: true,
        prompt: "If Willow could improve one thing about the onboarding experience, what would be the most helpful?",
        placeholder: "Type as much or as little as you like…" },
    ],
  },

  portal: {
    label: "Patient Portal",
    name: "Your patient portal",
    intro:
      "A few quick questions about using your Willow patient portal to manage treatment. Your answers help us improve it for you.",
    privacy: "Anonymous · about 2 minutes · no medical details asked",
    goal: "Understand whether active patients can easily manage treatment and find the support they need.",
    cohort: [
      "Active patients, 3+ months with Willow",
      "3 or more successful payments",
      "Has had time to use the portal regularly",
    ],
    sync: "Shown in-portal → Customer.io cohort + Mixpanel events",
    questions: [
      { id: "ease_nav", label: "Ease of use", type: "rating", points: 5, chip: "Rating 1–5",
        prompt: "Overall, how easy is the patient portal to use?", scale: EASE },
      { id: "has_features", label: "Has what's needed", type: "single", chip: "Multiple choice",
        prompt: "Does the portal have everything you need to manage your treatment?",
        options: ["Yes, everything", "Most of it", "Some of it", "Not really", "No"] },
      { id: "clear_rx", label: "Prescription status", type: "rating", points: 5, chip: "Rating 1–5",
        prompt: "How easy is it to understand your prescription, refill, and dosage status?", scale: EASE },
      { id: "ease_care", label: "Reaching care team", type: "rating", points: 5, chip: "Rating 1–5",
        prompt: "How easy is it to reach — and hear back from — your care team?", scale: EASE },
      { id: "clear_action", label: "Clear next action", type: "rating", points: 5, chip: "Rating 1–5",
        prompt: "When something needs your attention, how clear is what to do next?", scale: CLEAR },
      { id: "friction", label: "Most friction", type: "single", chip: "Multiple choice",
        prompt: "Which part of the portal is most frustrating?",
        options: ["Finding what I need", "Prescription & refill status", "Messaging the care team",
          "Knowing what to do next", "Billing & payments", "Nothing, really", "Something else"] },
      { id: "improve", label: "Biggest improvement", type: "text", chip: "Open text", optional: true,
        prompt: "What's the one thing we could improve about the portal?",
        placeholder: "Type as much or as little as you like…" },
    ],
  },
};

/* ---- email content (inbox flow) ---- */
const EMAILS = {
  onboarding: {
    sender: "Willow Care Team", address: "care@willowhealth.com", time: "9:14 AM",
    subject: "How was signing up with Willow?",
    preview: "Two minutes to help us make getting started easier.",
    cta: "Share your feedback",
    body: [
      "Hi there,",
      "You recently signed up with Willow — thank you for giving us a try.",
      "We're working to make getting started as simple as possible, and hearing about your experience would really help. It takes about two minutes, it's anonymous, and we won't ask for any medical details.",
      "— The Willow Care Team",
    ],
  },
  portal: {
    sender: "Willow Care Team", address: "care@willowhealth.com", time: "Tue",
    subject: "How's your Willow portal working for you?",
    preview: "A few quick questions about managing your treatment.",
    cta: "Start the survey",
    body: [
      "Hi there,",
      "You've been managing your treatment with Willow for a few months now — we'd love to hear how the patient portal is working for you.",
      "It's about two minutes, completely anonymous, and there are no wrong answers.",
      "— The Willow Care Team",
    ],
  },
};

const typeText = (q) =>
  q.type === "rating" ? `rating 1–${q.points || 5}` : q.type === "single" ? "multiple choice" : "open text";

/* ---- willow sprig progress (signature element) ---- */
function Sprig({ total, current }) {
  const W = 360, padX = 16, baseY = 28;
  const pts = Array.from({ length: total }, (_, i) => {
    const x = total === 1 ? W / 2 : padX + (i * (W - 2 * padX)) / (total - 1);
    const y = baseY + Math.sin(i * 0.85) * 5;
    return { x, y };
  });
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < total; i++) {
    const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2;
    d += ` Q ${mx} ${a.y} ${b.x} ${b.y}`;
  }
  const leaf = "M0 0 C 5 -5 5 -13 0 -18 C -5 -13 -5 -5 0 0 Z";
  return (
    <svg className="wz-sprig" viewBox={`0 0 ${W} 46`} role="img" aria-label={`Progress: ${current} of ${total}`}>
      <path className="sprig-stem" d={d} />
      {pts.map((p, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const rot = i % 2 === 0 ? -30 : 30;
        return <path key={i} className={`leaf leaf-${state}`} d={leaf}
          transform={`translate(${p.x} ${p.y}) rotate(${rot}) scale(.92)`} />;
      })}
    </svg>
  );
}

export default function App() {
  const [mode, setMode] = useState("flow");          // 'flow' | 'review'
  const [flowView, setFlowView] = useState("inbox");  // 'inbox' | 'reading' | 'survey'
  const [active, setActive] = useState("onboarding");  // which survey
  const [read, setRead] = useState({});                // opened emails
  const [railOpen, setRailOpen] = useState(false);
  const [state, setState] = useState({
    onboarding: { stage: "intro", idx: 0, answers: {} },
    portal: { stage: "intro", idx: 0, answers: {} },
  });

  useEffect(() => {
    const id = "wz-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&family=Spline+Sans+Mono:wght@500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  const survey = SURVEYS[active];
  const cur = state[active];
  const visible = useMemo(
    () => survey.questions.filter((q) => !q.showIf || q.showIf(cur.answers)),
    [survey, cur.answers]
  );
  const q = visible[cur.idx];
  const patch = (next) => setState((s) => ({ ...s, [active]: { ...s[active], ...next } }));
  const setAnswer = (val) => patch({ answers: { ...cur.answers, [q.id]: val } });
  const answered = q && (q.optional || cur.answers[q.id] !== undefined);
  const isLast = cur.idx === visible.length - 1;
  const answeredCount = visible.filter((vq) => cur.answers[vq.id] !== undefined).length;

  const goNext = () => (isLast ? patch({ stage: "done" }) : patch({ idx: Math.min(cur.idx + 1, visible.length - 1) }));
  const goBack = () => patch({ idx: Math.max(cur.idx - 1, 0) });
  const restart = () => patch({ stage: "intro", idx: 0, answers: {} });

  const goMode = (m) => { setMode(m); if (m === "flow") setFlowView("inbox"); };
  const openEmail = (k) => { setActive(k); setRead((r) => ({ ...r, [k]: true })); setFlowView("reading"); };
  const launchFromEmail = (k) => {
    setActive(k);
    if (state[k].stage === "done") setState((s) => ({ ...s, [k]: { stage: "intro", idx: 0, answers: {} } }));
    setFlowView("survey");
  };
  const switchReview = (k) => { setActive(k); setRailOpen(false); };

  /* ---------- canvas (shared by both modes) ---------- */
  const renderCanvas = () => (
    <main className="wz-canvas">
      {cur.stage === "intro" && (
        <div className="wz-fade" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span className="wz-eyebrow">{survey.label} questionnaire</span>
          <h1 className="wz-title">{survey.name}</h1>
          <p className="wz-lede">{survey.intro}</p>
          <div className="wz-meta-row"><span className="wz-pill"><Leaf s={13} /> {survey.privacy}</span></div>
          <div className="wz-spacer" />
          <div className="wz-foot">
            <div className="wz-nav" style={{ justifyContent: "flex-end" }}>
              <button className="wz-btn wz-btn-primary" onClick={() => patch({ stage: "q", idx: 0 })}>Start →</button>
            </div>
          </div>
        </div>
      )}

      {cur.stage === "q" && q && (
        <>
          <div className="wz-fade" key={q.id + cur.idx}>
            <div className="wz-qhead">
              <span className="wz-step">Question {cur.idx + 1} of {visible.length}</span>
              <span className="wz-chip">{q.chip}</span>
            </div>
            <h2 className="wz-prompt">{q.prompt}</h2>
            {q.help && <p className="wz-help">{q.help}</p>}

            <div className="wz-answers">
              {q.type === "rating" && (
                <>
                  <div className={"wz-rate" + ((q.points || 5) >= 7 ? " wz-rate-7" : "")}>
                    {Array.from({ length: q.points || 5 }, (_, i) => i + 1).map((n) => (
                      <button key={n} className="wz-rdot" aria-pressed={cur.answers[q.id] === n}
                        onClick={() => setAnswer(n)}>{n}</button>
                    ))}
                  </div>
                  <div className="wz-scalelabels"><span>1 · {q.scale[0]}</span><span>{q.points || 5} · {q.scale[1]}</span></div>
                </>
              )}
              {q.type === "single" && q.options.map((opt) => (
                <button key={opt} className="wz-opt" aria-pressed={cur.answers[q.id] === opt} onClick={() => setAnswer(opt)}>
                  <span className="wz-tick">{cur.answers[q.id] === opt && <Check />}</span>{opt}
                </button>
              ))}
              {q.type === "text" && (
                <>
                  <textarea className="wz-text" placeholder={q.placeholder} value={cur.answers[q.id] || ""}
                    onChange={(e) => setAnswer(e.target.value)} />
                  <span className="wz-optional">Optional — but anything you share helps.</span>
                </>
              )}
            </div>
          </div>

          <div className="wz-foot">
            <div className="wz-sprig-wrap"><Sprig total={visible.length} current={cur.idx} /></div>
            <div className="wz-nav">
              <button className="wz-btn wz-btn-ghost" onClick={goBack} disabled={cur.idx === 0}>← Back</button>
              <button className="wz-btn wz-btn-primary" onClick={goNext} disabled={!answered}>
                {isLast ? "Submit" : "Continue →"}
              </button>
            </div>
          </div>
        </>
      )}

      {cur.stage === "done" && (
        <div className="wz-done wz-fade">
          <span className="wz-done-mark"><Leaf s={74} /></span>
          <h2 className="wz-title" style={{ fontSize: 30 }}>Thank you</h2>
          <p className="wz-lede" style={{ textAlign: "center" }}>
            Your feedback on {survey.name.toLowerCase()} is in. It goes straight to the team working on making Willow better.
          </p>
          <div className="wz-recap">
            <span className="wz-pill">{answeredCount} of {visible.length} answered</span>
            <span className="wz-pill"><Leaf s={13} /> Anonymous</span>
          </div>
          <p className="wz-note">
            Prototype note — in production this response would write to a {survey.label} Customer.io
            segment and fire Mixpanel events for completion and drop-off tracking.
          </p>
          <div className="wz-donebtns">
            <button className="wz-btn wz-btn-primary" onClick={restart}>Restart this survey</button>
            {mode === "flow" ? (
              <button className="wz-btn wz-btn-ghost" onClick={() => setFlowView("inbox")}>← Back to inbox</button>
            ) : (
              <button className="wz-btn wz-btn-ghost"
                onClick={() => switchReview(active === "onboarding" ? "portal" : "onboarding")}>
                Try the other survey →
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );

  /* ---------- rail (review mode) ---------- */
  const renderRail = () => (
    <aside className="wz-rail">
      <button className="wz-railtoggle" onClick={() => setRailOpen((o) => !o)}>
        {railOpen ? "Hide" : "Show"} survey details & questions
      </button>
      <div style={{ display: "contents" }}>
        <div className={"wz-rcard " + (railOpen ? "" : "wz-rail-collapsed")}>
          <p className="wz-rlabel">Cohort</p>
          <ul className="wz-clist">{survey.cohort.map((c) => (
            <li key={c} className="wz-cli"><span className="wz-cdot" />{c}</li>))}</ul>
        </div>
        <div className={"wz-rcard " + (railOpen ? "" : "wz-rail-collapsed")}>
          <p className="wz-rlabel">Goal</p><p className="wz-goal">{survey.goal}</p>
        </div>
        <div className={"wz-rcard " + (railOpen ? "" : "wz-rail-collapsed")}>
          <p className="wz-rlabel">Questions · answer types</p>
          <ul className="wz-spine">{visible.map((vq, i) => {
            const done = cur.answers[vq.id] !== undefined;
            const isCur = cur.stage === "q" && i === cur.idx;
            return (
              <li key={vq.id}>
                <button className="wz-sitem" aria-current={isCur} onClick={() => patch({ stage: "q", idx: i })}>
                  <span className={"wz-snum" + (done && !isCur ? " done" : "")}>{done && !isCur ? <Check /> : i + 1}</span>
                  <span className="wz-stext">{vq.label}<br /><span className="wz-stype">{typeText(vq)}</span></span>
                </button>
              </li>
            );
          })}</ul>
          <div className="wz-rfoot"><Leaf s={13} /> {survey.sync}</div>
        </div>
      </div>
    </aside>
  );

  /* ---------- inbox + reading (flow mode) ---------- */
  const renderInbox = () => (
    <div className="wz-solo wz-fade">
      <div className="wz-mail">
        <div className="wz-mail-head"><span className="wz-mail-title">Inbox</span><span className="wz-mail-sub">2 messages</span></div>
        {["onboarding", "portal"].map((k) => {
          const e = EMAILS[k]; const unread = !read[k];
          return (
            <button className="wz-mrow" key={k} onClick={() => openEmail(k)}>
              <span className="wz-avatar"><Leaf s={20} /></span>
              <span className="wz-mbody">
                <span className="wz-mfrom"><span className="wz-msender">{e.sender}</span><span className="wz-mtime">{e.time}</span></span>
                <span className="wz-msubj">{e.subject}</span>
                <span className="wz-mprev">{e.preview}</span>
              </span>
              {unread && <span className="wz-unread" />}
            </button>
          );
        })}
      </div>
      <p className="wz-flowhint">A mock patient inbox — open a message to launch its survey.</p>
    </div>
  );

  const renderReading = () => {
    const e = EMAILS[active];
    return (
      <div className="wz-solo wz-fade">
        <div className="wz-read">
          <div className="wz-read-bar">
            <button className="wz-iconbtn" onClick={() => setFlowView("inbox")} aria-label="Back to inbox"><Back /></button>
            <span className="wz-read-barlabel">Inbox</span>
          </div>
          <div className="wz-read-body">
            <div className="wz-read-from">
              <span className="wz-avatar"><Leaf s={20} /></span>
              <span><span className="wz-msender">{e.sender}</span><br /><span className="wz-readaddr">{e.address} · to you</span></span>
              <span className="wz-mtime" style={{ marginLeft: "auto" }}>{e.time}</span>
            </div>
            <h1 className="wz-read-subj">{e.subject}</h1>
            {e.body.map((p, i) => <p className="wz-read-p" key={i}>{p}</p>)}
            <button className="wz-btn wz-btn-primary" style={{ marginTop: 18 }} onClick={() => launchFromEmail(active)}>
              {e.cta} →
            </button>
            <p className="wz-read-foot">Willow Health · You're receiving this because you have a Willow account · Unsubscribe</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wz">
      <style>{CSS}</style>
      <div className="wz-shell">
        <header className="wz-top">
          <div className="wz-brand">
            <span className="wz-mark"><Leaf /></span>
            <div><div className="wz-word">willow</div><div className="wz-sub">Patient UX Survey · prototype</div></div>
          </div>
          <div className="wz-tabs" role="group" aria-label="Choose a mode">
            <button className="wz-tab" aria-pressed={mode === "flow"} onClick={() => goMode("flow")}>Patient flow</button>
            <button className="wz-tab" aria-pressed={mode === "review"} onClick={() => goMode("review")}>Review tool</button>
          </div>
        </header>

        {mode === "review" && (
          <div className="wz-subrow">
            <span className="wz-subrow-label">Survey</span>
            <div className="wz-tabs" role="group" aria-label="Choose a questionnaire">
              {Object.keys(SURVEYS).map((k) => (
                <button key={k} className="wz-tab" aria-pressed={active === k} onClick={() => switchReview(k)}>
                  {SURVEYS[k].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "review" && (
          <div className="wz-grid">{renderCanvas()}{renderRail()}</div>
        )}

        {mode === "flow" && flowView === "inbox" && renderInbox()}
        {mode === "flow" && flowView === "reading" && renderReading()}
        {mode === "flow" && flowView === "survey" && (
          <div className="wz-solo">
            <button className="wz-backlink" onClick={() => setFlowView("inbox")}><Back /> Back to inbox</button>
            {renderCanvas()}
          </div>
        )}
      </div>
    </div>
  );
}
