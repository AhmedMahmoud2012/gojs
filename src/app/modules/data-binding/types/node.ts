import { DataBindingService } from '../services';

export interface Node {
    key: string;
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

export interface InputDB {
    id: string;
    data: any[];
    nodeId: string;
    fields: string[];
}

export interface ConditionDB {
    id: string;
    condition: string;
    value: string;
    nodeId: string;
    operator: string;
    column: string;
}

export interface OutputDB {
    id: string;
    conditionId: string;
}

export interface Link {
    id: string;
    from: string;
    to: string;
}