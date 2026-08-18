import { Component, signal } from '@angular/core';
import { ListeDepots } from "./features/client/pages/liste-depots/liste-depots";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [ListeDepots]
})
export class App {
  protected readonly title = signal('event-drink');
}
