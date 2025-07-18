import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PropertyPanel } from './PropertyPanel';
import { useAetherStore } from '../../stores/useAetherStore';

// Mock the store
const mockUseAetherStore = jest.fn();
jest.mock('../../stores/useAetherStore', () => ({
  useAetherStore: mockUseAetherStore
}));

describe('PropertyPanel', () => {
  const mockNode = {
    id: 'node_123',
    position: [1.5, 2.3, -0.8] as [number, number, number],
    scale: 1.2,
    material: 'default',
    geometry: 'sphere' as const,
    created: Date.now(),
    properties: {
      position: [1.5, 2.3, -0.8] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1.2, 1.2, 1.2] as [number, number, number],
      radius: 0.15,
      height: 0.3,
      width: 0.3,
      depth: 0.3,
      segments: 16,
      rings: 8,
      visible: true,
      castShadow: true,
      receiveShadow: true,
      wireframe: false
    }
  };

  const mockMaterials = {
    default: { color: '#ffffff', opacity: 1, metalness: 0, roughness: 0.5 },
    metallic: { color: '#888888', opacity: 1, metalness: 1, roughness: 0.1 },
    glass: { color: '#cccccc', opacity: 0.3, metalness: 0, roughness: 0 }
  };

  const mockStore = {
    selectedNodes: [],
    nodes: [mockNode],
    setNodePosition: jest.fn(),
    setNodeMaterial: jest.fn(),
    setNodeScale: jest.fn(),
    materials: mockMaterials
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAetherStore.mockReturnValue(mockStore);
  });

  it('renders "No nodes selected" when no nodes are selected', () => {
    render(<PropertyPanel />);
    
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('No nodes selected')).toBeInTheDocument();
  });

  it('renders node properties when a node is selected', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.queryByText('No nodes selected')).not.toBeInTheDocument();
    
    // Check position inputs
    expect(screen.getByDisplayValue('1.50')).toBeInTheDocument(); // X position
    expect(screen.getByDisplayValue('2.30')).toBeInTheDocument(); // Y position
    expect(screen.getByDisplayValue('-0.80')).toBeInTheDocument(); // Z position
    
    // Check labels
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Node Info')).toBeInTheDocument();
  });

  it('shows multiple selection count in title', () => {
    const storeWithMultipleSelection = {
      ...mockStore,
      selectedNodes: ['node_123', 'node_456']
    };
    mockUseAetherStore.mockReturnValue(storeWithMultipleSelection);
    
    render(<PropertyPanel />);
    
    expect(screen.getByText('Properties (2 selected)')).toBeInTheDocument();
  });

  it('calls setNodePosition when X position is changed', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    const xInput = screen.getByDisplayValue('1.50');
    fireEvent.change(xInput, { target: { value: '3.5' } });
    
    expect(mockStore.setNodePosition).toHaveBeenCalledWith('node_123', [3.5, 2.3, -0.8]);
  });

  it('calls setNodePosition when Y position is changed', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    const yInput = screen.getByDisplayValue('2.30');
    fireEvent.change(yInput, { target: { value: '-1.2' } });
    
    expect(mockStore.setNodePosition).toHaveBeenCalledWith('node_123', [1.5, -1.2, -0.8]);
  });

  it('calls setNodePosition when Z position is changed', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    const zInput = screen.getByDisplayValue('-0.80');
    fireEvent.change(zInput, { target: { value: '4.7' } });
    
    expect(mockStore.setNodePosition).toHaveBeenCalledWith('node_123', [1.5, 2.3, 4.7]);
  });

  it('does not call setNodePosition with invalid input', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    const xInput = screen.getByDisplayValue('1.50');
    fireEvent.change(xInput, { target: { value: 'invalid' } });
    
    expect(mockStore.setNodePosition).not.toHaveBeenCalled();
  });

  it('displays current scale value', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    expect(screen.getByText('1.2')).toBeInTheDocument(); // Scale value
  });

  it('displays available materials in select', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    // The material select should be present
    const materialSelect = screen.getByRole('combobox');
    expect(materialSelect).toBeInTheDocument();
  });

  it('displays node info correctly', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    expect(screen.getByText('Node Info')).toBeInTheDocument();
    expect(screen.getByText(/ID: 123/)).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('returns null when selected node is not found', () => {
    const storeWithInvalidSelection = {
      ...mockStore,
      selectedNodes: ['nonexistent_node'],
      nodes: [mockNode]
    };
    mockUseAetherStore.mockReturnValue(storeWithInvalidSelection);
    
    const { container } = render(<PropertyPanel />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles node without scale property', () => {
    const nodeWithoutScale = {
      ...mockNode,
      scale: undefined
    };
    
    const storeWithNodeWithoutScale = {
      ...mockStore,
      selectedNodes: ['node_123'],
      nodes: [nodeWithoutScale]
    };
    mockUseAetherStore.mockReturnValue(storeWithNodeWithoutScale);
    
    render(<PropertyPanel />);
    
    // Should default to scale of 1
    expect(screen.getByText('1.0')).toBeInTheDocument();
  });

  it('handles node without created timestamp', () => {
    const nodeWithoutCreated = {
      ...mockNode,
      created: undefined
    };
    
    const storeWithNodeWithoutCreated = {
      ...mockStore,
      selectedNodes: ['node_123'],
      nodes: [nodeWithoutCreated]
    };
    mockUseAetherStore.mockReturnValue(storeWithNodeWithoutCreated);
    
    render(<PropertyPanel />);
    
    // Should handle missing timestamp gracefully
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('displays position values with correct precision', () => {
    const nodeWithPrecisePosition = {
      ...mockNode,
      position: [1.23456, -2.98765, 0.11111] as [number, number, number]
    };
    
    const storeWithPreciseNode = {
      ...mockStore,
      selectedNodes: ['node_123'],
      nodes: [nodeWithPrecisePosition]
    };
    mockUseAetherStore.mockReturnValue(storeWithPreciseNode);
    
    render(<PropertyPanel />);
    
    // Should display with 2 decimal places
    expect(screen.getByDisplayValue('1.23')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-2.99')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.11')).toBeInTheDocument();
  });

  it('has correct input step values', () => {
    const storeWithSelection = {
      ...mockStore,
      selectedNodes: ['node_123']
    };
    mockUseAetherStore.mockReturnValue(storeWithSelection);
    
    render(<PropertyPanel />);
    
    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('step', '0.1');
    });
  });
});
