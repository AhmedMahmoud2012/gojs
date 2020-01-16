import { DataBindingService } from '../services';

export interface Node {
    id: string;
    title: string;
    color: string;
    type: NodeType;
}

export enum NodeType {
    INPUT,
    CONDITION,
    OUTPUT
}

export interface DialogNode {
    node: Node,
    service: DataBindingService
}

export interface Operator {
    text: string;
    value: string;
}