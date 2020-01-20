import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Node, Link } from '../../types';
import * as go from 'gojs';
import { DataBindingService } from '../../services';
import { Subscription } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { debounceTime } from 'rxjs/operators';
import { DataSyncService } from 'gojs-angular';
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
    // this.dbService.currentStore = 'nodes';
    // await this.dbService.clear();
    // this.dbService.currentStore = 'links';
    // await this.dbService.clear();
    await this.updateGraph();
    this.subscription.add(this.service.updateGraph.pipe(debounceTime(200)).subscribe(async _ => {
      await this.updateGraph();
    }));
  }


  async updateGraph() {
    await this.buildNodes();
    await this.buildLinks();
    this.diagram.clear();
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
      "animationManager.initialAnimationStyle": go.AnimationManager.None,
      layout: $(go.TreeLayout,
        {})
    });
    dia.nodeTemplate =
      $(go.Node, 'Auto',
        {

        },
        $(go.Shape, 'RoundedRectangle', { stroke: "#fff", desiredSize: new go.Size(100, 100) },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, {
          margin: 8, font: "bold 11px sans-serif", stroke: '#fff', wrap: go.TextBlock.WrapFit,
          textAlign: "center",
        },
          new go.Binding('text', 'title'))
      );

    dia.linkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          corner: 10,
          curve: go.Link.Bezier
        },
        $(go.Shape, { strokeWidth: 3 }),
        $(go.Shape, { toArrow: "Standard" })
      );
    dia.addDiagramListener("ObjectDoubleClicked", (e) => {
      const part = e.subject.part;
      const node: Node = part.data;
      this.service.nodeClicked(node);
    });

    dia.addDiagramListener("ObjectSingleClicked", (e) => {
      const part = e.subject.part;
      const node: Node = part.data;
      this.service.displayNodeData.emit(node);
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
