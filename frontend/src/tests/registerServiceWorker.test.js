/**
 * @jest-environment jsdom
 */

describe('registerServiceWorker', () => {
  const originalEnv = process.env;
  const originalLocation = globalThis.location;
  const originalAddEventListener = globalThis.addEventListener;
  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NODE_ENV: 'production', PUBLIC_URL: '/app' };
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    globalThis.addEventListener = originalAddEventListener;
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const setupLocation = (overrides = {}) => {
    const base = {
      href: 'https://example.com/',
      origin: 'https://example.com',
      hostname: 'example.com',
      reload: jest.fn(),
      toString() {
        return this.href;
      },
      ...overrides,
    };

    Object.defineProperty(globalThis, 'location', {
      value: base,
      configurable: true,
      writable: true,
    });

    return base;
  };

  const mockNavigatorServiceWorker = (overrides = {}) => {
    const defaultSW = {
      register: jest.fn(),
      controller: {},
      ready: Promise.resolve({
        unregister: jest.fn().mockResolvedValue(undefined),
      }),
      ...overrides,
    };

    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      value: defaultSW,
      configurable: true,
    });

    return defaultSW;
  };

  it('registra service worker en producción en entornos no localhost', async () => {
    const location = setupLocation();
    const loadListeners = new Map();

    globalThis.addEventListener = jest.fn((event, cb) => {
      loadListeners.set(event, cb);
    });

    const installingWorker = {
      state: 'installed',
      onstatechange: null,
    };

    const registration = {
      installing: installingWorker,
      onupdatefound: null,
    };

    const registerMock = jest.fn().mockResolvedValue(registration);
    mockNavigatorServiceWorker({ register: registerMock, controller: {} });

    const { default: register } = await import('../registerServiceWorker');

    register();

    expect(globalThis.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));

    await loadListeners.get('load')();

    expect(registerMock).toHaveBeenCalledWith(`${process.env.PUBLIC_URL}/service-worker.js`);

    registration.onupdatefound();
    installingWorker.onstatechange();

    expect(console.log).toHaveBeenCalledWith('New content is available; please refresh.');
    expect(location.reload).not.toHaveBeenCalled();
  });

  it('valida service worker existente cuando se ejecuta en localhost y lo desregistra cuando falta', async () => {
    jest.useFakeTimers();

    setupLocation({ hostname: 'localhost' });
    const loadListeners = new Map();
    globalThis.addEventListener = jest.fn((event, cb) => {
      loadListeners.set(event, cb);
    });

    const unregisterMock = jest.fn().mockResolvedValue(undefined);
    const readyPromise = Promise.resolve({ unregister: unregisterMock });

    mockNavigatorServiceWorker({
      register: jest.fn().mockResolvedValue({
        installing: { onstatechange: null, state: 'installed' },
        onupdatefound: null,
      }),
      controller: {},
      ready: readyPromise,
    });

    globalThis.fetch = jest.fn().mockResolvedValue({
      status: 404,
      headers: {
        get: () => 'text/html',
      },
    });

    const location = globalThis.location;

    const { default: register, unregister } = await import('../registerServiceWorker');

    register();

    await loadListeners.get('load')();
    await Promise.resolve();
    await Promise.resolve();

    expect(unregisterMock).toHaveBeenCalled();
    expect(location.reload).toHaveBeenCalled();

    await unregister();

    expect(unregisterMock).toHaveBeenCalledTimes(2);
  });
});

