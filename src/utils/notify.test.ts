import type { Mock } from 'vitest';

import { showNotification } from './notify';

describe('showNotification', () => {
  const NotificationMock = vi.fn();
  let requestPermission: Mock<() => Promise<NotificationPermission>>;

  beforeEach(() => {
    NotificationMock.mockClear();
    requestPermission = vi.fn<() => Promise<NotificationPermission>>();
    Object.assign(NotificationMock, {
      permission: 'default',
      requestPermission,
    });
    vi.stubGlobal('Notification', NotificationMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when Notification is not available', async () => {
    vi.unstubAllGlobals();
    await showNotification('work');
    expect(requestPermission).not.toHaveBeenCalled();
    expect(NotificationMock).not.toHaveBeenCalled();
  });

  it('requests permission and shows a notification when granted', async () => {
    requestPermission.mockImplementation(() => {
      Object.assign(NotificationMock, { permission: 'granted' });
      return Promise.resolve('granted');
    });

    await showNotification('shortBreak');

    expect(requestPermission).toHaveBeenCalled();
    expect(NotificationMock).toHaveBeenCalledWith('Work session complete', {
      body: 'Take a short break.',
    });
  });

  it('shows a long break notification when granted', async () => {
    requestPermission.mockImplementation(() => {
      Object.assign(NotificationMock, { permission: 'granted' });
      return Promise.resolve('granted');
    });

    await showNotification('longBreak');

    expect(NotificationMock).toHaveBeenCalledWith('Work session complete', {
      body: 'Take a long break.',
    });
  });

  it('shows a work notification when granted', async () => {
    requestPermission.mockImplementation(() => {
      Object.assign(NotificationMock, { permission: 'granted' });
      return Promise.resolve('granted');
    });

    await showNotification('work');

    expect(NotificationMock).toHaveBeenCalledWith('Break is over', {
      body: 'Time to focus.',
    });
  });

  it('does not show a notification when permission is denied', async () => {
    requestPermission.mockImplementation(() => {
      Object.assign(NotificationMock, { permission: 'denied' });
      return Promise.resolve('denied');
    });

    await showNotification('work');

    expect(requestPermission).toHaveBeenCalled();
    expect(NotificationMock).not.toHaveBeenCalled();
  });

  it('shows a notification when permission is already granted', async () => {
    Object.assign(NotificationMock, { permission: 'granted' });

    await showNotification('work');

    expect(requestPermission).not.toHaveBeenCalled();
    expect(NotificationMock).toHaveBeenCalledWith('Break is over', {
      body: 'Time to focus.',
    });
  });
});
