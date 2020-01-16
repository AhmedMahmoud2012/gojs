import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DialogNode, Node, NodeType, Operator } from '../../types';
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
    if (!this.dbService.currentStore) {
      this.dbService.currentStore = 'nodes';
    }
    this.conditionForm = this.formBuilder.group({
      input: ['', Validators.required],
      column: ['', Validators.required],
      operator: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.dbService.getAll<Node>().then(nodes => {
      this.nodes = nodes.filter(node => node.type === NodeType.INPUT);
    });
  }

  close() {
    this.dialogRef.close();
  }

  inputChange(inputKey: string) {
    this.dbService.getByKey<Node>(inputKey).then((node: Node) => {
      //this.columns
    })
  }
}
