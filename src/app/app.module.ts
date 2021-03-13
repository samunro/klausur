import { NgModule, Inject } from "@angular/core";
import { BrowserModule, Meta, Title } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { StudentPointsComponent } from "./student-points.component";
import { HelloComponent } from "./hello.component";
import { DOCUMENT } from "@angular/common";
import { NgxBootstrapIconsModule, printer, pencilSquare, fileEarmarkArrowDown, fileEarmarkArrowUp } from "ngx-bootstrap-icons";

const icons = { printer, pencilSquare, fileEarmarkArrowDown, fileEarmarkArrowUp };

@NgModule({
  imports: [BrowserModule, FormsModule, NgxBootstrapIconsModule.pick(icons)],
  declarations: [AppComponent, HelloComponent, StudentPointsComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(meta: Meta, title: Title, @Inject(DOCUMENT) document: Document) {
    meta.updateTag({ charset: "utf-8" }, "charset=utf-8");
    title.setTitle("Klausur");
    document.documentElement.lang = "de";
  }
}
