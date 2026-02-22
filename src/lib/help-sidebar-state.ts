const SIDEBAR_KEY = 'agentform-help-sidebar-collapsed'

export function getHelpSidebarState(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export function setHelpSidebarState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  } catch {
    // ignore
  }
}
