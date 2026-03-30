import useUIStore from '../store/uiStore'

export default function useDarkMode() {
  const darkMode = useUIStore((s) => s.darkMode)
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)
  return { darkMode, toggleDarkMode }
}
