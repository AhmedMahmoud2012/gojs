import { Component, OnInit, ViewChild } from '@angular/core';
import { DataBindingService } from '../../services';
import { Subscription } from 'rxjs';
import { Node } from '../../types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-display-area',
  templateUrl: './display-area.component.html',
  styleUrls: ['./display-area.component.css']
})
export class DisplayAreaComponent implements OnInit {
  subscription: Subscription = new Subscription();
  dataSource: any;
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(private service: DataBindingService, private dbService: NgxIndexedDBService) {
    this.dbService.currentStore = 'inputs';

  }

  ngOnInit() {
    this.subscription.add(this.service.displayNodeData.subscribe((node: Node) => {
      this.dbService.getByKey(node.id).then(result => {
        if (result) {
          this.displayedColumns = result.fields;
          this.dataSource = new MatTableDataSource<any>(result.data);
          this.dataSource.paginator = this.paginator;
        }
      });
    }));
  }

}
