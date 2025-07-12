import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useAetherStore } from '../../stores/useAetherStore';

jest.mock('../../stores/useAetherStore');

describe('Toolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and triggers addNode', () => {
    const addNode = jest.fn();
    (useAetherStore as any).mockReturnValue({
      addNode,
      deleteNodes: jest.fn(),
      selectedNodes: [],
      toggleConnectionMode: jest.fn(),
      connectionMode: false,
      undo: jest.fn(),
      redo: jest.fn(),
      history: [],
      historyIndex: 0,
      showGrid: true,
      toggleGrid: jest.fn(),
      snapToGrid: false,
      toggleSnap: jest.fn(),
      multiSelect: false,
      setMultiSelect: jest.fn(),
      exportProject: jest.fn(),
    });
    const { getByTitle } = render(<Toolbar />);
    fireEvent.click(getByTitle('Add Node'));
    expect(addNode).toBeCalled();
  });
}); 