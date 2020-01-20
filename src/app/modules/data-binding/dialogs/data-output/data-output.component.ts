import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DialogNode, NodeType, Node, OutputDB, Link } from '../../types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-output',
  templateUrl: './data-output.component.html',
  styleUrls: ['./data-output.component.css']
})
export class DataOutputComponent implements OnInit {
  outputForm: FormGroup;
  nodes: Node[] = [];

  constructor(public dialogRef: MatDialogRef<DataOutputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNode, private dbService: NgxIndexedDBService, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.outputForm = this.formBuilder.group({ conditionId: ['', Validators.required] });
  }

  async ngOnInit() {
    this.dbService.currentStore = 'nodes';
    const nodes: Node[] = await this.dbService.getAll<Node>();
    this.nodes = nodes.filter(node => node.type === NodeType.CONDITION && node.title !== 'Condition Node');
    await this.populateOutput();
  }

  close(rs: boolean = false) {
    this.dialogRef.close(rs);
  }

  deleteNode() {
    this.dbService.currentStore = 'nodes';
    this.dbService.delete(this.data.node.key).then(_ => {
      this.data.service.updateGraph.emit(true);
      this.close(true);
    })
  }

  async saveOutput() {
    this.dbService.currentStore = 'output';
    await this.dbService.update<OutputDB>({ id: `o_${this.data.node.key}`, ...this.outputForm.value });
    this.dbService.currentStore = 'links';
    await this.dbService.update<Link>({ id: `l_c_${this.data.node.key}`, to: this.data.node.key, from: this.outputForm.value.conditionId });
    this.snackBar.open('Output is saved Successfully ', 'Ok', {
      duration: 2000,
    });
    this.close(true);
  }

  async populateOutput() {
    this.dbService.currentStore = 'output';
    const output: OutputDB = await this.dbService.getByKey(`o_${this.data.node.key}`);
    if (output) {
      this.outputForm.patchValue({ ...output });
    }
  }
}
