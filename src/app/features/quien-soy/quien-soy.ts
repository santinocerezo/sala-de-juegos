import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { GithubService } from '../../core/services/github.service';

@Component({
  selector: 'app-quien-soy',
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.scss',
})
export class QuienSoy {
  private readonly github = inject(GithubService);

  protected readonly user = toSignal(
    this.github.getUser('santinocerezo'),
    { initialValue: undefined }
  );
}
