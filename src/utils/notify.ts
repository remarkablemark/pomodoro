function getTitle(nextMode: 'work' | 'shortBreak' | 'longBreak'): string {
  return nextMode === 'work' ? 'Break is over' : 'Work session complete';
}

function getBody(nextMode: 'work' | 'shortBreak' | 'longBreak'): string {
  if (nextMode === 'work') {
    return 'Time to focus.';
  }
  if (nextMode === 'longBreak') {
    return 'Take a long break.';
  }
  return 'Take a short break.';
}

export async function showNotification(
  nextMode: 'work' | 'shortBreak' | 'longBreak',
): Promise<void> {
  if (typeof Notification === 'undefined') {
    return;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    new Notification(getTitle(nextMode), { body: getBody(nextMode) });
  }
}
