import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
  operators: Operator[] = [{
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
  }];
  constructor(public dialogRef: MatDialogRef<DataConditionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNode, private dbService: NgxIndexedDBService, private formBuilder: FormBuilder) {

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

  close() {
    this.dialogRef.close();
  }

  async inputChange(inputKey: string) {
    this.dbService.currentStore = 'inputs';
    const inputDB: InputDB = await this.dbService.getByIndex("nodeId", inputKey);
    this.columns = inputDB.fields;
  }

  async saveCondition() {
    this.dbService.currentStore = 'conditions';
    await this.dbService.update<ConditionDB>({ id: `c_${this.data.node.id}`, conditionId: this.data.node.id, ...this.conditionForm.value });
    this.dbService.currentStore = 'links';
    await this.dbService.update<Link>({ id: `l_c_${this.data.node.id}`, from: this.data.node.id, to: `c_${this.data.node.id}` });
    this.close();
  }

  async populateCondition() {
    this.dbService.currentStore = 'conditions';
    const conditon: ConditionDB = await this.dbService.getByIndex('conditionId', this.data.node.id);
    if (conditon) {
      await this.inputChange(conditon.nodeId);
      this.conditionForm.patchValue({ ...conditon });

    }
  }
}
