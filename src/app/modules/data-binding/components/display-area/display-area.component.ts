import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataBindingService } from '../../services';
import { Subscription } from 'rxjs';
import { Node, NodeType, InputDB, ConditionDB, OutputDB } from '../../types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MatPaginator, MatTableDataSource, MatSnackBar } from '@angular/material';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-display-area',
  templateUrl: './display-area.component.html',
  styleUrls: ['./display-area.component.css']
})
export class DisplayAreaComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription();
  dataSource: any;
  displayedColumns: string[] = [];
  node: Node;
  data: any[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private service: DataBindingService, private dbService: NgxIndexedDBService, private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.subscription.add(this.service.displayNodeData.subscribe(async (node: Node) => {
      this.node = null;
      switch (node.type) {
        case NodeType.INPUT:
          this.dbService.currentStore = 'inputs';
          const input: InputDB = await this.dbService.getByIndex('nodeId', node.key);
          if (input) {
            this.node = node;
            this.displayedColumns = input.fields;
            this.data = input.data;
            this.dataSource = new MatTableDataSource<any>(this.data);
            this.dataSource.paginator = this.paginator;
            this.dataSource.paginator = this.paginator;
            this.snackBar.open(`Data from ${node.title} file`, 'Ok', {
              duration: 2000,
            });
          }
          break;
        case NodeType.CONDITION:
          this.node = node;
          await this.applyCondition(this.node.key);
          break;
        case NodeType.OUTPUT:
          this.dbService.currentStore = 'output';
          const output: OutputDB = await this.dbService.getByKey(`o_${node.key}`);
          if (output) {
            this.node = node;
            await this.applyCondition(output.conditionId);
          }
          break;
      }

    }));
  }

  async applyCondition(conditionId: string) {
    this.dbService.currentStore = 'conditions';
    const condition: ConditionDB = await this.dbService.getByIndex('conditionId', conditionId);
    if (condition) {
      this.dbService.currentStore = 'inputs';
      const input: InputDB = await this.dbService.getByIndex('nodeId', condition.nodeId);
      if (input) {
        this.displayedColumns = input.fields;
        this.data = input.data.filter(item => {
          if (isNaN(+condition.value)) {
            return eval(`'${item[condition.column]}'${condition.operator}'${condition.value}'`);
          } else {
            return eval(`${item[condition.column]}${condition.operator}${condition.value}`);
          }
        })
        this.dataSource = new MatTableDataSource<any>(this.data);
        this.dataSource.paginator = this.paginator;
        this.snackBar.open(`Condition ${this.node.title} is applied Successfully `, 'Ok', {
          duration: 2000,
        });
      }
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  exportAsCSV() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      title: `output ${+new Date()}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.data);
  }
}
