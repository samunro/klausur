import { NgModule, Inject, LOCALE_ID } from "@angular/core";
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { BrowserModule, Meta, Title } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { StudentPointsComponent } from "./student-points.component";
import { HelloComponent } from "./hello.component";
import { DOCUMENT, registerLocaleData } from "@angular/common";
import {
  NgxBootstrapIconsModule,
  printer,
  pencilSquare,
  fileEarmarkArrowDown,
  fileEarmarkArrowUp
} from "ngx-bootstrap-icons";

registerLocaleData(localeDe, 'de-DE', localeDeExtra)

const icons = {
  printer,
  pencilSquare,
  fileEarmarkArrowDown,
  fileEarmarkArrowUp
};

@NgModule({
  imports: [BrowserModule, FormsModule, NgxBootstrapIconsModule.pick(icons)],
  declarations: [AppComponent, HelloComponent, StudentPointsComponent],
  bootstrap: [AppComponent]  ,
  providers: [{ provide: LOCALE_ID, useValue: "de-DE" }]
})
export class AppModule {
  constructor(meta: Meta, title: Title, @Inject(DOCUMENT) document: Document) {
    meta.updateTag({ charset: "utf-8" }, "charset=utf-8");
    title.setTitle("Klausur");
    document.documentElement.lang = "de";
  }
}
