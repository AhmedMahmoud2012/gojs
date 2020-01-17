import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataBindingService } from '../../services';
import { NodeType, Node } from '../../types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css']
})
export class LeftSideBarComponent implements OnInit, OnDestroy {


  subscription: Subscription = new Subscription();
  constructor(private service: DataBindingService, private dbService: NgxIndexedDBService) {

    this.subscription.add(this.service.addNode.subscribe(async (node: Node) => {
      this.dbService.currentStore = 'nodes';
      await this.dbService.add<Node>(node);
      this.service.updateGraph.emit(true);
    }));
  }

  ngOnInit() {
  }

  addInputNode() {
    this.service.addNode.emit(this.service.generateNode("Empty Input Node", "#2ecc71", NodeType.INPUT));
  }

  addConditionNode() {
    this.service.addNode.emit(this.service.generateNode("Condition Node", "#3498db", NodeType.CONDITION));
  }

  addOutputNode() {
    this.service.addNode.emit(this.service.generateNode("Output Node", "#c0392b", NodeType.OUTPUT));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
