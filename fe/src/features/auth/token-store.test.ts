import { tokenStore } from './token-store';

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it('holds the access token in memory', () => {
    tokenStore.setAccess('access-1');
    expect(tokenStore.getAccess()).toBe('access-1');
  });

  it('persists the refresh token', () => {
    tokenStore.setRefresh('refresh-1');
    expect(tokenStore.getRefresh()).toBe('refresh-1');
  });

  it('sets a pair together', () => {
    tokenStore.setPair('access-2', 'refresh-2');
    expect(tokenStore.getAccess()).toBe('access-2');
    expect(tokenStore.getRefresh()).toBe('refresh-2');
  });

  it('clears both tokens', () => {
    tokenStore.setPair('access-3', 'refresh-3');
    tokenStore.clear();
    expect(tokenStore.getAccess()).toBeNull();
    expect(tokenStore.getRefresh()).toBeNull();
  });
});
