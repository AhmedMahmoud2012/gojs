import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Node } from '../../types';
import * as go from 'gojs';
import { DataBindingService } from '../../services';
import { Subscription } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
@Component({
  selector: 'app-main-area',
  templateUrl: './main-area.component.html',
  styleUrls: ['./main-area.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainAreaComponent implements OnInit, OnDestroy {
  public nodes: Array<Node> = [];
  public links: Array<go.ObjectData> = [];
  subscription: Subscription = new Subscription();
  public init = this.initDiagram.bind(this);
  constructor(private service: DataBindingService, private dbService: NgxIndexedDBService) {
    this.dbService.currentStore = 'nodes';
    //this.dbService.clear();
  }
  ngOnInit(): void {
    this.updateGraph();
    this.subscription.add(this.service.updateGraph.subscribe(_ => {
      this.updateGraph();
    }));
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateGraph() {
    this.buildNodes();
  }

  buildNodes() {
    this.nodes = [];
    this.dbService.getAll<Node>().then((nodes: Node[]) => {
      nodes.sort((a, b) => a.type - b.type).forEach(node => {
        this.nodes.push(node);
      })
    });
  }
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel,
        {
          linkKeyProperty: 'id'
        }
      )
    });
    dia.nodeTemplate =
      $(go.Node, 'Auto',
        {
          toLinkable: true, fromLinkable: true
        },
        $(go.Shape, 'Rectangle', { stroke: "#000", desiredSize: new go.Size(80, 80) },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, { margin: 8 },
          new go.Binding('text', 'title'))
      );
    dia.addDiagramListener("ObjectSingleClicked", (e) => {
      const part = e.subject.part;
      const node: Node = part.data;
      this.service.nodeClicked(node);
    });
    return dia;
  }




}
