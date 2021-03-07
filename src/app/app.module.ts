import { NgModule, Inject } from '@angular/core';
import { BrowserModule, Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { StudentPointsComponent } from './student-points.component';
import { HelloComponent } from './hello.component';
import { DOCUMENT } from "@angular/common";

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, HelloComponent, StudentPointsComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { 
  constructor(meta: Meta, title: Title, @Inject(DOCUMENT) document: Document){
    meta.updateTag({charset: "utf-8"}, "name=undefined");
    title.setTitle("Klausur");
    document.documentElement.lang = "de";
  }
}
