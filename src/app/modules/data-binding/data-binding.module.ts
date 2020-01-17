import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftSideBarComponent, MainAreaComponent, DisplayAreaComponent } from './components';
import { SharedModule } from '../shared/shared.module';
import { DataBindingComponent } from './data-binding.component';
import { GojsAngularModule } from 'gojs-angular';
import { DataBindingService } from './services';
import { DataInputComponent, DataConditionComponent } from './dialogs';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


const dbConfig: DBConfig = {
  name: 'data-binding',
  version: 1,
  objectStoresMeta: [{
    store: 'inputs',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'data', keypath: 'data', options: { unique: false } },
      { name: 'nodeId', keypath: 'nodeId', options: { unique: false } },
      { name: 'fields', keypath: 'fields', options: { unique: false } }
    ]
  },
  {
    store: 'conditions',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'column', keypath: 'column', options: { unique: false } },
      { name: 'nodeId', keypath: 'nodeId', options: { unique: false } },
      { name: 'conditionId', keypath: 'conditionId', options: { unique: false } },
      { name: 'value', keypath: 'value', options: { unique: false } }
    ]
  },
  {
    store: 'nodes',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'title', keypath: 'title', options: { unique: false } },
      { name: 'color', keypath: 'color', options: { unique: false } },
      { name: 'type', keypath: 'type', options: { unique: false } }
    ]
  },
  {
    store: 'links',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'from', keypath: 'from', options: { unique: false } },
      { name: 'to', keypath: 'to', options: { unique: false } }
    ]
  }
  ]
};
@NgModule({
  declarations: [DataBindingComponent, LeftSideBarComponent, MainAreaComponent, DisplayAreaComponent, DataInputComponent, DataConditionComponent],
  imports: [
    SharedModule,
    CommonModule,
    GojsAngularModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    DataBindingComponent
  ],
  entryComponents: [
    DataInputComponent, DataConditionComponent
  ],
  providers: [DataBindingService]
})
export class DataBindingModule { }
