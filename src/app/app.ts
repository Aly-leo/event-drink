import { Component, signal } from '@angular/core';
import { ListeDepots } from "./features/client/pages/liste-depots/liste-depots";

@Component({
  selector: 'app-root',
  imports: [ListeDepots],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('event-drink');
}
