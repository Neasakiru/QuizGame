import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API = 'https://localhost:7005/api/questions';

const emptyQuestion = () => ({
  id: crypto.randomUUID(),
  category: '',
  content: '',
  timeLimitSeconds: 20,
  answers: [
    { id: crypto.randomUUID(), content: '', isCorrect: true },
    { id: crypto.randomUUID(), content: '', isCorrect: false },
    { id: crypto.randomUUID(), content: '', isCorrect: false },
    { id: crypto.randomUUID(), content: '', isCorrect: false },
  ],
});

const CATEGORIES = ['Geografia', 'Historia', 'Technologia', 'Sport', 'Nauka', 'Kultura', 'Inne'];

export default function QuestionsPage() {
  const [questions, setQuestions]   = useState([]);
  const [expanded, setExpanded]     = useState(null);   // id expanded row
  const [drafts, setDrafts]         = useState({});     // id → edited copy
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(null);   // id of saving question
  const [deleting, setDeleting]     = useState(null);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [newOpen, setNewOpen]       = useState(false);
  const [newDraft, setNewDraft]     = useState(emptyQuestion());

  // ── fetch ──────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setQuestions(await res.json());
    } catch (e) {
      setError('Nie można pobrać pytań: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // ── helpers ────────────────────────────────────────────────
  const toggleRow = (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!drafts[id]) {
      const q = questions.find(q => q.id === id);
      setDrafts(d => ({ ...d, [id]: structuredClone(q) }));
    }
  };

  const updateDraft = (id, path, value) => {
    setDrafts(d => {
      const copy = structuredClone(d[id]);
      if (path.startsWith('answers.')) {
        const [, idx, field] = path.split('.');
        copy.answers[idx][field] = value;
      } else {
        copy[path] = value;
      }
      return { ...d, [id]: copy };
    });
  };

  const setCorrect = (id, answerIdx) => {
    setDrafts(d => {
      const copy = structuredClone(d[id]);
      copy.answers.forEach((a, i) => a.isCorrect = i === answerIdx);
      return { ...d, [id]: copy };
    });
  };

  const saveQuestion = async (id) => {
    setSaving(id);
    setError(null);
    try {
      const draft = drafts[id];
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setQuestions(qs => qs.map(q => q.id === id ? draft : q));
      setExpanded(null);
    } catch (e) {
      setError('Błąd zapisu: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Usunąć to pytanie?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setQuestions(qs => qs.filter(q => q.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (e) {
      setError('Błąd usuwania: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  // ── new question ───────────────────────────────────────────
  const updateNew = (path, value) => {
    setNewDraft(d => {
      const copy = structuredClone(d);
      if (path.startsWith('answers.')) {
        const [, idx, field] = path.split('.');
        copy.answers[idx][field] = value;
      } else {
        copy[path] = value;
      }
      return copy;
    });
  };

  const setNewCorrect = (answerIdx) => {
    setNewDraft(d => {
      const copy = structuredClone(d);
      copy.answers.forEach((a, i) => a.isCorrect = i === answerIdx);
      return copy;
    });
  };

  const addQuestion = async () => {
    setSaving('new');
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setQuestions(qs => [...qs, created]);
      setNewOpen(false);
      setNewDraft(emptyQuestion());
    } catch (e) {
      setError('Błąd dodawania: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  // ── filter ─────────────────────────────────────────────────
  const filtered = questions.filter(q =>
    q.content?.toLowerCase().includes(search.toLowerCase()) ||
    q.category?.toLowerCase().includes(search.toLowerCase())
  );

  // ── render ─────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      <div className="qp-root">
        {/* ── Header ── */}
        <header className="qp-header">
          <div className="qp-header-left">
            <Link to="/" className="qp-back">← Powrót</Link>
            <h1 className="qp-title">
              <span className="qp-title-accent">Quiz</span>Game
            </h1>
            <span className="qp-count">{questions.length} pytań</span>
          </div>
          <button className="qp-btn qp-btn-primary" onClick={() => { setNewOpen(o => !o); setNewDraft(emptyQuestion()); }}>
            {newOpen ? '✕ Anuluj' : '+ Nowe pytanie'}
          </button>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="qp-error">
            ⚠ {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* ── New question form ── */}
        {newOpen && (
          <div className="qp-new-panel">
            <h2 className="qp-panel-title">Nowe pytanie</h2>
            <QuestionForm
              draft={newDraft}
              onUpdate={updateNew}
              onSetCorrect={setNewCorrect}
              idPrefix="new"
            />
            <div className="qp-form-actions">
              <button
                className="qp-btn qp-btn-primary"
                onClick={addQuestion}
                disabled={saving === 'new'}
              >
                {saving === 'new' ? 'Zapisywanie…' : '✓ Zapisz pytanie'}
              </button>
            </div>
          </div>
        )}

        {/* ── Search ── */}
        <div className="qp-toolbar">
          <div className="qp-search-wrap">
            <span className="qp-search-icon">⌕</span>
            <input
              className="qp-search"
              placeholder="Szukaj pytania lub kategorii…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="qp-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="qp-state">
            <div className="qp-spinner" />
            <p>Ładowanie pytań…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="qp-state">
            <p>{search ? 'Brak wyników dla "' + search + '"' : 'Brak pytań w bazie.'}</p>
          </div>
        ) : (
          <div className="qp-table-wrap">
            <table className="qp-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 120 }}>Kategoria</th>
                  <th>Pytanie</th>
                  <th style={{ width: 80 }}>Czas</th>
                  <th style={{ width: 110 }}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const isOpen = expanded === q.id;
                  const draft  = drafts[q.id] || q;
                  return (
                    <>
                      {/* ── Row ── */}
                      <tr
                        key={q.id}
                        className={`qp-row ${isOpen ? 'qp-row--open' : ''}`}
                        onClick={() => toggleRow(q.id)}
                      >
                        <td className="qp-cell-num">{idx + 1}</td>
                        <td>
                          <span className="qp-badge">{q.category || '—'}</span>
                        </td>
                        <td className="qp-cell-content">
                          <span className="qp-chevron">{isOpen ? '▾' : '▸'}</span>
                          {q.content}
                        </td>
                        <td className="qp-cell-time">{q.timeLimitSeconds}s</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className="qp-btn qp-btn-danger qp-btn-sm"
                            disabled={deleting === q.id}
                            onClick={() => deleteQuestion(q.id)}
                          >
                            {deleting === q.id ? '…' : 'Usuń'}
                          </button>
                        </td>
                      </tr>

                      {/* ── Expanded edit form ── */}
                      {isOpen && (
                        <tr key={q.id + '-edit'} className="qp-row-edit">
                          <td colSpan={5}>
                            <div className="qp-edit-panel">
                              <QuestionForm
                                draft={draft}
                                onUpdate={(path, val) => updateDraft(q.id, path, val)}
                                onSetCorrect={(i) => setCorrect(q.id, i)}
                                idPrefix={q.id}
                              />
                              <div className="qp-form-actions">
                                <button
                                  className="qp-btn qp-btn-ghost"
                                  onClick={() => setExpanded(null)}
                                >
                                  Anuluj
                                </button>
                                <button
                                  className="qp-btn qp-btn-primary"
                                  onClick={() => saveQuestion(q.id)}
                                  disabled={saving === q.id}
                                >
                                  {saving === q.id ? 'Zapisywanie…' : '✓ Zapisz zmiany'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── Reusable form ──────────────────────────────────────────────────────────
function QuestionForm({ draft, onUpdate, onSetCorrect, idPrefix }) {
  return (
    <div className="qp-form">
      <div className="qp-form-row">
        <div className="qp-field">
          <label className="qp-label">Kategoria</label>
          <select
            className="qp-input"
            value={draft.category}
            onChange={e => onUpdate('category', e.target.value)}
          >
            <option value="">— wybierz —</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="qp-field qp-field--sm">
          <label className="qp-label">Czas (s)</label>
          <input
            className="qp-input"
            type="number"
            min={5} max={120}
            value={draft.timeLimitSeconds}
            onChange={e => onUpdate('timeLimitSeconds', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="qp-field">
        <label className="qp-label">Treść pytania</label>
        <textarea
          className="qp-input qp-textarea"
          value={draft.content}
          rows={2}
          onChange={e => onUpdate('content', e.target.value)}
          placeholder="Wpisz pytanie…"
        />
      </div>

      <div className="qp-answers-grid">
        {draft.answers.map((a, i) => (
          <div key={i} className={`qp-answer ${a.isCorrect ? 'qp-answer--correct' : ''}`}>
            <button
              type="button"
              className={`qp-correct-btn ${a.isCorrect ? 'qp-correct-btn--active' : ''}`}
              onClick={() => onSetCorrect(i)}
              title={a.isCorrect ? 'Poprawna odpowiedź' : 'Ustaw jako poprawną'}
            >
              {a.isCorrect ? '✓' : '○'}
            </button>
            <input
              className="qp-input qp-answer-input"
              value={a.content}
              onChange={e => onUpdate(`answers.${i}.content`, e.target.value)}
              placeholder={`Odpowiedź ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <p className="qp-hint">Kliknij ○ przy odpowiedzi aby oznaczyć ją jako poprawną.</p>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .qp-root {
    min-height: 100vh;
    background: #0d0f14;
    color: #e8eaf0;
    font-family: 'Syne', sans-serif;
    padding: 0 0 0px;
    Width: 100vw;
  }

  /* ── Header ── */
  .qp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 40px 24px;
    border-bottom: 1px solid #1e2130;
    gap: 16px;
    flex-wrap: wrap;
  }
  .qp-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .qp-back {
    color: #5a6080;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.04em;
    transition: color 0.15s;
  }
  .qp-back:hover { color: #e8eaf0; }
  .qp-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .qp-title-accent { color: #f0c040; }
  .qp-count {
    font-size: 12px;
    background: #1e2130;
    color: #5a6080;
    border-radius: 20px;
    padding: 3px 10px;
    font-family: 'DM Mono', monospace;
  }

  /* ── Buttons ── */
  .qp-btn {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 13px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    padding: 9px 18px;
    transition: all 0.15s;
  }
  .qp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .qp-btn-primary {
    background: #f0c040;
    color: #0d0f14;
  }
  .qp-btn-primary:hover:not(:disabled) { background: #f5d060; }
  .qp-btn-ghost {
    background: transparent;
    color: #5a6080;
    border: 1px solid #2a2e40;
  }
  .qp-btn-ghost:hover { background: #1e2130; color: #e8eaf0; }
  .qp-btn-danger {
    background: transparent;
    color: #e05555;
    border: 1px solid #3a1e1e;
  }
  .qp-btn-danger:hover:not(:disabled) { background: #3a1e1e; }
  .qp-btn-sm { padding: 5px 12px; font-size: 12px; }

  /* ── Error ── */
  .qp-error {
    margin: 16px 40px 0;
    background: #2a1a1a;
    border: 1px solid #5a2020;
    border-radius: 8px;
    padding: 12px 16px;
    color: #e07070;
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .qp-error button {
    background: none;
    border: none;
    color: #e07070;
    cursor: pointer;
    font-size: 14px;
  }

  /* ── New panel ── */
  .qp-new-panel {
    margin: 24px 40px 0;
    background: #12151f;
    border: 1px solid #2a2e40;
    border-radius: 12px;
    padding: 28px 32px;
  }
  .qp-panel-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #f0c040;
    margin: 0 0 20px;
  }

  /* ── Toolbar ── */
  .qp-toolbar {
    padding: 20px 40px 0;
  }
  .qp-search-wrap {
    position: relative;
    max-width: 360px;
  }
  .qp-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #3a4060;
    font-size: 18px;
    pointer-events: none;
  }
  .qp-search {
    width: 100%;
    background: #12151f;
    border: 1px solid #2a2e40;
    border-radius: 8px;
    color: #e8eaf0;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    padding: 9px 36px 9px 36px;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .qp-search:focus { border-color: #f0c040; }
  .qp-search::placeholder { color: #3a4060; }
  .qp-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #5a6080;
    cursor: pointer;
    font-size: 12px;
  }

  /* ── Table ── */
  .qp-table-wrap {
    margin: 20px 40px 0;
    border: 1px solid #1e2130;
    border-radius: 12px;
    overflow: hidden;
  }
  .qp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .qp-table thead tr {
    background: #12151f;
  }
  .qp-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #3a4060;
    border-bottom: 1px solid #1e2130;
  }

  .qp-row {
    border-bottom: 1px solid #1a1d28;
    cursor: pointer;
    transition: background 0.12s;
  }
  .qp-row:hover { background: #12151f; }
  .qp-row--open { background: #12151f; }
  .qp-row td { padding: 13px 16px; vertical-align: middle; }

  .qp-cell-num {
    color: #3a4060;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
  }
  .qp-cell-time {
    font-family: 'DM Mono', monospace;
    color: #5a6080;
    font-size: 12px;
  }
  .qp-cell-content {
    color: #c8cadc;
    line-height: 1.4;
  }
  .qp-chevron {
    margin-right: 8px;
    color: #f0c040;
    font-size: 11px;
  }

  .qp-badge {
    display: inline-block;
    background: #1a1d28;
    border: 1px solid #2a2e40;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    color: #8090b0;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
  }

  /* ── Edit row ── */
  .qp-row-edit td {
    padding: 0;
    background: #0d0f14;
    border-bottom: 2px solid #f0c04030;
  }
  .qp-edit-panel {
    padding: 24px 32px;
    border-left: 3px solid #f0c040;
  }

  /* ── Form ── */
  .qp-form { display: flex; flex-direction: column; gap: 16px; }
  .qp-form-row { display: flex; gap: 16px; }
  .qp-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .qp-field--sm { max-width: 110px; flex: none; }
  .qp-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5a6080;
  }
  .qp-input {
    background: #0d0f14;
    border: 1px solid #2a2e40;
    border-radius: 7px;
    color: #e8eaf0;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }
  .qp-input:focus { border-color: #f0c040; }
  .qp-textarea { resize: vertical; min-height: 60px; }

  /* ── Answers grid ── */
  .qp-answers-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .qp-answer {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #12151f;
    border: 1px solid #2a2e40;
    border-radius: 8px;
    padding: 6px 10px 6px 8px;
    transition: border-color 0.15s;
  }
  .qp-answer--correct {
    border-color: #2a5c30;
    background: #0e1a10;
  }
  .qp-answer-input {
    background: transparent;
    border: none;
    flex: 1;
    padding: 4px 0;
  }
  .qp-answer-input:focus { border: none; box-shadow: none; }
  .qp-correct-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #2a2e40;
    background: transparent;
    color: #5a6080;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .qp-correct-btn--active {
    border-color: #40c060;
    background: #40c060;
    color: #0d0f14;
  }
  .qp-correct-btn:hover:not(.qp-correct-btn--active) {
    border-color: #40c060;
    color: #40c060;
  }

  .qp-hint {
    font-size: 11px;
    color: #3a4060;
    margin: 0;
  }

  /* ── Form actions ── */
  .qp-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
  }

  /* ── States ── */
  .qp-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    gap: 16px;
    color: #3a4060;
    font-size: 14px;
  }
  .qp-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #1e2130;
    border-top-color: #f0c040;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 680px) {
    .qp-header, .qp-toolbar, .qp-table-wrap, .qp-new-panel, .qp-error {
      margin-left: 16px;
      margin-right: 16px;
      padding-left: 16px;
      padding-right: 16px;
    }
    .qp-header { padding-top: 20px; padding-bottom: 16px; }
    .qp-answers-grid { grid-template-columns: 1fr; }
    .qp-form-row { flex-direction: column; }
    .qp-field--sm { max-width: none; }
  }
`;