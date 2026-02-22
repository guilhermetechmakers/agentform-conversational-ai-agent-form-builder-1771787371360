const SIDEBAR_KEY = 'agentform-settings-sidebar-collapsed'

export function getSettingsSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export function setSettingsSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  } catch {
    // ignore
  }
}
