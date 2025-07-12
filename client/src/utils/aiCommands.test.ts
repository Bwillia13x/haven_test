import { executeAICommand } from './aiCommands';

describe('executeAICommand', () => {
  it('should create a grid when given a grid command', () => {
    const mockGet = jest.fn(() => ({
      addNode: jest.fn(),
      addConnector: jest.fn(),
      addNotification: jest.fn(),
      nodes: [],
      connectors: [],
      saveToHistory: jest.fn(),
      selectNodes: jest.fn(),
      deleteNodes: jest.fn(),
      selectedNodes: [],
      // ...add other required mock methods as needed
    }));
    executeAICommand('create grid width 3 height 3 depth 1', mockGet);
    // You can add more specific assertions if you mock addNode/addConnector
    expect(mockGet().addNode).toBeCalled();
  });

  it('should notify on unknown command', () => {
    const mockGet = jest.fn(() => ({
      addNotification: jest.fn(),
      saveToHistory: jest.fn(),
      nodes: [],
      connectors: [],
      selectedNodes: [],
    }));
    executeAICommand('foobar', mockGet);
    expect(mockGet().addNotification).toBeCalledWith('Unknown command', 'error');
  });
}); 