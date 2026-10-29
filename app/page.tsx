'use client';

import { useState } from 'react';
import {
  Activity,
  Atom,
  AudioLines,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  FileSearch,
  GitBranch,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  X,
} from 'lucide-react';

type Agent = {
  id: string;
  name: string;
  role: string;
  letter: string;
  color: string;
  glow: string;
  description: string;
  icon: typeof Atom;
};
type CouncilAgent = {
  id: string;
  name: string;
  role: string;
  response: string;
};

type CouncilMessage = {
  question: string;
  answer: string;
  agents: CouncilAgent[];
};

const agents: Agent[] = [
  { id: 'friday', name: 'FRIDAY', role: 'Coordinator', letter: 'F', color: 'blue', glow: 'rgba(99,169,255,.20)', description: 'Coordinates the council and shapes the final response.', icon: Atom },
  { id: 'edith', name: 'EDITH', role: 'Research', letter: 'E', color: 'violet', glow: 'rgba(173,132,255,.18)', description: 'Finds sources, checks dates, and traces claims to evidence.', icon: Search },
  { id: 'dume', name: 'DUM-E', role: 'Analysis', letter: 'D', color: 'mint', glow: 'rgba(89,230,190,.15)', description: 'Works through code, calculations, and practical details.', icon: TerminalSquare },
  { id: 'u', name: 'U', role: 'Critic', letter: 'U', color: 'amber', glow: 'rgba(255,199,102,.15)', description: 'Challenges assumptions and looks for counterexamples.', icon: Workflow },
  { id: 'ultron', name: 'ULTRON', role: 'Adjudicator', letter: 'Ω', color: 'red', glow: 'rgba(255,108,126,.16)', description: 'Weighs the evidence and identifies unresolved uncertainty.', icon: ShieldCheck },
];

