import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.html',
})
export class HelloWorld {
  private readonly api = inject(ApiService);

  protected readonly hello = rxResource({ stream: () => this.api.getHello() });
}
