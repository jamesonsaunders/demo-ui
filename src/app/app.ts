import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HelloWorld } from './components/hello-world/hello-world';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HelloWorld],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
