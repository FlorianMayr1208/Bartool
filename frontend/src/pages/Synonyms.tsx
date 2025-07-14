import { useEffect, useState } from 'react';
import {
  listSynonyms,
  addSynonym,
  deleteSynonym,
  importSynonyms,
  listUnitSynonyms,
  addUnitSynonym,
  deleteUnitSynonym,
  importUnitSynonyms,
  type FetchDebug,
  type Synonym,
} from '../api';


export default function Synonyms() {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [unitSynonyms, setUnitSynonyms] = useState<Synonym[]>([]);
  const [alias, setAlias] = useState('');
  const [canonical, setCanonical] = useState('');
  const [unitAlias, setUnitAlias] = useState('');
  const [unitCanonical, setUnitCanonical] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showUnitImport, setShowUnitImport] = useState(false);
  const [importUnitText, setImportUnitText] = useState('');

  const formatDebug = (dbg: FetchDebug) =>
    `GET ${dbg.url}\nStatus: ${dbg.status}\n` +
    `Response: ${JSON.stringify(dbg.body, null, 2)}`;

  const addDebug = (dbg: FetchDebug) =>
    setDebugLog((d) => [...d, formatDebug(dbg)]);

  const refresh = () => {
    listSynonyms().then(({ data, debug }) => {
      if (debug) addDebug(debug);
      if (data) setSynonyms(data);
    });
    listUnitSynonyms().then(({ data, debug }) => {
      if (debug) addDebug(debug);
      if (data) setUnitSynonyms(data);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    if (!alias || !canonical) return;
    const { debug } = await addSynonym(alias, canonical);
    if (debug) addDebug(debug);
    setAlias('');
    setCanonical('');
    refresh();
  };

  const submitUnit = async () => {
    if (!unitAlias || !unitCanonical) return;
    const { debug } = await addUnitSynonym(unitAlias, unitCanonical);
    if (debug) addDebug(debug);
    setUnitAlias('');
    setUnitCanonical('');
    refresh();
  };

  const remove = async (a: string) => {
    const { debug } = await deleteSynonym(a);
    if (debug) addDebug(debug);
    setSynonyms(synonyms.filter((s) => s.alias !== a));
  };

  const removeUnit = async (a: string) => {
    const { debug } = await deleteUnitSynonym(a);
    if (debug) addDebug(debug);
    setUnitSynonyms(unitSynonyms.filter((s) => s.alias !== a));
  };

  const submitImport = async () => {
    try {
      const data = JSON.parse(importText);
      const { debug } = await importSynonyms(data);
      if (debug) addDebug(debug);
      setImportText('');
      setShowImport(false);
      refresh();
    } catch {
      alert('Invalid JSON');
    }
  };

  const submitUnitImport = async () => {
    try {
      const data = JSON.parse(importUnitText);
      const { debug } = await importUnitSynonyms(data);
      if (debug) addDebug(debug);
      setImportUnitText('');
      setShowUnitImport(false);
      refresh();
    } catch {
      alert('Invalid JSON');
    }
  };

  const readFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) file.text().then(setter);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold font-display">Synonyms</h1>
      <div className="space-x-2">
        <input
          placeholder="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="border p-1" style={{ borderColor: 'var(--border)' }}
        />
        <input
          placeholder="Canonical"
          value={canonical}
          onChange={(e) => setCanonical(e.target.value)}
          className="border p-1" style={{ borderColor: 'var(--border)' }}
        />
        <button onClick={submit} className="button-send">Add</button>
        <button
          onClick={() => setShowImport(!showImport)}
          className="button-search"
        >
          Import
        </button>
      </div>
      {showImport && (
        <div className="space-y-2 mt-2">
          <textarea
            placeholder='{"alias": "Canonical"}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="border p-1 w-full h-24" style={{ border: '1px solid var(--border)' }}
          />
          <input
            type="file"
            accept="application/json"
            onChange={(e) => readFile(e, setImportText)}
          />
          <button onClick={submitImport} className="button-send">
            Import JSON
          </button>
        </div>
      )}
      <table className="min-w-full border text-left" style={{ border: '1px solid var(--border)' }}>
        <thead>
          <tr>
            <th className="px-2">Alias</th>
            <th className="px-2">Canonical</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {synonyms.map((s) => (
            <tr key={s.alias} className="border-t" style={{ borderTop: '1px solid var(--border)' }}>
              <td className="px-2 py-1">{s.alias}</td>
              <td className="px-2 py-1">{s.canonical}</td>
              <td className="px-2 py-1">
                <button onClick={() => remove(s.alias)} className="button-search">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1 className="text-xl font-bold">Unit Synonyms</h1>
      <div className="space-x-2">
        <input
          placeholder="Alias"
          value={unitAlias}
          onChange={(e) => setUnitAlias(e.target.value)}
          className="border p-1" style={{ border: '1px solid var(--border)' }}
        />
        <input
          placeholder="Canonical"
          value={unitCanonical}
          onChange={(e) => setUnitCanonical(e.target.value)}
          className="border p-1" style={{ border: '1px solid var(--border)' }}
        />
        <button onClick={submitUnit} className="button-send">Add</button>
        <button
          onClick={() => setShowUnitImport(!showUnitImport)}
          className="button-search"
        >
          Import
        </button>
      </div>
      {showUnitImport && (
        <div className="space-y-2 mt-2">
          <textarea
            placeholder='{"alias": "canonical"}'
            value={importUnitText}
            onChange={(e) => setImportUnitText(e.target.value)}
            className="border p-1 w-full h-24" style={{ border: '1px solid var(--border)' }}
          />
          <input
            type="file"
            accept="application/json"
            onChange={(e) => readFile(e, setImportUnitText)}
          />
          <button onClick={submitUnitImport} className="button-send">
            Import JSON
          </button>
        </div>
      )}
      <table className="min-w-full border text-left" style={{ border: '1px solid var(--border)' }}>
        <thead>
          <tr>
            <th className="px-2">Alias</th>
            <th className="px-2">Canonical</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {unitSynonyms.map((s) => (
            <tr key={s.alias} className="border-t" style={{ borderTop: '1px solid var(--border)' }}>
              <td className="px-2 py-1">{s.alias}</td>
              <td className="px-2 py-1">{s.canonical}</td>
              <td className="px-2 py-1">
                <button onClick={() => removeUnit(s.alias)} className="button-search">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {debugLog.length > 0 && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="button-search"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          {showDebug && (
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 text-xs">
              {debugLog.join('\n\n')}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}