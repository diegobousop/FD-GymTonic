jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

describe('punto de entrada de la aplicación', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renderiza el componente App y registra el service worker', () => {
    const registerMock = jest.fn();

    jest.doMock('../registerServiceWorker', () => registerMock);
    jest.doMock('../modules/app', () => {
      const MockApp = () => null;
      return { __esModule: true, App: MockApp };
    });

    const { render } = require('react-dom');

    jest.isolateModules(() => {
      require('../index');
    });

    expect(render).toHaveBeenCalledTimes(1);
    const [appElement] = render.mock.calls[0];
    expect(typeof appElement.type).toBe('function');
    expect(registerMock).toHaveBeenCalledTimes(1);
  });
});

