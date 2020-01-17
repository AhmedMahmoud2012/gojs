import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Node, Link } from '../../types';
import * as go from 'gojs';
import { DataBindingService } from '../../services';
import { Subscription } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-main-area',
  templateUrl: './main-area.component.html',
  styleUrls: ['./main-area.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainAreaComponent implements OnInit, OnDestroy {
  public nodes: Array<Node> = [];
  public links: Array<Link> = [];
  subscription: Subscription = new Subscription();
  diagram: go.Diagram;
  constructor(private service: DataBindingService, private dbService: NgxIndexedDBService) {
    this.diagram = this.init();
    this.initDiagram = this.initDiagram.bind(this);
  }
  async ngOnInit() {
    this.dbService.currentStore = 'nodes';
    await this.dbService.clear();
    await this.updateGraph();
    this.subscription.add(this.service.updateGraph.pipe(debounceTime(200)).subscribe(async _ => {
      await this.updateGraph();
    }));
  }


  async updateGraph() {
    await this.buildNodes();
    await this.buildLinks();
    this.diagram.zoomToFit();
  }

  async buildNodes() {
    this.nodes = [];
    this.dbService.currentStore = 'nodes';
    this.nodes = (await this.dbService.getAll<Node>()).sort((a, b) => a.type - b.type);
  }

  async buildLinks() {
    this.links = [];
    this.dbService.currentStore = 'links';
    this.links = await this.dbService.getAll<Link>();
  }

  public init(): go.Diagram {
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

  public initDiagram(): go.Diagram {
    return this.diagram;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
