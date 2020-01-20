import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DialogNode, Node, NodeType, Operator, InputDB, ConditionDB, Link } from '../../types';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-condition',
  templateUrl: './data-condition.component.html',
  styleUrls: ['./data-condition.component.css']
})
export class DataConditionComponent implements OnInit {

  conditionForm: FormGroup;
  nodes: Node[] = [];
  columns: string[] = [];
  alloperators: { [key: string]: Operator[] } = {
    number: [{
      text: "Equal",
      value: "=="
    }, {
      text: "Greater Than",
      value: ">"
    },
    {
      text: "Less Than",
      value: "<"
    }, {
      text: "Greater Than Or Equal",
      value: ">="
    }, {
      text: "Greater Than Or Equal",
      value: ">="
    }],
    text: [{
      text: "Equal",
      value: "=="
    }]
  };

  operators: Operator[] = [];
  options: string[] = [];
  selectedInputData: any[] = [];
  constructor(public dialogRef: MatDialogRef<DataConditionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNode, private dbService: NgxIndexedDBService, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {

    this.conditionForm = this.formBuilder.group({
      nodeId: ['', Validators.required],
      column: ['', Validators.required],
      operator: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.dbService.currentStore = 'nodes';
    const nodes: Node[] = await this.dbService.getAll<Node>();
    this.nodes = nodes.filter(node => node.type === NodeType.INPUT && node.title !== 'Empty Input Node');
    await this.populateCondition();
  }

  close(rs: boolean) {
    this.dialogRef.close(rs);
  }

  async inputChange(inputKey: string) {
    this.dbService.currentStore = 'inputs';
    const inputDB: InputDB = await this.dbService.getByIndex("nodeId", inputKey);
    this.columns = inputDB.fields;
    this.selectedInputData = inputDB.data;
  }

  columnChange(column: string) {
    this.options = [...new Set(this.selectedInputData.map(item => item[column]))];
    if (isNaN(+this.options[0])) {
      this.operators = this.alloperators['text'];
    } else {
      this.operators = this.alloperators['number'];
    }
  }

  async saveCondition() {
    this.dbService.currentStore = 'conditions';
    const condition: ConditionDB = this.conditionForm.value;
    await this.dbService.update<ConditionDB>({ id: `c_${this.data.node.key}`, conditionId: this.data.node.key, ...this.conditionForm.value });
    this.dbService.currentStore = 'links';
    await this.dbService.update<Link>({ id: `l_c_${this.data.node.key}`, to: this.data.node.key, from: this.conditionForm.value.nodeId });
    this.dbService.currentStore = 'nodes';
    await this.dbService.update<Node>({ key: this.data.node.key, color: this.data.node.color, type: this.data.node.type, title: `${condition.column} ${condition.operator} ${condition.value}` });
    this.snackBar.open('Condition is saved Successfully ', 'Ok', {
      duration: 2000,
    });
    this.close(true);
  }

  async populateCondition() {
    this.dbService.currentStore = 'conditions';
    const conditon: ConditionDB = await this.dbService.getByIndex('conditionId', this.data.node.key);
    if (conditon) {
      await this.inputChange(conditon.nodeId);
      this.columnChange(conditon.column);
      this.conditionForm.patchValue({ ...conditon });

    }
  }

  async deleteNode() {
    this.dbService.currentStore = 'nodes';
    await this.dbService.delete(this.data.node.key);
    this.dbService.currentStore = 'links';
    await this.dbService.delete(`l_c_${this.data.node.key}`);
    this.data.service.updateGraph.emit(true);
    this.close(true);
  }
}
