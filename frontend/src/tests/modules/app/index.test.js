beforeEach(() => {
  jest.resetModules();
});

describe('modules/app index', () => {
  it('re-exporta componente App', () => {
    jest.isolateModules(() => {
      jest.doMock('../../../modules/app/components/App', () => {
        const MockApp = () => null;
        return { __esModule: true, default: MockApp };
      });

      const appModule = require('../../../modules/app');
      const AppComponent = require('../../../modules/app/components/App').default;

      expect(appModule.App).toBe(AppComponent);
    });
  });
});