export default function Home() {
  const [activeAgent, setActiveAgent] = useState('friday');
  const [showEvidence, setShowEvidence] = useState(false);
  const [message, setMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CouncilMessage[]>([]);
  const [agentResponses, setAgentResponses] = useState<
  Record<string, string>
  >({});
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);

  const selectedAgent = agents.find((agent) => agent.id === activeAgent) ?? agents[0];

  
async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const question = message.trim();

  if (!question || loading) return;

  setLoading(true);
  setError('');
  setMessage('');
  setShowWelcome(false);
  setAgentResponses({});
  setCompletedAgents([]);

  try {
    const response = await fetch('/api/council', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'The council could not answer your question.'
      );
    }

    const returnedAgents: CouncilAgent[] = data.agents ?? [];

    setAgentResponses(
      Object.fromEntries(
        returnedAgents.map((agent) => [
          agent.id,
          agent.response,
        ])
      )
    );

    setCompletedAgents(returnedAgents.map((agent) => agent.id));

    setHistory((previous) => [
      ...previous,
      {
        question,
        answer: data.answer,
        agents: returnedAgents,
      },
    ]);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Something went wrong while contacting STARK.'
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Atom size={23} strokeWidth={1.5} /></div>
          <div className="brand-text"><span>S.T.A.R.K.</span><small>PERSONAL INTELLIGENCE</small></div>
          <button className="icon-button sidebar-collapse" aria-label="Collapse sidebar"><Layers3 size={17} /></button>
        </div>

        <button className="new-session" onClick={() => { setMessage(''); setShowWelcome(true); }}>
          <Plus size={16} /><span>New session</span><kbd>⌘ K</kbd>
        </button>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Workspace">
          <button className="nav-item active"><MessageSquareText size={17} /><span>Mindspace</span><span className="nav-indicator" /></button>
          <button className="nav-item" onClick={() => setShowEvidence(!showEvidence)}><GitBranch size={17} /><span>Evidence network</span></button>
          <button className="nav-item"><Layers3 size={17} /><span>Projects</span></button>
          <button className="nav-item"><FileSearch size={17} /><span>Knowledge library</span></button>
        </nav>

        <div className="sidebar-section-row"><span className="sidebar-section-label">RECENT SESSIONS</span><button className="tiny-icon" aria-label="More sessions"><MoreHorizontal size={16} /></button></div>
        <div className="empty-sessions"><div className="empty-session-icon"><MessageSquareText size={16} /></div><span>Your sessions will appear here.</span></div>

        <div className="sidebar-bottom">
          <div className="privacy-card"><div className="privacy-icon"><LockKeyhole size={15} /></div><div><strong>Private by design</strong><span>Local interface preview</span></div><span className="privacy-dot" /></div>
          <button className="profile-row"><div className="profile-avatar">A</div><div className="profile-copy"><strong>Workspace owner</strong><span>Local workspace</span></div><Settings2 size={16} className="profile-settings" /></button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Mindspace</strong></div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-dot" /><span>Interface ready</span></div>
            <span className="topbar-divider" />
            <button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button>
            <button className="icon-button" aria-label="Settings"><Settings2 size={17} /></button>
            <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={20} /> : <Command size={20} />}</button>
          </div>
        </header>

        {menuOpen && <div className="mobile-agent-menu">{agents.map((agent) => <button key={agent.id} onClick={() => { setActiveAgent(agent.id); setMenuOpen(false); }}><span className={`mini-agent-icon ${agent.color}`}>{agent.letter}</span><span>{agent.name}</span><small>{agent.role}</small></button>)}</div>}

        <div className="workspace-content">
          <section className="council-header">
            <div><div className="eyebrow"><span className="eyebrow-line" /> THE COUNCIL <span className="eyebrow-count">05 MINDS · ONE SYSTEM</span></div><h1>Your mindspace<span className="title-period">.</span></h1><p className="page-subtitle">A shared space for independent thinking, research, and considered answers.</p></div>
            <button className="session-options" aria-label="Session options"><MoreHorizontal size={19} /></button>
          </section>

          <section className="council-layout" aria-label="AI council">
            <div className="council-orbit" aria-label="Five agent identities">
              <div className="orbit orbit-outer" /><div className="orbit orbit-inner" /><div className="orbit-core-glow" />
              <div className="core-node"><Atom size={37} strokeWidth={1.15} /><span>STARK</span><small>CORE SYSTEM</small></div>
              {agents.map((agent, index) => {
                const positions = ['position-top', 'position-right', 'position-bottom-right', 'position-bottom-left', 'position-left'];
                return <button key={agent.id} className={`agent-orbit-node ${positions[index]} ${agent.color} ${activeAgent === agent.id ? 'selected' : ''}`} onClick={() => setActiveAgent(agent.id)} aria-pressed={activeAgent === agent.id} title={`${agent.name} · ${agent.role}`}>
                  <span className="orbit-agent-letter">{agent.letter}</span><span className="orbit-agent-name">{agent.name}</span><span className="orbit-agent-role">{agent.role}</span>
                </button>;
              })}
              <div className="orbit-spark spark-one" /><div className="orbit-spark spark-two" /><div className="orbit-spark spark-three" />
            </div>

            <div className="agent-detail-panel">
              <div className="panel-topline"><span className="panel-label">AGENT PROFILE</span><span className="not-connected">
              <span />
              {loading
                ? 'COUNCIL WORKING'
                : completedAgents.includes(selectedAgent.id)
                  ? 'RESPONSE READY'
                  : 'LOCAL MODEL'}
            </span>
            </div>
              <div className="agent-profile-heading">
                <div className={`agent-profile-icon ${selectedAgent.color}`}>{selectedAgent.letter}</div>
                <div><h2>{selectedAgent.name}</h2><span>{selectedAgent.role}</span></div>
                <button className="icon-button panel-more" aria-label="Agent details"><MoreHorizontal size={18} /></button>
              </div>
              <p className="agent-description">
                {agentResponses[selectedAgent.id] ||
                  selectedAgent.description}
              </p>
              <div className="panel-separator" />
              <div className="detail-row">
  <span>Model provider</span>
  <span className="detail-value muted">
    Ollama · gemma3:4b
  </span>
</div>

<div className="detail-row">
  <span>Execution state</span>
  <span className="state-pill">
    <span />
    {loading
      ? 'Processing'
      : completedAgents.includes(selectedAgent.id)
        ? 'Complete'
        : 'Idle'}
  </span>
