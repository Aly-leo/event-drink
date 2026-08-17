import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DepotInscription } from './features/depot/depot-inscription/depot-inscription';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,DepotInscription],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('event-drink');
}
