import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogNode } from '../../types';
import * as Papa from 'papaparse';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.css']
})
export class DataInputComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNode, private dbService: NgxIndexedDBService) {
    this.dbService.currentStore = 'inputs';
  }

  ngOnInit() {
  }

  onChange(files: File[]) {
    if (files[0]) {
      Papa.parse(files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (result, file) => {
          console.log(result);
          this.dbService.update({ id: this.data.node.id, data: result.data, fields: result.meta.fields }).then(
            () => {
              this.close();
            },
            error => { }
          );
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  deleteNode() {
    this.dbService.delete(this.data.node.id).then(_ => {
      this.data.service.updateGraph.emit(true);
      this.close();
    })
  }
}
