import { Injectable, EventEmitter } from '@angular/core';
import { Node, NodeType } from '../types';
import * as uuid from 'uuid';
import { MatDialog } from '@angular/material';
import { DataInputComponent, DataConditionComponent } from '../dialogs';
import { debounceTime } from 'rxjs/operators';
import { DataOutputComponent } from '../dialogs/data-output/data-output.component';

@Injectable({
  providedIn: 'root'
})
export class DataBindingService {

  public addNode: EventEmitter<Node> = new EventEmitter();
  public updateGraph: EventEmitter<boolean> = new EventEmitter();

  public displayNodeData: EventEmitter<Node> = new EventEmitter();

  constructor(public dialog: MatDialog) { }

  generateNode(title: string, color: string, type: NodeType): Node {
    return ({ key: uuid.v4(), color, title, type });
  }

  nodeClicked(node: Node) {
    switch (node.type) {
      case NodeType.INPUT:
        const inputDialogRef = this.dialog.open(DataInputComponent, {
          width: '450px',
          data: { node, service: this }
        });
        inputDialogRef.afterClosed().pipe(debounceTime(0)).subscribe(rs => {
          if (rs) {
            this.displayNodeData.emit(node);
            this.updateGraph.emit(true);
          }
        });
        break;
      case NodeType.CONDITION:
        const conditionDialogRef = this.dialog.open(DataConditionComponent, {
          width: '450px',
          data: { node, service: this }
        });
        conditionDialogRef.afterClosed().subscribe(rs => {
          if (rs) {
            this.displayNodeData.emit(node);
            this.updateGraph.emit(true);
          }
        })
        break;
      case NodeType.OUTPUT:
        const outputDialogRef = this.dialog.open(DataOutputComponent, {
          width: '450px',
          data: { node, service: this }
        });
        outputDialogRef.afterClosed().subscribe(rs => {
          if (rs) {
            this.displayNodeData.emit(node);
            this.updateGraph.emit(true);
          }
        })
        break;
    }
  }
}