</div>

<div className="detail-row">
  <span>Last activity</span>
  <span className="detail-value muted">
    {agentResponses[selectedAgent.id]
      ? 'Response received'
      : 'No activity yet'}
  </span>
</div>

<div className="agent-panel-footer">
  <Activity size={14} />
  <span>
    {loading
      ? 'Council processing your question'
      : 'Local model connection'}
  </span>
</div>
</div>
          </section>

          <section className="conversation-section">
            <div className="conversation-heading"><div><span className="section-kicker">THE INTERFACE</span><h2>Central conversation</h2></div><div className="conversation-meta"><span className="meta-dot" /> Local preview <ChevronDown size={13} /></div></div>
            <div className={`conversation-canvas ${showWelcome ? 'welcome-state' : ''}`}>
              
{showWelcome && history.length === 0 ? (
  <div className="welcome-content">
    <div className="welcome-emblem">
      <Sparkles size={21} />
    </div>
    <div className="welcome-overline">
      SYSTEM STANDING BY
    </div>
    <h3>Good to have you here.</h3>
    <p>
      Your council is ready. Ask a question to start
      your first collaborative investigation.
    </p>
    <div className="welcome-chips">
      <span><Search size={13} /> Research</span>
      <span><Workflow size={13} /> Analyze</span>
      <span><ShieldCheck size={13} /> Verify</span>
    </div>
  </div>
) : (
  <div className="conversation-history">
    {history.map((item, index) => (
      <div key={index} className="conversation-turn">
        <div className="user-message-bubble">
          {item.question}
        </div>

        <div className="assistant-message">
          <div className="welcome-overline">
            FRIDAY · FINAL RESPONSE
          </div>
          <div className="assistant-answer">
            {item.answer}
          </div>
        </div>
      </div>
    ))}

    {loading && (
      <div className="assistant-message">
        <div className="welcome-overline">
          STARK COUNCIL
        </div>
        <p>
          The five agents are analyzing your question.
          This may take a little while.
        </p>
      </div>
    )}

    {error && (
      <div className="preview-notice" role="alert">
        <span>{error}</span>
      </div>
    )}
  </div>
)}

              <form className="composer" onSubmit={handleSubmit}>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask the council anything..." rows={2} aria-label="Message the council" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
                <div className="composer-bottom"><div className="composer-tools"><button type="button" className="composer-tool" aria-label="Attach file" title="File attachments will be added later"><Paperclip size={16} /></button><span className="composer-tool-divider" /><button type="button" className="mode-selector"><Sparkles size={14} /><span>Council mode</span><ChevronDown size={13} /></button></div><div className="composer-submit-group"><span className="enter-hint">↵ to send</span><button className="send-button" type="submit" disabled={!message.trim() || loading} aria-label="Send message"><Send size={15} /></button></div></div>
              </form>
              <div className="composer-disclaimer">
  S.T.A.R.K. · Local AI powered by Ollama · gemma3:4b
</div>
            </div>
          </section>

          <section className={`evidence-section ${showEvidence ? 'expanded' : ''}`}>
            <button className="evidence-toggle" onClick={() => setShowEvidence(!showEvidence)} aria-expanded={showEvidence}><div className="evidence-toggle-left"><div className="evidence-icon"><GitBranch size={17} /></div><div><strong>Evidence network</strong><span>Trace claims, sources, and disagreements</span></div></div><div className="evidence-toggle-right"><span className="evidence-count">0 SOURCES</span>{showEvidence ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</div></button>
            {showEvidence && <div className="evidence-empty"><div className="evidence-empty-graphic"><GitBranch size={24} /></div><strong>No evidence nodes yet</strong><p>When research is connected, sources and claims will appear here with their relationships and verification status.</p></div>}
          </section>

          <footer className="workspace-footer"><span><span className="footer-mark">✳</span> S.T.A.R.K. <span className="footer-divider">/</span> System for Thinking, Analysis, Research and Knowledge</span><span className="footer-right"><LockKeyhole size={12} /> LOCAL PREVIEW <span className="footer-divider">·</span> v0.1</span></footer>
        </div>
      </section>
    </main>
  );
}
