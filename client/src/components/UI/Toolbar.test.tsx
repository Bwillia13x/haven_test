import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from './Toolbar';
import { useAetherStore } from '../../stores/useAetherStore';

// Mock the store
const mockUseAetherStore = jest.fn();
jest.mock('../../stores/useAetherStore', () => ({
  useAetherStore: mockUseAetherStore
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MousePointer: () => <div data-testid="mouse-pointer-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Link: () => <div data-testid="link-icon" />,
  Grid3X3: () => <div data-testid="grid-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Undo: () => <div data-testid="undo-icon" />,
  Redo: () => <div data-testid="redo-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Layers: () => <div data-testid="layers-icon" />,
  Move: () => <div data-testid="move-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Sphere: () => <div data-testid="sphere-icon" />,
  Box: () => <div data-testid="box-icon" />,
  Cylinder: () => <div data-testid="cylinder-icon" />,
  Triangle: () => <div data-testid="triangle-icon" />,
  Square: () => <div data-testid="square-icon" />,
  Circle: () => <div data-testid="circle-icon" />
}));

describe('Toolbar', () => {
  const mockStore = {
    connectionMode: false,
    toggleConnectionMode: jest.fn(),
    movementMode: false,
    toggleMovementMode: jest.fn(),
    showGrid: true,
    toggleGrid: jest.fn(),
    snapToGrid: false,
    toggleSnap: jest.fn(),
    selectedNodes: [],
    deleteNodes: jest.fn(),
    duplicateNodes: jest.fn(),
    selectAll: jest.fn(),
    addNode: jest.fn(),
    addAdvancedNode: jest.fn().mockReturnValue('node_123'),
    undo: jest.fn(),
    redo: jest.fn(),
    history: [{}],
    historyIndex: 0,
    exportProject: jest.fn(),
    addNotification: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAetherStore.mockReturnValue(mockStore);
  });

  it('renders all toolbar buttons', () => {
    render(<Toolbar />);

    // Check for main action buttons
    expect(screen.getByTestId('mouse-pointer-icon')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
    expect(screen.getByTestId('move-icon')).toBeInTheDocument();
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
    expect(screen.getByTestId('undo-icon')).toBeInTheDocument();
    expect(screen.getByTestId('redo-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  it('toggles connection mode when connection button is clicked', () => {
    render(<Toolbar />);
    
    const connectionButton = screen.getByTestId('link-icon').closest('button');
    fireEvent.click(connectionButton!);
    
    expect(mockStore.toggleConnectionMode).toHaveBeenCalled();
  });

  it('toggles movement mode when movement button is clicked', () => {
    render(<Toolbar />);
    
    const movementButton = screen.getByTestId('move-icon').closest('button');
    fireEvent.click(movementButton!);
    
    expect(mockStore.toggleMovementMode).toHaveBeenCalled();
  });

  it('toggles grid visibility when grid button is clicked', () => {
    render(<Toolbar />);
    
    const gridButton = screen.getByTestId('eye-icon').closest('button');
    fireEvent.click(gridButton!);
    
    expect(mockStore.toggleGrid).toHaveBeenCalled();
  });

  it('toggles snap to grid when snap button is clicked', () => {
    render(<Toolbar />);
    
    const snapButton = screen.getByTestId('grid-icon').closest('button');
    fireEvent.click(snapButton!);
    
    expect(mockStore.toggleSnap).toHaveBeenCalled();
  });

  it('calls undo when undo button is clicked', () => {
    render(<Toolbar />);
    
    const undoButton = screen.getByTestId('undo-icon').closest('button');
    fireEvent.click(undoButton!);
    
    expect(mockStore.undo).toHaveBeenCalled();
  });

  it('calls redo when redo button is clicked', () => {
    const storeWithRedoAvailable = {
      ...mockStore,
      historyIndex: 0,
      history: [{}, {}] // More than one item in history
    };
    mockUseAetherStore.mockReturnValue(storeWithRedoAvailable);
    
    render(<Toolbar />);
    
    const redoButton = screen.getByTestId('redo-icon').closest('button');
    fireEvent.click(redoButton!);
    
    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('disables undo button when at beginning of history', () => {
    const storeWithNoUndo = {
      ...mockStore,
      historyIndex: 0,
      history: [{}]
    };
    mockUseAetherStore.mockReturnValue(storeWithNoUndo);
    
    render(<Toolbar />);
    
    const undoButton = screen.getByTestId('undo-icon').closest('button');
    expect(undoButton).toBeDisabled();
  });

  it('disables redo button when at end of history', () => {
    const storeWithNoRedo = {
      ...mockStore,
      historyIndex: 0,
      history: [{}] // Only one item, so no redo available
    };
    mockUseAetherStore.mockReturnValue(storeWithNoRedo);
    
    render(<Toolbar />);
    
    const redoButton = screen.getByTestId('redo-icon').closest('button');
    expect(redoButton).toBeDisabled();
  });

  it('calls selectAll when select all button is clicked', () => {
    render(<Toolbar />);
    
    const selectAllButton = screen.getByTestId('layers-icon').closest('button');
    fireEvent.click(selectAllButton!);
    
    expect(mockStore.selectAll).toHaveBeenCalled();
  });

  it('disables duplicate button when no nodes are selected', () => {
    render(<Toolbar />);
    
    const duplicateButton = screen.getByTestId('copy-icon').closest('button');
    expect(duplicateButton).toBeDisabled();
  });

  it('enables duplicate button when nodes are selected', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node1', 'node2']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<Toolbar />);
    
    const duplicateButton = screen.getByTestId('copy-icon').closest('button');
    expect(duplicateButton).not.toBeDisabled();
  });

  it('calls duplicateNodes when duplicate button is clicked with selection', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node1', 'node2']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<Toolbar />);
    
    const duplicateButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(duplicateButton!);
    
    expect(mockStore.duplicateNodes).toHaveBeenCalledWith(['node1', 'node2']);
  });

  it('disables delete button when no nodes are selected', () => {
    render(<Toolbar />);
    
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    expect(deleteButton).toBeDisabled();
  });

  it('enables delete button when nodes are selected', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node1']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<Toolbar />);
    
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    expect(deleteButton).not.toBeDisabled();
  });

  it('calls deleteNodes when delete button is clicked with selection', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node1', 'node2']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<Toolbar />);
    
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    fireEvent.click(deleteButton!);
    
    expect(mockStore.deleteNodes).toHaveBeenCalledWith(['node1', 'node2']);
    expect(mockStore.addNotification).toHaveBeenCalledWith('Deleted 2 node(s)', 'success');
  });

  it('calls exportProject when export button is clicked', () => {
    render(<Toolbar />);
    
    const exportButton = screen.getByTestId('download-icon').closest('button');
    fireEvent.click(exportButton!);
    
    expect(mockStore.exportProject).toHaveBeenCalled();
  });

  it('shows correct grid icon based on grid visibility', () => {
    // Test with grid visible
    render(<Toolbar />);
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument();
  });

  it('shows eye-off icon when grid is hidden', () => {
    const storeWithHiddenGrid = {
      ...mockStore,
      showGrid: false
    };
    mockUseAetherStore.mockReturnValue(storeWithHiddenGrid);
    
    render(<Toolbar />);
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument();
  });

  it('disables connection mode when movement mode is active', () => {
    const storeWithMovementMode = {
      ...mockStore,
      movementMode: true
    };
    mockUseAetherStore.mockReturnValue(storeWithMovementMode);
    
    render(<Toolbar />);
    
    const connectionButton = screen.getByTestId('link-icon').closest('button');
    expect(connectionButton).toBeDisabled();
  });
});
