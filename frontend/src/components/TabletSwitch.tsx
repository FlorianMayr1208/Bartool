import { useViewport } from '../contexts/ViewportContext';

export default function TabletSwitch() {
  const { forceTablet, toggleForceTablet } = useViewport();
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={forceTablet}
        onChange={toggleForceTablet}
        className="rounded"
      />
      <span className="text-sm">Tablet layout</span>
    </label>
  );
}
