import { useViewport } from '../contexts/ViewportContext';

export default function ForceTabletButton() {
  const { forceTablet, toggleForceTablet } = useViewport();
  return (
    <button
      onClick={() => !forceTablet && toggleForceTablet()}
      className="button-send"
    >
      Force Tablet
    </button>
  );
}
