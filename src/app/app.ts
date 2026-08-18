import { Component, signal } from '@angular/core';
import { Calculateur } from "./features/client/pages/calculateur/calculateur";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [ Calculateur]
})
export class App {
  protected readonly title = signal('event-drink');
}
