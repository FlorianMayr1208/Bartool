import { useEffect, useState } from 'react';
import {
  listSynonyms,
  addSynonym,
  deleteSynonym,
  type FetchDebug,
  type Synonym,
} from '../api';


export default function Synonyms() {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [alias, setAlias] = useState('');
  const [canonical, setCanonical] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

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

  const remove = async (a: string) => {
    const { debug } = await deleteSynonym(a);
    if (debug) addDebug(debug);
    setSynonyms(synonyms.filter((s) => s.alias !== a));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Synonyms</h1>
      <div className="space-x-2">
        <input
          placeholder="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="border p-1"
        />
        <input
          placeholder="Canonical"
          value={canonical}
          onChange={(e) => setCanonical(e.target.value)}
          className="border p-1"
        />
        <button onClick={submit} className="rounded bg-blue-500 px-2 py-1 text-white">
          Add
        </button>
      </div>
      <table className="min-w-full border text-left">
        <thead>
          <tr>
            <th className="px-2">Alias</th>
            <th className="px-2">Canonical</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {synonyms.map((s) => (
            <tr key={s.alias} className="border-t">
              <td className="px-2 py-1">{s.alias}</td>
              <td className="px-2 py-1">{s.canonical}</td>
              <td className="px-2 py-1">
                <button onClick={() => remove(s.alias)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {debugLog.length > 0 && (
        <pre className="whitespace-pre-wrap bg-gray-100 p-2 text-xs">
          {debugLog.join('\n\n')}
        </pre>
      )}
    </div>
  );
}
