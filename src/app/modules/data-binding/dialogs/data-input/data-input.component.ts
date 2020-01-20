import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { DialogNode, InputDB, Node } from '../../types';
import * as Papa from 'papaparse';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.css']
})
export class DataInputComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNode, private dbService: NgxIndexedDBService, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
  }

  onChange(files: File[]) {
    if (files[0]) {
      Papa.parse(files[0], {
        header: true,
        skipEmptyLines: true,
        complete: async (result, file) => {
          this.dbService.currentStore = 'inputs';
          const data: any[] = [];
          result.data.forEach(item => {
            const newItem = {};
            for (let property in item) {
              newItem[property.trim()] = item[property]
            }
            data.push(newItem);
          });
          await this.dbService.update<InputDB>({ id: `i_${this.data.node.key}`, nodeId: this.data.node.key, data, fields: Object.keys(data[0]) })
          this.dbService.currentStore = 'nodes';
          await this.dbService.update<Node>({ key: this.data.node.key, color: this.data.node.color, type: this.data.node.type, title: file.name });
          this.snackBar.open('Data is imported Successfully ', 'Ok', {
            duration: 2000,
          });
          this.close(true);
        }
      });
    }
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
}
